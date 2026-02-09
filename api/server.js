
import pkg from 'pg';
const { Pool } = pkg;

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
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  } catch (err) {
    console.error('Erro ao inicializar o Pool:', err);
  }
}

async function ensureTables() {
  if (!pool) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
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
    
    // Inserir dados iniciais com link padrão da LoveWorld se a tabela estiver vazia
    await client.query(`
      INSERT INTO system_config (id, public_url, public_title, public_description, is_private_mode)
      SELECT 1, 'https://www.youtube.com/live/SQU60r_3HTo', 'LoveWorld TV Angola', 'Transmissão pública e gratuita de esperança e fé.', false
      WHERE NOT EXISTS (SELECT 1 FROM system_config WHERE id = 1)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS managed_users (
        id SERIAL PRIMARY KEY,
        fullname TEXT,
        username TEXT UNIQUE,
        password TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Falha crítica na criação das tabelas:', e);
    throw e;
  } finally {
    client.release();
  }
}

export default async function handler(req, res) {
  const { method } = req;
  const path = req.url.split('?')[0];
  res.setHeader('Content-Type', 'application/json');

  if (!connectionString) {
    return res.status(500).json({ 
      error: 'DB_NOT_CONFIGURED',
      message: 'Base de Dados não detetada nas variáveis de ambiente.'
    });
  }

  try {
    await ensureTables();

    if (path === '/api/system' && method === 'GET') {
      const result = await pool.query('SELECT * FROM system_config WHERE id = 1');
      return res.status(200).json(result.rows[0]);
    }

    if (path === '/api/system' && method === 'POST') {
      const { 
        publicUrl, publicTitle, publicDescription,
        privateUrl, privateTitle, privateDescription, 
        isPrivateMode 
      } = req.body;
      
      await pool.query(
        `UPDATE system_config SET 
          public_url = $1, public_title = $2, public_description = $3,
          private_url = $4, private_title = $5, private_description = $6,
          is_private_mode = $7 
        WHERE id = 1`,
        [publicUrl, publicTitle, publicDescription, privateUrl, privateTitle, privateDescription, isPrivateMode]
      );
      return res.status(200).json({ success: true });
    }

    if (path === '/api/login' && method === 'POST') {
      const { username, pass } = req.body;
      const result = await pool.query(
        'SELECT * FROM managed_users WHERE username = $1 AND password = $2 AND status = $3',
        [username, pass, 'active']
      );
      
      if (result.rows.length > 0) {
        const u = result.rows[0];
        return res.status(200).json({ 
          id: u.id.toString(), 
          fullName: u.fullname, 
          username: u.username,
          role: 'user',
          hasLiveAccess: true 
        });
      }
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Utilizador ou senha incorretos.' });
    }

    if (path === '/api/admin/users' && method === 'GET') {
      const result = await pool.query('SELECT id, fullname as name, username, password FROM managed_users ORDER BY id DESC');
      return res.status(200).json(result.rows);
    }

    if (path === '/api/admin/users' && method === 'POST') {
      const { name, username, password } = req.body;
      await pool.query(
        'INSERT INTO managed_users (fullname, username, password) VALUES ($1, $2, $3)',
        [name, username, password]
      );
      return res.status(201).json({ success: true });
    }

    if (path.startsWith('/api/admin/users/') && method === 'DELETE') {
      const id = path.split('/').pop();
      await pool.query('DELETE FROM managed_users WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }

    if (path.startsWith('/api/admin/users/') && method === 'PUT') {
      const id = path.split('/').pop();
      const { name, username, password } = req.body;
      await pool.query(
        'UPDATE managed_users SET fullname = $1, username = $2, password = $3 WHERE id = $4',
        [name, username, password, id]
      );
      return res.status(200).json({ success: true });
    }

    return res.status(404).json({ error: 'NOT_FOUND' });
  } catch (error) {
    console.error('Erro de Execução na API:', error);
    return res.status(500).json({ error: 'EXECUTION_ERROR', message: error.message });
  }
}
