
import pkg from 'pg';
const { Pool } = pkg;

// Initialize a single pool instance to be reused across invocations
let pool;
if (!pool) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

export default async function handler(req, res) {
  const { method } = req;
  const path = req.url.split('?')[0];

  // Set default content type to JSON
  res.setHeader('Content-Type', 'application/json');

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'DATABASE_URL environment variable is missing' });
    }

    // 1. SYSTEM CONFIG (GET/POST)
    if (path === '/api/system' && method === 'GET') {
      const result = await pool.query('SELECT * FROM system_config WHERE id = 1');
      const data = result.rows[0] || {
        public_url: '',
        public_title: 'LoveWorld TV Angola',
        public_description: 'Transmissão pública e gratuita.',
        private_url: '',
        private_title: 'Conferência Ministerial',
        private_description: 'Acesso restrito para parceiros.',
        is_private_mode: false
      };
      return res.status(200).json(data);
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

    // 2. AUTH
    if (path === '/api/login' && method === 'POST') {
      const { username, pass } = req.body;
      const result = await pool.query(
        'SELECT * FROM managed_users WHERE username = $1 AND password = $2 AND status = $3',
        [username, pass, 'active']
      );
      if (result.rows.length > 0) {
        const user = result.rows[0];
        return res.status(200).json({ 
          id: user.id, 
          fullName: user.fullname, 
          username: user.username,
          role: 'user',
          hasLiveAccess: true 
        });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. ADMIN USERS (GET/POST/PUT/DELETE)
    if (path === '/api/admin/users' && method === 'GET') {
      const result = await pool.query('SELECT id, fullname as name, username, password, status FROM managed_users ORDER BY created_at DESC');
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

    if (path.startsWith('/api/admin/users/') && method === 'PUT') {
      const id = path.split('/').pop();
      const { name, username, password } = req.body;
      await pool.query(
        'UPDATE managed_users SET fullname = $1, username = $2, password = $3 WHERE id = $4',
        [name, username, password, id]
      );
      return res.status(200).json({ success: true });
    }

    if (path.startsWith('/api/admin/users/') && method === 'DELETE') {
      const id = path.split('/').pop();
      await pool.query('DELETE FROM managed_users WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(404).json({ error: 'Endpoint not found', path });
  } catch (error) {
    console.error('API Server Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message 
    });
  }
}
