
import pkg from 'pg';
const { Pool } = pkg;
import { v4 as uuidv4 } from 'uuid';

const connectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_URL_NON_POOLING;

let pool;

if (connectionString) {
  try {
    pool = new Pool({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false },
      max: 20,
    });
  } catch (err) {
    console.error('[DB] Pool Error:', err);
  }
}

async function initDatabase() {
  if (!pool) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Configuração do Sistema
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY,
        public_url TEXT,
        public_title TEXT,
        public_description TEXT,
        private_url TEXT,
        private_title TEXT,
        private_description TEXT,
        is_private_mode BOOLEAN DEFAULT false
      )
    `);

    // Utilizadores com Controle de Sessão
    await client.query(`
      CREATE TABLE IF NOT EXISTS managed_users (
        id SERIAL PRIMARY KEY,
        fullname TEXT,
        username TEXT UNIQUE,
        email TEXT,
        phone TEXT,
        password TEXT,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'active',
        last_session_id TEXT,
        last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de Chat Persistente
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        username TEXT,
        text TEXT,
        channel TEXT, -- 'public' ou 'private'
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const configCheck = await client.query('SELECT id FROM system_config WHERE id = 1');
    if (configCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO system_config (id, public_title, public_description, private_title, private_description)
        VALUES (1, 'LoveWorld TV Angola', 'Emissão Gratuita', 'Conferência Ministerial', 'Acesso Reservado')
      `);
    }

    await client.query(`
      INSERT INTO managed_users (fullname, username, password, role)
      VALUES ('Administrador Master', 'master_admin', 'angola_faith_2025', 'admin')
      ON CONFLICT (username) DO NOTHING
    `);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[DB] Init Error:', e);
  } finally {
    client.release();
  }
}

export default async function handler(req, res) {
  const { method } = req;
  const path = req.url.split('?')[0];
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  res.setHeader('Content-Type', 'application/json');

  if (!connectionString) {
    return res.status(500).json({ error: 'DATABASE_URL_MISSING' });
  }

  try {
    await initDatabase();

    // --- CHAT API ---
    if (path === '/api/chat' && method === 'GET') {
      const channel = urlParams.get('channel') || 'public';
      const result = await pool.query(
        'SELECT * FROM chat_messages WHERE channel = $1 ORDER BY timestamp DESC LIMIT 50',
        [channel]
      );
      return res.status(200).json(result.rows.reverse());
    }

    if (path === '/api/chat' && method === 'POST') {
      const { userId, username, text, channel } = req.body;
      await pool.query(
        'INSERT INTO chat_messages (user_id, username, text, channel) VALUES ($1, $2, $3, $4)',
        [userId, username, text, channel]
      );
      return res.status(200).json({ success: true });
    }

    // --- HEARTBEAT & SESSION CHECK ---
    if (path === '/api/heartbeat' && method === 'POST') {
      const { userId, sessionId } = req.body;
      const result = await pool.query(
        'SELECT last_session_id FROM managed_users WHERE id = $1',
        [userId]
      );
      
      if (result.rows.length === 0 || result.rows[0].last_session_id !== sessionId) {
        return res.status(401).json({ error: 'SESSION_EXPIRED', message: 'Alguém entrou nesta conta noutro dispositivo.' });
      }

      await pool.query(
        'UPDATE managed_users SET last_heartbeat = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );
      return res.status(200).json({ status: 'alive' });
    }

    // --- LOGIN COM GERAÇÃO DE SESSÃO ÚNICA ---
    if (path === '/api/login' && method === 'POST') {
      const { username, pass } = req.body;
      const result = await pool.query(
        'SELECT * FROM managed_users WHERE username = $1 AND password = $2',
        [username, pass]
      );
      
      if (result.rows.length > 0) {
        const u = result.rows[0];
        if (u.status === 'blocked') return res.status(403).json({ error: 'BLOCKED' });
        
        const newSessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        await pool.query(
          'UPDATE managed_users SET last_session_id = $1 WHERE id = $2',
          [newSessionId, u.id]
        );

        return res.status(200).json({ 
          id: u.id, 
          fullName: u.fullname, 
          username: u.username, 
          role: u.role, 
          sessionId: newSessionId,
          hasLiveAccess: true 
        });
      }
      return res.status(401).json({ error: 'INVALID' });
    }

    // --- ADMIN SYSTEM CONFIG ---
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
        [c.publicUrl, c.publicTitle, c.publicDescription, c.privateUrl, c.privateTitle, c.privateDescription, c.isPrivateMode]
      );
      return res.status(200).json({ success: true });
    }

    // --- ADMIN USERS ---
    if (path === '/api/admin/users' && method === 'GET') {
      const result = await pool.query("SELECT id, fullname as name, username, email, status FROM managed_users WHERE role != 'admin' ORDER BY id DESC");
      return res.status(200).json(result.rows);
    }

    if (path.startsWith('/api/admin/users/status') && method === 'POST') {
      const { id, status } = req.body;
      const newStatus = status === 'active' ? 'blocked' : 'active';
      await pool.query('UPDATE managed_users SET status = $1, last_session_id = NULL WHERE id = $2', [newStatus, id]);
      return res.status(200).json({ success: true });
    }

    if (path.startsWith('/api/admin/users/delete') && method === 'POST') {
      const { id } = req.body;
      await pool.query('DELETE FROM managed_users WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(404).json({ error: 'NOT_FOUND' });
  } catch (error) {
    console.error('[API ERROR]', error);
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
}
