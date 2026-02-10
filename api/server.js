
import pkg from 'pg';
const { Pool } = pkg;

// Configuração do Banco de Dados
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
    console.log("[DB] Pool de conexões criado.");
  } catch (err) {
    console.error('[DB ERROR] Falha ao inicializar o Pool:', err);
  }
} else {
  console.error('[DB ERROR] Nenhuma connection string encontrada no process.env');
}

async function ensureTables() {
  if (!pool) throw new Error("A base de dados não está configurada ou conectada.");
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Configurações do Sistema
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

    // Utilizadores
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
        session_id TEXT,
        last_heartbeat TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transações
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        amount NUMERIC(15,2),
        currency TEXT DEFAULT 'AOA',
        method TEXT,
        type TEXT, 
        description TEXT,
        status TEXT DEFAULT 'pending',
        external_reference TEXT, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
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
  res.setHeader('Content-Type', 'application/json');

  if (!connectionString) {
    return res.status(500).json({ 
      error: 'DB_NOT_LINKED', 
      message: 'Base de dados não encontrada. Vá ao Storage da Vercel e reconecte o Neon.' 
    });
  }

  try {
    await ensureTables();

    // REGISTRO
    if (path === '/api/register' && method === 'POST') {
      const { fullName, email, phone } = req.body;
      const result = await pool.query(
        'INSERT INTO managed_users (fullname, email, phone, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [fullName, email, phone, 'public_user']
      );
      return res.status(201).json({ success: true, id: result.rows[0].id });
    }

    // PAGAMENTOS (MOCK MODE ATIVO PARA TESTES SEM MERCHANT ID)
    if (path === '/api/payments/process' && method === 'POST') {
      const { userId, userName, amount, method: payMethod, type, description } = req.body;
      
      // Enquanto não tiveres o Merchant ID, o sistema gera uma referência interna
      const externalRef = `${payMethod.toUpperCase()}-${Date.now()}`;
      
      await pool.query(
        'INSERT INTO transactions (user_id, user_name, amount, method, type, description, status, external_reference) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [userId, userName, amount, payMethod, type, description, 'pending', externalRef]
      );

      return res.status(200).json({ 
        success: true, 
        reference: externalRef,
        message: 'Registado no sistema (Modo de Teste - Aguardando Merchant ID)' 
      });
    }

    // LOGIN
    if (path === '/api/login' && method === 'POST') {
      const { username, pass } = req.body;
      const result = await pool.query(
        'SELECT * FROM managed_users WHERE username = $1 AND password = $2 AND status = $3',
        [username, pass, 'active']
      );
      
      if (result.rows.length > 0) {
        const u = result.rows[0];
        return res.status(200).json({ id: u.id, fullName: u.fullname, username: u.username, role: u.role, hasLiveAccess: true });
      }
      return res.status(401).json({ error: 'INVALID' });
    }

    // ADMIN USERS
    if (path === '/api/admin/users' && method === 'GET') {
      const result = await pool.query("SELECT id, fullname as name, username, password, status FROM managed_users WHERE role != 'admin' ORDER BY id DESC");
      return res.status(200).json(result.rows);
    }

    // SYSTEM CONFIG
    if (path === '/api/system' && method === 'GET') {
      const result = await pool.query('SELECT * FROM system_config WHERE id = 1');
      return res.status(200).json(result.rows[0] || {});
    }

    if (path === '/api/system' && method === 'POST') {
      const { publicUrl, publicTitle, isPrivateMode } = req.body;
      await pool.query(`
        INSERT INTO system_config (id, public_url, public_title, is_private_mode)
        VALUES (1, $1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET public_url = $1, public_title = $2, is_private_mode = $3
      `, [publicUrl, publicTitle, isPrivateMode]);
      return res.status(200).json({ success: true });
    }

    return res.status(404).json({ error: 'NOT_FOUND' });
  } catch (error) {
    console.error('[HANDLER ERROR]', error);
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
}
