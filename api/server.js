
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  connectionTimeoutMillis: 2000,
});

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id SERIAL PRIMARY KEY,
        fullname TEXT, email TEXT, phone TEXT, country TEXT, city TEXT, neighborhood TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS managed_users (
        id SERIAL PRIMARY KEY,
        fullname TEXT, username TEXT UNIQUE, password TEXT,
        role TEXT DEFAULT 'user', status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY,
        public_url TEXT, public_title TEXT, is_private_mode BOOLEAN DEFAULT false,
        private_url TEXT, private_title TEXT, private_description TEXT
      );
      INSERT INTO system_config (id, public_title) VALUES (1, 'LoveWorld TV Angola') ON CONFLICT DO NOTHING;
    `);
  } catch (e) { console.error("DB Init Error:", e); }
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const path = req.url.split('?')[0];

  try {
    await initDb();

    // REGISTO DE VISITANTE (Sempre rápido)
    if (req.method === 'POST' && path.endsWith('/register')) {
      const b = req.body;
      await pool.query(
        "INSERT INTO visitors (fullname, email, phone, country, city, neighborhood) VALUES ($1, $2, $3, $4, $5, $6)",
        [b.fullName, b.email, b.phone, b.country, b.city, b.neighborhood]
      );
      return res.status(200).json({ success: true });
    }

    // GESTÃO DE MEMBROS (Criar Novo)
    if (req.method === 'POST' && path.endsWith('/admin/users')) {
      const { fullname, username, password } = req.body;
      await pool.query(
        "INSERT INTO managed_users (fullname, username, password) VALUES ($1, $2, $3) ON CONFLICT (username) DO UPDATE SET password = $3, fullname = $1",
        [fullname, username.toLowerCase().trim(), password]
      );
      return res.status(200).json({ success: true });
    }

    // LISTAR MEMBROS
    if (req.method === 'GET' && path.endsWith('/admin/users')) {
      const r = await pool.query("SELECT id, fullname as name, username, password, status FROM managed_users ORDER BY created_at DESC");
      return res.status(200).json(r.rows);
    }

    // LISTAR VISITANTES
    if (req.method === 'GET' && path.endsWith('/admin/visitors')) {
      const r = await pool.query("SELECT * FROM visitors ORDER BY created_at DESC");
      return res.status(200).json(r.rows);
    }

    // LOGIN DO PORTAL (Verifica DB)
    if (req.method === 'POST' && path.endsWith('/login')) {
      const { username, pass } = req.body;
      const normalized = username.toLowerCase().trim();
      
      // Admin Master fixo por segurança
      if (normalized === 'master_admin' && pass === 'angola_faith_2025') {
        return res.status(200).json({ role: 'admin', fullName: 'Super Admin', hasLiveAccess: true });
      }

      const r = await pool.query("SELECT * FROM managed_users WHERE username = $1 AND password = $2", [normalized, pass]);
      if (r.rows.length > 0) {
        return res.status(200).json({ id: 'm-'+r.rows[0].id, fullName: r.rows[0].fullname, role: 'user', hasLiveAccess: true });
      }
      return res.status(401).json({ error: 'Credenciais Inválidas' });
    }

    // CONFIGURAÇÕES DO SISTEMA
    if (req.method === 'GET' && path.endsWith('/system')) {
      const r = await pool.query("SELECT * FROM system_config WHERE id = 1");
      return res.status(200).json(r.rows[0]);
    }

    if (req.method === 'POST' && path.endsWith('/system')) {
      const c = req.body;
      await pool.query(
        "UPDATE system_config SET public_url=$1, public_title=$2, private_url=$3, is_private_mode=$4 WHERE id=1",
        [c.public_url, c.public_title, c.private_url, !!c.is_private_mode]
      );
      return res.status(200).json({ success: true });
    }

    return res.status(404).json({ error: 'Not Found' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro de Servidor' });
  }
}
