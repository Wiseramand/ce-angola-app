
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

let isDbInitialized = false;

async function initDatabase() {
  if (!pool) throw new Error('Database connection string is missing');
  if (isDbInitialized) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY,
        public_url TEXT DEFAULT '',
        public_title TEXT DEFAULT 'LoveWorld TV Angola',
        public_description TEXT DEFAULT 'Direto Grátis',
        private_url TEXT DEFAULT '',
        private_title TEXT DEFAULT 'Acesso Exclusivo',
        private_description TEXT DEFAULT 'Conteúdo reservado',
        is_private_mode BOOLEAN DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS managed_users (
        id SERIAL PRIMARY KEY,
        fullname TEXT,
        username TEXT UNIQUE,
        password TEXT,
        email TEXT,
        phone TEXT,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'active',
        last_session_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS visitors (
        id SERIAL PRIMARY KEY,
        fullname TEXT,
        email TEXT,
        phone TEXT,
        country TEXT,
        city TEXT,
        neighborhood TEXT,
        address TEXT,
        gender TEXT,
        profile_picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        username TEXT,
        text TEXT,
        channel TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        amount NUMERIC,
        method TEXT,
        type TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Garante colunas de migração
    await client.query(`
      ALTER TABLE visitors ADD COLUMN IF NOT EXISTS city TEXT;
      ALTER TABLE visitors ADD COLUMN IF NOT EXISTS neighborhood TEXT;
    `);

    await client.query(`
      INSERT INTO system_config (id, public_title) VALUES (1, 'LoveWorld TV Angola') ON CONFLICT DO NOTHING;
      INSERT INTO managed_users (fullname, username, password, role) 
      VALUES ('Administrador Master', 'master_admin', 'angola_faith_2025', 'admin') 
      ON CONFLICT (username) DO NOTHING;
    `);

    await client.query('COMMIT');
    isDbInitialized = true;
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[DB Critical Error]:', e);
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
        public_url=$1, public_title=$2, public_description=$3, 
        private_url=$4, private_title=$5, private_description=$6, 
        is_private_mode=$7 WHERE id=1`,
        [c.public_url||'', c.public_title||'', c.public_description||'', 
         c.private_url||'', c.private_title||'', c.private_description||'', 
         !!c.is_private_mode]
      );
      return res.status(200).json({ success: true });
    }

    if (path === '/api/register' && method === 'POST') {
      const b = req.body;
      const insertQuery = `
        INSERT INTO visitors (fullname, email, phone, country, city, neighborhood, address, gender, profile_picture) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
      // Garante que nenhum valor seja undefined ao enviar para o PostgreSQL
      await pool.query(insertQuery, [
        b.fullName || 'N/A', 
        b.email || '', 
        b.phone || '', 
        b.country || 'Angola', 
        b.city || '', 
        b.neighborhood || '', 
        b.address || '', 
        b.gender || 'Male', 
        b.profilePicture || ''
      ]);
      return res.status(200).json({ success: true });
    }

    if (path === '/api/login' && method === 'POST') {
      const { username, pass } = req.body;
      const query = 'SELECT * FROM managed_users WHERE username = $1 AND password = $2';
      const result = await pool.query(query, [username.toLowerCase().trim(), pass]);
      if (result.rows.length > 0) {
        const u = result.rows[0];
        if (u.status === 'blocked') return res.status(403).json({ error: 'BLOCKED' });
        const sess = Math.random().toString(36).substring(2);
        await pool.query('UPDATE managed_users SET last_session_id = $1 WHERE id = $2', [sess, u.id]);
        return res.status(200).json({ id: 'm-'+u.id, fullName: u.fullname, username: u.username, role: u.role, sessionId: sess, hasLiveAccess: true });
      }
      return res.status(401).json({ error: 'INVALID' });
    }

    if (path === '/api/heartbeat' && method === 'POST') {
      const { userId, sessionId } = req.body;
      if (!userId || !sessionId || userId.startsWith('v-')) return res.status(200).json({ status: 'ok' });
      const cleanId = userId.replace('m-', '');
      const result = await pool.query('SELECT last_session_id FROM managed_users WHERE id = $1', [cleanId]);
      if (result.rows.length > 0 && result.rows[0].last_session_id !== sessionId) {
        return res.status(401).json({ error: 'SESSION_EXPIRED' });
      }
      return res.status(200).json({ status: 'ok' });
    }

    if (path === '/api/admin/users' && method === 'GET') {
      const r = await pool.query("SELECT id, fullname as name, username, status, password, email, phone FROM managed_users WHERE role != 'admin' ORDER BY created_at DESC");
      return res.status(200).json(r.rows);
    }

    if (path === '/api/admin/users/create' && method === 'POST') {
      const { fullname, username, password, email, phone } = req.body;
      await pool.query('INSERT INTO managed_users (fullname, username, password, email, phone) VALUES ($1, $2, $3, $4, $5)', [fullname, username.toLowerCase().trim(), password, email, phone]);
      return res.status(200).json({ success: true });
    }

    if (path === '/api/admin/visitors' && method === 'GET') {
      const r = await pool.query("SELECT * FROM visitors ORDER BY created_at DESC");
      return res.status(200).json(r.rows);
    }

    if (path === '/api/payments/process' && method === 'POST') {
      const { userId, userName, amount, method: payMethod, type, description } = req.body;
      await pool.query('INSERT INTO payments (user_id, user_name, amount, method, type, description) VALUES ($1, $2, $3, $4, $5, $6)', [userId, userName, amount, payMethod, type, description]);
      return res.status(200).json({ success: true });
    }

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
    console.error('[API Handler Error]:', error);
    return res.status(500).json({ error: 'SERVER_ERROR', details: error.message });
  }
}
