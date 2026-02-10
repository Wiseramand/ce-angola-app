
import pkg from 'pg';
const { Pool } = pkg;

// Configuração de ambiente para Neon/Postgres
const connectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_URL_NON_POOLING;

// Singleton do Pool para evitar exaustão de conexões em Serverless (Vercel)
let pool;
if (!pool && connectionString) {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10, // Ideal para Vercel/Neon Free
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

async function initDatabase() {
  if (!pool) throw new Error('Database connection string is missing');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Configuração do Sistema
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY,
        public_url TEXT DEFAULT '',
        public_server TEXT DEFAULT '',
        public_key TEXT DEFAULT '',
        public_title TEXT DEFAULT 'LoveWorld TV Angola',
        public_description TEXT DEFAULT 'Direto Grátis',
        private_url TEXT DEFAULT '',
        private_server TEXT DEFAULT '',
        private_key TEXT DEFAULT '',
        private_title TEXT DEFAULT 'Acesso Exclusivo',
        private_description TEXT DEFAULT 'Conteúdo reservado',
        is_private_mode BOOLEAN DEFAULT false
      )
    `);

    // Tabela de Membros (Gerados pelo Admin)
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de Visitantes (Registos Públicos)
    await client.query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id SERIAL PRIMARY KEY,
        fullname TEXT,
        email TEXT,
        phone TEXT,
        country TEXT,
        gender TEXT,
        profile_picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Chat
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        username TEXT,
        text TEXT,
        channel TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Garantir que a linha de configuração existe
    const configCheck = await client.query('SELECT id FROM system_config WHERE id = 1');
    if (configCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO system_config (id, public_title, public_description)
        VALUES (1, 'LoveWorld TV Angola', 'Transmissão Oficial')
      `);
    }

    // Garantir Admin Master
    await client.query(`
      INSERT INTO managed_users (fullname, username, password, role)
      VALUES ('Administrador Master', 'master_admin', 'angola_faith_2025', 'admin')
      ON CONFLICT (username) DO NOTHING
    `);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
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

  if (!connectionString) {
    return res.status(500).json({ error: 'DATABASE_URL_MISSING', details: 'A variável de ambiente DATABASE_URL não está configurada.' });
  }

  try {
    // Inicialização segura
    await initDatabase();

    // ROTA: OBTER CONFIGURAÇÕES
    if (path === '/api/system' && method === 'GET') {
      const result = await pool.query('SELECT * FROM system_config WHERE id = 1');
      return res.status(200).json(result.rows[0]);
    }

    // ROTA: ATUALIZAR CONFIGURAÇÕES (BOTÃO PUBLICAR)
    if (path === '/api/system' && method === 'POST') {
      const c = req.body;
      if (!c) return res.status(400).json({ error: 'MISSING_BODY' });

      const query = `
        UPDATE system_config SET 
        public_url=$1, public_server=$2, public_key=$3, public_title=$4, public_description=$5, 
        private_url=$6, private_server=$7, private_key=$8, private_title=$9, private_description=$10, 
        is_private_mode=$11 WHERE id=1
      `;
      const values = [
        c.public_url || '', c.public_server || '', c.public_key || '', c.public_title || '', c.public_description || '', 
        c.private_url || '', c.private_server || '', c.private_key || '', c.private_title || '', c.private_description || '', 
        !!c.is_private_mode
      ];

      const result = await pool.query(query, values);
      if (result.rowCount === 0) {
        return res.status(500).json({ error: 'UPDATE_FAILED', details: 'Não foi possível encontrar a linha de configuração (ID 1).' });
      }
      return res.status(200).json({ success: true });
    }

    // ROTA: LOGIN (MEMBROS E ADMIN)
    if (path === '/api/login' && method === 'POST') {
      const { username, pass } = req.body;
      if (!username || !pass) return res.status(400).json({ error: 'CREDENTIALS_REQUIRED' });

      const normalizedUsername = username.toLowerCase().trim();
      const result = await pool.query(
        'SELECT * FROM managed_users WHERE username = $1 AND password = $2', 
        [normalizedUsername, pass]
      );
      
      if (result.rows.length > 0) {
        const u = result.rows[0];
        if (u.status === 'blocked') return res.status(403).json({ error: 'BLOCKED', details: 'Acesso bloqueado pela administração.' });
        
        const newSessionId = Math.random().toString(36).substring(2) + Date.now();
        await pool.query('UPDATE managed_users SET last_session_id = $1 WHERE id = $2', [newSessionId, u.id]);
        
        return res.status(200).json({ 
          id: 'm-' + u.id, 
          fullName: u.fullname, 
          username: u.username, 
          email: u.email || '',
          phone: u.phone || '',
          country: 'Angola', 
          role: u.role, 
          sessionId: newSessionId,
          hasLiveAccess: true 
        });
      }
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', details: 'ID de utilizador ou senha incorretos.' });
    }

    // ROTA: REGISTO PÚBLICO
    if (path === '/api/register' && method === 'POST') {
      const { fullName, email, phone, country, gender, profilePicture } = req.body;
      const result = await pool.query(
        'INSERT INTO visitors (fullname, email, phone, country, gender, profile_picture) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [fullName, email, phone, country, gender, profilePicture]
      );
      return res.status(200).json({ id: 'v-' + result.rows[0].id, success: true });
    }

    // ROTA: HEARTBEAT (CONTROLO DE SESSÃO ÚNICA)
    if (path === '/api/heartbeat' && method === 'POST') {
      const { userId, sessionId } = req.body;
      if (!userId || !sessionId) return res.status(400).json({ error: 'PARAMS_REQUIRED' });
      
      const cleanId = userId.replace('m-', '');
      const result = await pool.query('SELECT last_session_id, status FROM managed_users WHERE id = $1', [cleanId]);
      
      if (result.rows.length === 0 || result.rows[0].status === 'blocked' || result.rows[0].last_session_id !== sessionId) {
        return res.status(401).json({ error: 'SESSION_INVALID' });
      }
      return res.status(200).json({ status: 'active' });
    }

    // ROTAS ADMIN: LISTAR MEMBROS
    if (path === '/api/admin/users' && method === 'GET') {
      const result = await pool.query("SELECT id, fullname as name, username, email, status, phone, password FROM managed_users WHERE role != 'admin' ORDER BY id DESC");
      return res.status(200).json(result.rows);
    }

    // ROTAS ADMIN: LISTAR VISITANTES
    if (path === '/api/admin/visitors' && method === 'GET') {
      const result = await pool.query("SELECT * FROM visitors ORDER BY created_at DESC");
      return res.status(200).json(result.rows);
    }

    // ROTAS ADMIN: CRIAR MEMBRO EXCLUSIVO
    if (path === '/api/admin/users/create' && method === 'POST') {
      const { fullname, username, password, email, phone } = req.body;
      const normalizedUsername = username.toLowerCase().trim();
      const check = await pool.query('SELECT id FROM managed_users WHERE username = $1', [normalizedUsername]);
      if (check.rows.length > 0) return res.status(400).json({ error: 'USERNAME_TAKEN', details: 'Este ID de acesso já existe.' });

      await pool.query(
        'INSERT INTO managed_users (fullname, username, password, email, phone, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [fullname, normalizedUsername, password, email || '', phone || '', 'active']
      );
      return res.status(200).json({ success: true });
    }

    // ROTA: CHAT
    if (path === '/api/chat' && method === 'GET') {
      const channel = urlParams.get('channel') || 'public';
      const result = await pool.query('SELECT * FROM chat_messages WHERE channel = $1 ORDER BY timestamp DESC LIMIT 50', [channel]);
      return res.status(200).json(result.rows.reverse());
    }

    if (path === '/api/chat' && method === 'POST') {
      const { userId, username, text, channel } = req.body;
      await pool.query('INSERT INTO chat_messages (user_id, username, text, channel) VALUES ($1, $2, $3, $4)', [userId, username, text, channel]);
      return res.status(200).json({ success: true });
    }

    // ROTAS ADMIN: STATUS/DELETE
    if (path === '/api/admin/users/status' && method === 'POST') {
      const { id, status } = req.body;
      const newStatus = status === 'active' ? 'blocked' : 'active';
      await pool.query('UPDATE managed_users SET status = $1, last_session_id = NULL WHERE id = $2', [newStatus, id]);
      return res.status(200).json({ success: true });
    }
    if (path === '/api/admin/users/delete' && method === 'POST') {
      const { id } = req.body;
      await pool.query('DELETE FROM managed_users WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(404).json({ error: 'NOT_FOUND' });
  } catch (error) {
    console.error('[API Error]:', error);
    return res.status(500).json({ error: 'SERVER_ERROR', details: error.message });
  }
}
