
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
        public_url TEXT, public_url2 TEXT, public_title TEXT, public_description TEXT,
        private_url TEXT, private_url2 TEXT, private_title TEXT, private_description TEXT,
        is_private_mode BOOLEAN DEFAULT false
      );
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO system_config (id, public_title) VALUES (1, 'LoveWorld TV Angola') ON CONFLICT DO NOTHING;
    `);
  } catch (e) { console.error("DB Init Error:", e); }
};

async function getRequestBody(req) {
  // Se o body já foi parseado pelo Vercel
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) return req.body;

  // Caso contrário, lê o stream manualmente
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', (err) => reject(err));
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

    // HEARTBEAT (Sessões Ativas)
    if (path.endsWith('/heartbeat')) {
      if (req.method === 'POST') {
        const { userId, sessionId } = await getRequestBody(req);
        if (sessionId) {
          await pool.query(
            "INSERT INTO sessions (id, user_id, last_seen) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (id) DO UPDATE SET last_seen = CURRENT_TIMESTAMP",
            [sessionId, String(userId || 'visitor')]
          );
          return res.status(200).json({ success: true });
        }
        return res.status(400).json({ error: 'Session ID required' });
      }
    }

    // CHAT INTERATIVO
    if (path.endsWith('/chat')) {
      if (req.method === 'GET') {
        const channel = queryParams.get('channel') || 'public';
        const r = await pool.query(
          "SELECT id::text, user_id, username, text, channel, created_at as timestamp FROM chat_messages WHERE channel = $1 ORDER BY created_at ASC LIMIT 100",
          [channel]
        );
        return res.status(200).json(r.rows);
      }

      if (req.method === 'POST') {
        const body = await getRequestBody(req);
        const { userId, username, text, channel } = body;

        if (!text || !userId) {
          return res.status(400).json({ error: 'Dados insuficientes para enviar mensagem' });
        }

        await pool.query(
          "INSERT INTO chat_messages (user_id, username, text, channel) VALUES ($1, $2, $3, $4)",
          [String(userId), String(username), String(text), String(channel || 'public')]
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

    // LOGIN DE MEMBROS (Inclui Admin Master)
    if (req.method === 'POST' && path.endsWith('/login')) {
      const { email, password } = await getRequestBody(req);
      const normalized = email?.toLowerCase().trim();

      if (normalized === 'master_admin' && password === 'angola_faith_2025') {
        return res.status(200).json({ user: { id: 'admin-1', role: 'admin', fullName: 'Administrador Master', hasLiveAccess: true } });
      }

      const r = await pool.query("SELECT * FROM managed_users WHERE username = $1 AND password = $2", [normalized, password]);
      if (r.rows.length > 0) {
        const sessionId = Math.random().toString(36).substring(2, 15);
        return res.status(200).json({
          user: {
            id: 'm-' + r.rows[0].id,
            fullName: r.rows[0].fullname,
            role: 'user',
            hasLiveAccess: true,
            country: 'Angola',
            sessionId: sessionId
          }
        });
      }
      return res.status(401).json({ error: 'ID ou Senha incorretos' });
    }

    // OUTROS ENDPOINTS (Admin & System)
    if (req.method === 'GET' && path.endsWith('/admin/visitors')) {
      const r = await pool.query("SELECT * FROM visitors ORDER BY created_at DESC");
      return res.status(200).json(r.rows);
    }

    if (path.endsWith('/admin/users')) {
      if (req.method === 'GET') {
        const r = await pool.query("SELECT id::text, fullname as name, username, password FROM managed_users ORDER BY created_at DESC");
        return res.status(200).json(r.rows);
      }
      if (req.method === 'POST') {
        const { id, fullname, username, password } = await getRequestBody(req);
        if (id) {
          // Update existing
          const numericId = id.startsWith('m-') ? id.substring(2) : id;
          await pool.query(
            "UPDATE managed_users SET fullname = $1, username = $2, password = $3 WHERE id = $4",
            [fullname, username.toLowerCase().trim(), password, numericId]
          );
        } else {
          // Insert new
          await pool.query(
            "INSERT INTO managed_users (fullname, username, password) VALUES ($1, $2, $3) ON CONFLICT (username) DO UPDATE SET password = $3, fullname = $1",
            [fullname, username.toLowerCase().trim(), password]
          );
        }
        return res.status(200).json({ success: true });
      }
      if (req.method === 'DELETE') {
        const id = queryParams.get('id');
        if (!id) return res.status(400).json({ error: 'ID necessário' });
        const numericId = id.startsWith('m-') ? id.substring(2) : id;
        await pool.query("DELETE FROM managed_users WHERE id = $1", [numericId]);
        return res.status(200).json({ success: true });
      }
    }

    if (path.endsWith('/system')) {
      if (req.method === 'GET') {
        // Obter Configuração
        const configRes = await pool.query("SELECT * FROM system_config WHERE id = 1");
        const config = configRes.rows[0];

        // Contar Espectadores (vistos nos últimos 60 segundos)
        const viewerRes = await pool.query("SELECT COUNT(DISTINCT id) FROM sessions WHERE last_seen > NOW() - interval '60 seconds'");
        const viewerCount = parseInt(viewerRes.rows[0].count) || 0;

        return res.status(200).json({ ...config, viewer_count: viewerCount });
      }
      if (req.method === 'POST') {
        const c = await getRequestBody(req);
        await pool.query(
          "UPDATE system_config SET public_url=$1, public_url2=$2, public_title=$3, public_description=$4, private_url=$5, private_url2=$6, private_title=$7, private_description=$8, is_private_mode=$9 WHERE id=1",
          [c.public_url, c.public_url2, c.public_title, c.public_description, c.private_url, c.private_url2, c.private_title, c.private_description, !!c.is_private_mode]
        );
        return res.status(200).json({ success: true });
      }
    }

    return res.status(404).json({ error: 'Endpoint não encontrado' });
  } catch (err) {
    console.error("Handler Error:", err);
    return res.status(500).json({ error: 'Erro interno no servidor de chat' });
  }
}
