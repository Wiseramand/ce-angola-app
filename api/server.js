
import pkg from 'pg';
const { Pool } = pkg;

// A variável DATABASE_URL deve ser configurada no painel do Vercel
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  const { method, query } = req;
  const path = req.url.split('?')[0];

  try {
    // 1. GET SYSTEM CONFIG
    if (path === '/api/system' && method === 'GET') {
      const result = await pool.query('SELECT * FROM system_config WHERE id = 1');
      return res.status(200).json(result.rows[0]);
    }

    // 2. UPDATE SYSTEM CONFIG (Admin Only)
    if (path === '/api/system' && method === 'POST') {
      const { publicUrl, privateUrl, isPrivateMode } = req.body;
      await pool.query(
        'UPDATE system_config SET public_url = $1, private_url = $2, is_private_mode = $3 WHERE id = 1',
        [publicUrl, privateUrl, isPrivateMode]
      );
      return res.status(200).json({ success: true });
    }

    // 3. LOGIN MANAGED USER
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

    // 4. ADMIN USERS MANAGEMENT
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

    if (path.startsWith('/api/admin/users/') && method === 'DELETE') {
      const id = path.split('/').pop();
      await pool.query('DELETE FROM managed_users WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(404).json({ error: 'Not Found' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database Error', details: error.message });
  }
}
