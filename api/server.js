
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
  } catch (err) {
    console.error('Erro ao inicializar o Pool:', err);
  }
}

/**
 * =========================================================================
 * INTEGRAÇÃO DE E-MAIL (NOTIFICAÇÕES)
 * =========================================================================
 * Sugestões de API: Resend (resend.com), SendGrid ou Mailgun.
 */
async function sendWelcomeEmail(email, name) {
  console.log(`[LOG] Preparando e-mail de boas-vindas para: ${name}`);
  
  try {
    // EXEMPLO COM RESEND.COM:
    /*
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Christ Embassy Angola <bemvindo@ceangola.org>',
        to: email,
        subject: 'Bem-vindo à Família Christ Embassy Angola!',
        html: `<h1>Olá, ${name}!</h1><p>É uma alegria ter você conosco em nossa plataforma digital.</p>`
      })
    });
    */

    return true;
  } catch (error) {
    console.error('[ERRO EMAIL]', error);
    return false;
  }
}

async function ensureTables() {
  if (!pool) return;
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
        external_reference TEXT, -- Guardar ID do PayPay/Stripe aqui
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Erro ao preparar tabelas:', e);
  } finally {
    client.release();
  }
}

export default async function handler(req, res) {
  const { method } = req;
  const path = req.url.split('?')[0];
  res.setHeader('Content-Type', 'application/json');

  if (!connectionString) return res.status(500).json({ error: 'DB_NOT_CONFIGURED' });

  try {
    await ensureTables();

    // --- REGISTRO DE UTILIZADOR ---
    if (path === '/api/register' && method === 'POST') {
      const { fullName, email, phone, country } = req.body;
      
      const result = await pool.query(
        'INSERT INTO managed_users (fullname, email, phone, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [fullName, email, phone, 'public_user']
      );

      // Disparar e-mail se existir
      if (email) await sendWelcomeEmail(email, fullName);

      return res.status(201).json({ success: true, message: 'Registrado com sucesso.' });
    }

    // --- PROCESSAMENTO DE PAGAMENTOS (PONTO CENTRAL) ---
    if (path === '/api/payments/process' && method === 'POST') {
      const { userId, userName, amount, method: payMethod, type, description } = req.body;
      let externalRef = 'offline_ref';
      let finalStatus = 'pending';

      /**
       * ONDE INSERIR CADA API:
       */
      try {
        switch(payMethod) {
          case 'paypay':
            // INTEGRAÇÃO PAYPAY AFRICA
            // Aqui você chamaria: https://api.paypay.co.ao/v1/payments
            // console.log("Chamando API PayPay...");
            externalRef = "PP-" + Date.now();
            finalStatus = "completed"; // Em produção, aguarde o webhook
            break;

          case 'unitel':
            // INTEGRAÇÃO UNITEL MONEY
            // Chamada para o gateway da Unitel para trigger de USSD
            externalRef = "UNITEL-" + Date.now();
            break;

          case 'visa':
          case 'mastercard':
            // INTEGRAÇÃO STRIPE / EMIS
            // Exemplo Stripe: await stripe.paymentIntents.create({ amount: amount * 100, currency: 'usd' });
            externalRef = "STRIPE-ID-XYZ";
            finalStatus = "completed";
            break;

          case 'paypal':
            // INTEGRAÇÃO PAYPAL
            // Utilizar SDK do PayPal para capturar ordem
            externalRef = "PAYPAL-ORDER-ID";
            break;

          default:
            // Transferência Bancária / Express
            externalRef = "MANUAL-VERIFY-REQUIRED";
        }

        // Salvar no Banco
        await pool.query(
          'INSERT INTO transactions (user_id, user_name, amount, method, type, description, status, external_reference) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [userId, userName, amount, payMethod, type, description, finalStatus, externalRef]
        );

        return res.status(200).json({ success: true, ref: externalRef });

      } catch (apiErr) {
        console.error('Falha na API de Pagamento:', apiErr);
        return res.status(400).json({ error: 'Erro ao comunicar com operadora financeira.' });
      }
    }

    // SYSTEM CONFIG
    if (path === '/api/system' && method === 'GET') {
      const result = await pool.query('SELECT * FROM system_config WHERE id = 1');
      return res.status(200).json(result.rows[0] || {});
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
        const newSessionId = Math.random().toString(36).substring(7);
        await pool.query('UPDATE managed_users SET session_id = $1, last_heartbeat = NOW() WHERE id = $2', [newSessionId, u.id]);
        return res.status(200).json({ id: u.id, fullName: u.fullname, username: u.username, role: u.role, sessionId: newSessionId });
      }
      return res.status(401).json({ error: 'INVALID' });
    }

    return res.status(404).json({ error: 'NOT_FOUND' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
