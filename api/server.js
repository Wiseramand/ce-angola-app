
import pkg from 'pg';
const { Pool } = pkg;

const connectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_URL_NON_POOLING;

let pool;
if (!pool && connectionString) {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });
}

async function initDatabase() {
  if (!pool) throw new Error('Database connection string is missing');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Criar tabelas base
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_config (id INTEGER PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS managed_users (id SERIAL PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS visitors (id SERIAL PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS chat_messages (id SERIAL PRIMARY KEY);
    `);

    // 2. Migrações de Colunas (Garante que colunas novas existam no Neon)
    const columns = [
      ['system_config', 'public_url', 'TEXT DEFAULT \'\''],
      ['system_config', 'public_server', 'TEXT DEFAULT \'\''],
      ['system_config', 'public_key', 'TEXT DEFAULT \'\''],
      ['system_config', 'public_title', 'TEXT DEFAULT \'LoveWorld TV Angola\''],
      ['system_config', 'public_description', 'TEXT DEFAULT \'Direto Grátis\''],
      ['system_config', 'private_url', 'TEXT DEFAULT \'\''],
      ['system_config', 'private_server', 'TEXT DEFAULT \'\''],
      ['system_config', 'private_key', 'TEXT DEFAULT \'\''],
      ['system_config', 'private_title', 'TEXT DEFAULT \'Acesso Exclusivo\''],
      ['system_config', 'private_description', 'TEXT DEFAULT \'Conteúdo reservado\''],
      ['system_config', 'is_private_mode', 'BOOLEAN DEFAULT false'],
      ['managed_users', 'fullname', 'TEXT'],
      ['managed_users', 'username', 'TEXT UNIQUE'],
      ['managed_users', 'password', 'TEXT'],
      ['managed_users', 'role', 'TEXT DEFAULT \'user\''],
      ['managed_users', 'status', 'TEXT DEFAULT \'active\''],
      ['managed_users', 'last_session_id', 'TEXT']
    ];

    for (const [table, col, type] of columns) {
      await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${type}`);
    }

    // 3. Dados Iniciais
    await client.query(`
      INSERT INTO system_config (id, public_title) VALUES (1, 'LoveWorld TV Angola') ON CONFLICT DO NOTHING;
      INSERT INTO managed_users (fullname, username, password, role) 
      VALUES ('Administrador Master', 'master_admin', 'angola_faith_2025', 'admin') 
      ON CONFLICT (username) DO NOTHING;
    `);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[DB Migration Error]:', e);
    throw e;
  } finally {
    client.release();
  }
}

export default async function handler(req, res) {
  const { method } = req;
  const path = req.url.split('?')[0];
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  res.setHeader('Content-Type', 'application/json');

  try {
    await initDatabase();

    if (path === '/api/system' && method === 'GET') {
      const result = await pool.query('SELECT * FROM system_config WHERE id = 1');
      return res.status(200).json(result.rows[0]);
    }

    if (path === '/api/system' && method === 'POST') {
      const c = req.body;
      await pool.query(
        `UPDATE system_config SET 
        public_url=$1, public_server=$2, public_key=$3, public_title=$4, public_description=$5, 
        private_url=$6, private_server=$7, private_key=$8, private_title=$9, private_description=$10, 
        is_private_mode=$11 WHERE id=1`,
        [c.public_url||'', c.public_server||'', c.public_key||'', c.public_title||'', c.public_description||'', 
         c.private_url||'', c.private_server||'', c.private_key||'', c.private_title||'', c.private_description||'', 
         !!c.is_private_mode]
      );
      return res.status(200).json({ success: true });
    }

    if (path === '/api/login' && method === 'POST') {
      const { username, pass } = req.body;
      const result = await pool.query('SELECT * FROM managed_users WHERE username = $1 AND password = $2', [username.toLowerCase().trim(), pass]);
      if (result.rows.length > 0) {
        const u = result.rows[0];
        if (u.status === 'blocked') return res.status(403).json({ error: 'BLOCKED' });
        const sess = Math.random().toString(36).substring(2);
        await pool.query('UPDATE managed_users SET last_session_id = $1 WHERE id = $2', [sess, u.id]);
        return res.status(200).json({ id: 'm-'+u.id, fullName: u.fullname, username: u.username, role: u.role, sessionId: sess, hasLiveAccess: true });
      }
      return res.status(401).json({ error: 'INVALID' });
    }

    // Rotas de listagem (Admin)
    if (path === '/api/admin/users' && method === 'GET') {
      const r = await pool.query("SELECT id, fullname as name, username, status, password FROM managed_users WHERE role != 'admin'");
      return res.status(200).json(r.rows);
    }
    if (path === '/api/admin/visitors' && method === 'GET') {
      const r = await pool.query("SELECT * FROM visitors ORDER BY created_at DESC");
      return res.status(200).json(r.rows);
    }

    // Chat
    if (path === '/api/chat' && method === 'GET') {
      const chan = urlParams.get('channel') || 'public';
      const r = await pool.query('SELECT * FROM chat_messages WHERE channel = $1 ORDER BY timestamp DESC LIMIT 50', [chan]);
      return res.status(200).json(r.rows.reverse());
    }
    if (path === '/api/chat' && method === 'POST') {
      const { userId, username, text, channel } = req.body;
      await pool.query('INSERT INTO chat_messages (user_id, username, text, channel) VALUES ($1, $2, $3, $4)', [userId, username, text, channel]);
      return res.status(200).json({ success: true });
    }

    return res.status(404).json({ error: 'NOT_FOUND' });
  } catch (error) {
    return res.status(500).json({ error: 'SERVER_ERROR', details: error.message });
  }
}
