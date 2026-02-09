
import pkg from 'pg';
const { Pool } = pkg;

// O código agora procura por QUALQUER um destes nomes comuns de variáveis
const connectionString = 
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DB_URL;

let pool;
if (connectionString) {
  pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000 // 5 segundos de limite para não travar o server
  });
}

async function ensureTables() {
  if (!pool) return;
  const client = await pool.connect();
  try {
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
    
    await client.query(`
      INSERT INTO system_config (id, public_title, public_description)
      SELECT 1, 'LoveWorld TV Angola', 'Transmissão pública'
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
      message: 'Nenhuma URL de banco de dados foi encontrada.',
      hint: 'Verifique se o nome da variável na Vercel é DATABASE_URL'
    });
  }

  try {
    await ensureTables();

    // GET SYSTEM
    if (path === '/api/system' && method === 'GET') {
      const result = await pool.query('SELECT * FROM system_config WHERE id = 1');
      return res.status(200).json(result.rows[0]);
    }

    // POST SYSTEM
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

    // AUTH LOGIN
    if (path === '/api/login' && method === 'POST') {
      const { username, pass } = req.body;
      const result = await pool.query(
        'SELECT * FROM managed_users WHERE username = $1 AND password = $2 AND status = $3',
        [username, pass, 'active']
      );
      if (result.rows.length > 0) {
        return res.status(200).json({ 
          id: result.rows[0].id.toString(), 
          fullName: result.rows[0].fullname, 
          username: result.rows[0].username,
          role: 'user',
          hasLiveAccess: true 
        });
      }
      return res.status(401).json({ error: 'Incorreto' });
    }

    // ADMIN USERS
    if (path === '/api/admin/users') {
      if (method === 'GET') {
        const result = await pool.query('SELECT id, fullname as name, username, password FROM managed_users ORDER BY id DESC');
        return res.status(200).json(result.rows);
      }
      if (method === 'POST') {
        const { name, username, password } = req.body;
        await pool.query('INSERT INTO managed_users (fullname, username, password) VALUES ($1, $2, $3)', [name, username, password]);
        return res.status(201).json({ success: true });
      }
    }

    if (path.startsWith('/api/admin/users/') && method === 'DELETE') {
      const id = path.split('/').pop();
      await pool.query('DELETE FROM managed_users WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(404).json({ error: 'Not Found' });
  } catch (error) {
    return res.status(500).json({ 
      error: 'DB_CONNECTION_ERROR', 
      message: error.message,
      detail: 'A URL existe, mas o banco de dados recusou a conexão ou está offline.'
    });
  }
}
