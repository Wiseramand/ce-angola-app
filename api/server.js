
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
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id TEXT, username TEXT, text TEXT, channel TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY,
        public_url TEXT, public_title TEXT, public_description TEXT,
        private_url TEXT, private_title TEXT, private_description TEXT,
        is_private_mode BOOLEAN DEFAULT false
      );
      INSERT INTO system_config (id, public_title) VALUES (1, 'LoveWorld TV Angola') ON CONFLICT DO NOTHING;
    `);
  } catch (e) { console.error("DB Init Error:", e); }
};

// Auxiliar para ler o corpo da requisição de forma robusta
async function getRequestBody(req) {
  if (req.body && Object.keys(req.body).length > 0) return req.body;
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const urlParts = req.url.split('?');
  const path = urlParts[0];
  const queryParams = new URLSearchParams(urlParts[1] || '');

  try {
    await initDb();

    // ENDPOINT CHAT
    if (path.endsWith('/chat')) {
      if (req.method === 'GET') {
        const channel = queryParams.get('channel') || 'public';
        const r = await pool.query(
          "SELECT id, user_id, username, text, channel, created_at as timestamp FROM chat_messages WHERE channel = $1 ORDER BY created_at ASC LIMIT 150",
          [channel]
        );
        return res.status(200).json(r.rows);
      }
      if (req.method === 'POST') {
        const body = await getRequestBody(req);
        const { userId, username, text, channel } = body;
        
        if (!text || !userId) {
          return res.status(400).json({ error: 'Campos obrigatórios em falta' });
        }
        
        await pool.query(
          "INSERT INTO chat_messages (user_id, username, text, channel) VALUES ($1, $2, $3, $4)",
          [userId, username, text, channel || 'public']
        );
        return res.status(200).json({ success: true });
      }
    }

    // REGISTO DE VISITANTE
    if (req.method === 'POST' && path.endsWith('/register')) {
      const b = await getRequestBody(req);
      await pool.query(
        "INSERT INTO visitors (fullname, email, phone, country, city, neighborhood) VALUES ($1, $2, $3, $4, $5, $6)",
        [b.fullName, b.email, b.phone, b.country, b.city, b.neighborhood]
      );
      return res.status(200).json({ success: true });
    }

    // LOGIN DE MEMBROS
    if (req.method === 'POST' && path.endsWith('/login')) {
      const { username, pass } = await getRequestBody(req);
      const normalized = username?.toLowerCase().trim();
      
      if (normalized === 'master_admin' && pass === 'angola_faith_2025') {
        return res.status(200).json({ id: 'admin-1', role: 'admin', fullName: 'Super Admin', hasLiveAccess: true });
      }

      const r = await pool.query("SELECT * FROM managed_users WHERE username = $1 AND password = $2", [normalized, pass]);
      if (r.rows.length > 0) {
        return res.status(200).json({ 
          id: 'm-' + r.rows[0].id, 
          fullName: r.rows[0].fullname, 
          role: 'user', 
          hasLiveAccess: true,
          country: 'Angola' 
        });
      }
      return res.status(401).json({ error: 'Credenciais Inválidas' });
    }

    // ADMIN: VISITANTES
    if (req.method === 'GET' && path.endsWith('/admin/visitors')) {
      const r = await pool.query("SELECT * FROM visitors ORDER BY created_at DESC");
      return res.status(200).json(r.rows);
    }

    // ADMIN: GESTÃO DE USUÁRIOS
    if (path.endsWith('/admin/users')) {
      if (req.method === 'GET') {
        const r = await pool.query("SELECT id, fullname as name, username, password FROM managed_users ORDER BY created_at DESC");
        return res.status(200).json(r.rows);
      }
      if (req.method === 'POST') {
        const { fullname, username, password } = await getRequestBody(req);
        await pool.query(
          "INSERT INTO managed_users (fullname, username, password) VALUES ($1, $2, $3) ON CONFLICT (username) DO UPDATE SET password = $3, fullname = $1",
          [fullname, username.toLowerCase().trim(), password]
        );
        return res.status(200).json({ success: true });
      }
    }

    // SISTEMA / CONFIG
    if (path.endsWith('/system')) {
      if (req.method === 'GET') {
        const r = await pool.query("SELECT * FROM system_config WHERE id = 1");
        return res.status(200).json(r.rows[0]);
      }
      if (req.method === 'POST') {
        const c = await getRequestBody(req);
        await pool.query(
          "UPDATE system_config SET public_url=$1, public_title=$2, public_description=$3, private_url=$4, private_title=$5, private_description=$6, is_private_mode=$7 WHERE id=1",
          [c.public_url, c.public_title, c.public_description, c.private_url, c.private_title, c.private_description, !!c.is_private_mode]
        );
        return res.status(200).json({ success: true });
      }
    }

    return res.status(404).json({ error: 'Not Found' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro de Servidor' });
  }
}
