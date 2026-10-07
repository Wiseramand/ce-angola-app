
import pkg from 'pg';
const { Pool } = pkg;

const connectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.POSTGRES_URL_NON_POOLING;

const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 10,
        connectionTimeoutMillis: 10000,
      }
    : {
        host: process.env.POSTGRES_HOST || process.env.PGHOST,
        user: process.env.POSTGRES_USER || process.env.PGUSER,
        password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD,
        database: process.env.POSTGRES_DATABASE || process.env.PGDATABASE,
        port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
        ssl: { rejectUnauthorized: false },
        max: 10,
        connectionTimeoutMillis: 10000,
      }
);

let dbInitPromise = null;
const initDb = async () => {
  if (dbInitPromise) return dbInitPromise;
  dbInitPromise = (async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id SERIAL PRIMARY KEY,
        fullname TEXT, phone TEXT, country TEXT, country_code TEXT, church_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      -- TRUNCATE TABLE visitors; -- Requisito: Começo do zero (desativado para não perder dados)
      CREATE TABLE IF NOT EXISTS managed_users (
        id SERIAL PRIMARY KEY,
        fullname TEXT, username TEXT UNIQUE, password TEXT,
        role TEXT DEFAULT 'user', status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id TEXT, username TEXT, text TEXT, channel TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        location TEXT,
        device_info TEXT
      );
      CREATE TABLE IF NOT EXISTS user_session_logs (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        username TEXT,
        fullname TEXT,
        session_id TEXT,
        ip_address TEXT,
        location TEXT,
        device_info TEXT,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        duration_seconds INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS school_requests (
        id SERIAL PRIMARY KEY,
        fullname TEXT, email TEXT, phone TEXT, country TEXT, 
        state TEXT, city TEXT, neighborhood TEXT,
        is_member BOOLEAN, church_name TEXT, church_address TEXT, church_phone TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS school_users (
        id SERIAL PRIMARY KEY,
        fullname TEXT, username TEXT UNIQUE, password TEXT,
        role TEXT DEFAULT 'student', status TEXT DEFAULT 'active',
        is_credentials_generated BOOLEAN DEFAULT FALSE,
        email TEXT, phone TEXT, country TEXT, state TEXT, city TEXT, neighborhood TEXT,
        is_member BOOLEAN, church_name TEXT, church_address TEXT, church_phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS foundation_modules (
        id SERIAL PRIMARY KEY,
        title TEXT, description TEXT, video_url TEXT,
        module_order INTEGER UNIQUE
      );
      CREATE TABLE IF NOT EXISTS student_progress (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES school_users(id),
        module_id INTEGER REFERENCES foundation_modules(id),
        score INTEGER,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS live_sessions (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER,
        title TEXT,
        description TEXT,
        scheduled_for TIMESTAMP,
        status TEXT DEFAULT 'scheduled'
      );
      CREATE TABLE IF NOT EXISTS live_signaling (
        id SERIAL PRIMARY KEY,
        sender_id TEXT,
        receiver_id TEXT,
        type TEXT, -- 'offer', 'answer', 'candidate'
        data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY,
        public_url TEXT, public_url2 TEXT, 
        public_title_pt TEXT, public_title_en TEXT, 
        public_description_pt TEXT, public_description_en TEXT,
        private_url TEXT, private_url2 TEXT, 
        private_title_pt TEXT, private_title_en TEXT, 
        private_description_pt TEXT, private_description_en TEXT,
        is_private_mode BOOLEAN DEFAULT FALSE,
        is_teacher_live BOOLEAN DEFAULT FALSE,
        live_teacher_name TEXT,
        live_teacher_id TEXT,
        school_live_url TEXT
      );
    `);

    // Migrations for stream and i18n columns
    const systemConfigMigrations = [
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS public_url2 TEXT",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS private_url2 TEXT",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS public_title_pt TEXT",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS public_title_en TEXT",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS public_description_pt TEXT",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS public_description_en TEXT",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS private_title_pt TEXT",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS private_title_en TEXT",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS private_description_pt TEXT",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS private_description_en TEXT",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS is_teacher_live BOOLEAN DEFAULT FALSE",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS live_teacher_name TEXT",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS live_teacher_id TEXT",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS school_live_url TEXT"
    ];
    for (const mig of systemConfigMigrations) {
      try { await pool.query(mig); } catch (e) {}
    }

    try {
      await pool.query(`
        INSERT INTO system_config (id, public_title_pt, public_title_en, public_url, public_url2, public_description_pt, public_description_en, private_url, private_url2, private_title_pt, private_title_en, private_description_pt, private_description_en, is_private_mode, is_teacher_live, live_teacher_name, live_teacher_id, school_live_url) 
        VALUES (1, 'LoveWorld TV Angola', 'LoveWorld TV Angola', '', '', '', '', '', '', '', '', '', '', FALSE, FALSE, '', '', '') ON CONFLICT (id) DO NOTHING;
      `);
    } catch(e) {}


    // GArantir que a tabela school_users e foundation_modules têm as colunas corretas
    const userColumns = [
      "is_credentials_generated BOOLEAN DEFAULT FALSE",
      "email TEXT", "phone TEXT", "country TEXT", "state TEXT",
      "city TEXT", "neighborhood TEXT", "is_member BOOLEAN",
      "church_name TEXT", "church_address TEXT", "church_phone TEXT", "access_expiry TIMESTAMP",
      "teacher_id INTEGER", "class_id INTEGER"
    ];
    for (const col of userColumns) {
      try { await pool.query(`ALTER TABLE school_users ADD COLUMN IF NOT EXISTS ${col}`); } catch (e) { }
    }

    // Ensure all live streaming columns exist - critical runtime migrations
    const criticalMigrations = [
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS is_teacher_live BOOLEAN DEFAULT FALSE",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS live_teacher_name TEXT",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS live_teacher_id TEXT",
      "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS school_live_url TEXT",
    ];
    for (const migration of criticalMigrations) {
      try {
        await pool.query(migration);
      } catch (e) {
        console.error(`Migration failed: ${migration}`, e.message);
      }
    }

    // Ensure defaults for live fields
    try {
      await pool.query(`
        UPDATE system_config SET 
          is_teacher_live = COALESCE(is_teacher_live, FALSE),
          live_teacher_name = COALESCE(live_teacher_name, ''),
          live_teacher_id = COALESCE(live_teacher_id, ''),
          school_live_url = COALESCE(school_live_url, '')
        WHERE id = 1
      `);
    } catch (e) { }

    try { await pool.query("ALTER TABLE foundation_modules ADD COLUMN IF NOT EXISTS video_url TEXT"); } catch (e) { }
    try { await pool.query("ALTER TABLE foundation_modules ADD COLUMN IF NOT EXISTS module_order INTEGER"); } catch (e) { }
    try { await pool.query("ALTER TABLE managed_users ADD COLUMN IF NOT EXISTS has_live_access BOOLEAN DEFAULT FALSE"); } catch (e) { }

    // Initialize Foundation Classes
    const modulesCount = await pool.query("SELECT COUNT(*) FROM foundation_modules");
    const mod1 = await pool.query("SELECT title FROM foundation_modules ORDER BY module_order ASC LIMIT 1");
    if (parseInt(modulesCount.rows[0].count) === 0 || (mod1.rows.length > 0 && mod1.rows[0].title.includes('Módulo'))) {
      await pool.query("DELETE FROM foundation_modules");
      const defaultClasses = [
        ["Classe 1- Nova Criatura", ""],
        ["Classe 2- O Espirito Santo", ""],
        ["Classe 3- Doutrinas Cristãs", ""],
        ["Classe 4A- Evangelismo", ""],
        ["Classe 4B- Introdução ao Ministerio de Celulas", ""],
        ["Classe 5- Carácter cristão e Prosperidade", ""],
        ["Classe 6- Igreja Local e o Ministério Loveworld Inc. ( Christ Embassy)", ""],
        ["Classe 7- Introdução á tecnologias movel para o crescimento pessoal, Evangelismo e Crescimento da Igreja", ""]
      ];
      for (let i = 0; i < defaultClasses.length; i++) {
        await pool.query(
          "INSERT INTO foundation_modules (title, description, module_order) VALUES ($1, $2, $3)",
          [defaultClasses[i][0], defaultClasses[i][1], i + 1]
        );
      }
    }

    // Garantir colunas da tabela visitors
    const visitorMigrations = [
      "ALTER TABLE visitors ADD COLUMN IF NOT EXISTS user_id TEXT",
      "ALTER TABLE visitors ADD COLUMN IF NOT EXISTS country_code TEXT",
      "ALTER TABLE visitors ADD COLUMN IF NOT EXISTS church_name TEXT",
      "ALTER TABLE visitors ADD COLUMN IF NOT EXISTS city TEXT",
      "ALTER TABLE visitors ADD COLUMN IF NOT EXISTS neighborhood TEXT"
    ];
    for (const mig of visitorMigrations) {
      try { await pool.query(mig); } catch (e) { }
    }

    // Garantir colunas da tabela chat_messages
    const chatMigrations = [
      "ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ];
    for (const mig of chatMigrations) {
      try { await pool.query(mig); } catch (e) { }
    }

    // Garantir utilizador Master Admin na tabela managed_users
    try {
      await pool.query(`
        INSERT INTO managed_users (fullname, username, password, role, status, has_live_access)
        VALUES ('Administrador Master', 'master_admin', 'angola_faith_2025', 'admin', 'active', TRUE)
        ON CONFLICT (username) DO UPDATE SET password = 'angola_faith_2025', has_live_access = TRUE
      `);
    } catch (e) { }

    // Garantir que o professor padrão existe
    await pool.query(`
      INSERT INTO school_users (fullname, username, password, role, status, is_credentials_generated)
      VALUES ('Professor Lucas', 'prof_lucas', 'faith2025', 'teacher', 'active', TRUE)
      ON CONFLICT (username) DO UPDATE SET password = 'faith2025', role = 'teacher'
    `);
    // Garantir colunas da tabela sessions e user_session_logs
    const sessionMigrations = [
      "ALTER TABLE sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_address TEXT",
      "ALTER TABLE sessions ADD COLUMN IF NOT EXISTS location TEXT",
      "ALTER TABLE sessions ADD COLUMN IF NOT EXISTS device_info TEXT"
    ];
    for (const mig of sessionMigrations) {
      try { await pool.query(mig); } catch (e) { }
    }
  } catch (e) {
    console.error("DB Init Error:", e);
    dbInitPromise = null;
  }
  })();
  return dbInitPromise;
};

const geoCache = new Map();

function getClientIp(req, body = {}) {
  if (body.clientIp && typeof body.clientIp === 'string' && body.clientIp.length < 45) {
    return body.clientIp.trim();
  }
  if (req.headers) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const first = forwarded.split(',')[0].trim();
      if (first) return first;
    }
    const realIp = req.headers['x-real-ip'];
    if (realIp) return realIp.trim();
    const cfIp = req.headers['cf-connecting-ip'];
    if (cfIp) return cfIp.trim();
  }
  const sock = req.socket?.remoteAddress || req.connection?.remoteAddress || req.ip || '';
  const clean = sock.replace(/^.*:/, '').trim();
  return clean || '127.0.0.1';
}

function getClientDevice(req, body = {}) {
  if (body.deviceInfo && typeof body.deviceInfo === 'string') {
    return body.deviceInfo.slice(0, 80);
  }
  const ua = req.headers ? (req.headers['user-agent'] || '') : '';
  if (!ua) return 'Navegador Web';
  let os = 'Dispositivo';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone/i.test(ua)) os = 'iPhone';
  else if (/ipad/i.test(ua)) os = 'iPad';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Web';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';

  return `${os} • ${browser}`;
}

async function getClientLocation(req, ip, body = {}) {
  if (body.clientLocation && typeof body.clientLocation === 'string') {
    return body.clientLocation.slice(0, 100);
  }
  if (req.headers) {
    const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : '';
    const country = req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || '';
    if (city && country) return `${city}, ${country}`;
    if (country) return country;
  }
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return 'Rede Local (Angola)';
  }
  if (geoCache.has(ip)) return geoCache.get(ip);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success' && (data.city || data.country)) {
        const loc = [data.city, data.country].filter(Boolean).join(', ');
        geoCache.set(ip, loc);
        return loc;
      }
    }
  } catch (e) { }
  return 'Angola';
}

async function getRequestBody(req) {
  // 1. Se o body já foi parseado (Vercel/Connect/Express)
  if (req.body) {
    if (typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch (e) {
        return {};
      }
    }
  }

  // 2. Se for um GET ou HEAD, ou stream já consumido, não há body
  if (req.method === 'GET' || req.method === 'HEAD' || req.readableEnded) return {};

  // 3. Lê o stream manualmente com timeout para evitar hangs
  return new Promise((resolve, reject) => {
    let body = '';
    const timeout = setTimeout(() => {
      resolve({}); // Resolve vazio se demorar demais
    }, 5000);

    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      clearTimeout(timeout);
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

export default async function handler(req, res) {
  if (!res.status) {
    res.status = function (code) { this.statusCode = code; return this; };
  }
  if (!res.json) {
    res.json = function (data) {
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(data));
      return this;
    };
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const urlParts = req.url.split('?');
  const path = urlParts[0];
  const queryParams = new URLSearchParams(urlParts[1] || '');

  try {
    await initDb();

    // ESCOLA DE FUNDAÇÃO: REGISTO
    if (path.endsWith('/school/register')) {
      if (req.method === 'POST') {
        const b = await getRequestBody(req);
        await pool.query(
          "INSERT INTO school_requests (fullname, email, phone, country, state, city, neighborhood, is_member, church_name, church_address, church_phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
          [b.fullName, b.email, b.phone, b.country, b.state, b.city, b.neighborhood, !!b.isMember, b.churchName, b.churchAddress, b.churchPhone]
        );
        return res.status(200).json({ success: true });
      }
    }

    // ESCOLA DE FUNDAÇÃO: ADMIN GESTÃO
    if (path.endsWith('/admin/school/requests')) {
      if (req.method === 'GET') {
        const r = await pool.query("SELECT * FROM school_requests WHERE status = 'pending' ORDER BY created_at DESC");
        return res.status(200).json(r.rows);
      }
      if (req.method === 'POST') {
        try {
          const { id, action, teacher_id, class_id } = await getRequestBody(req);
          if (action === 'approve') {
            const reqData = await pool.query("SELECT * FROM school_requests WHERE id = $1", [id]);
            if (reqData.rows.length > 0) {
              const r = reqData.rows[0];
              const username = r.fullname.split(' ')[0].toLowerCase() + Math.random().toString(36).substring(2, 6);

              // Aprovação: Cria o usuário com professor e turma
              await pool.query(
                "INSERT INTO school_users (fullname, username, role, email, phone, country, state, city, neighborhood, is_member, church_name, church_address, church_phone, is_credentials_generated, teacher_id, class_id) VALUES ($1, $2, 'student', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, FALSE, $13, $14)",
                [r.fullname, username, r.email, r.phone, r.country, r.state, r.city, r.neighborhood, !!r.is_member, r.church_name, r.church_address, r.church_phone, teacher_id || null, class_id || null]
              );
              await pool.query("UPDATE school_requests SET status = 'approved' WHERE id = $1", [id]);
              return res.status(200).json({ success: true, message: 'Student approved.' });
            }
            return res.status(404).json({ error: 'Request not found' });
          } else if (action === 'reject') {
            await pool.query("UPDATE school_requests SET status = 'rejected' WHERE id = $1", [id]);
            return res.status(200).json({ success: true });
          }
          return res.status(400).json({ error: 'Invalid action' });
        } catch (err) {
          console.error("Approval Error:", err);
          return res.status(500).json({ error: 'Erro ao aprovar: ' + err.message });
        }
      }
    }

    // ESCOLA DE FUNDAÇÃO: GERAR CREDENCIAIS
    if (path.endsWith('/admin/school/generate-credentials')) {
      if (req.method === 'POST') {
        const { studentId } = await getRequestBody(req);
        const password = Math.random().toString(36).slice(-8);
        await pool.query(
          "UPDATE school_users SET password = $1, is_credentials_generated = TRUE WHERE id = $2",
          [password, studentId]
        );
        const r = await pool.query("SELECT username, phone, email FROM school_users WHERE id = $1", [studentId]);
        return res.status(200).json({
          success: true,
          credentials: {
            username: r.rows[0].username,
            password,
            phone: r.rows[0].phone,
            email: r.rows[0].email
          }
        });
      }
    }

    // ESCOLA DE FUNDAÇÃO: ESTUDANTES DO PROFESSOR
    if (path.endsWith('/school/teacher/students')) {
      if (req.method === 'GET') {
        const teacherId = queryParams.get('teacher_id');
        if (!teacherId) return res.status(400).json({ error: 'teacher_id required' });
        const r = await pool.query(
          `SELECT su.id, su.fullname, su.username, su.email, su.phone, su.status, su.access_expiry,
                  su.class_id, fm.title AS class_title
           FROM school_users su
           LEFT JOIN foundation_modules fm ON fm.id = su.class_id
           WHERE su.teacher_id = $1 AND su.role = 'student'
           ORDER BY su.fullname ASC`,
          [teacherId]
        );
        return res.status(200).json(r.rows);
      }
    }

    // ESCOLA DE FUNDAÇÃO: LOGIN ALUNO E PROFESSOR
    if (path.endsWith('/school/login') || path.endsWith('/school/teacher/login')) {
      if (req.method === 'POST') {
        const { username, password } = await getRequestBody(req);
        const normalizedUsername = username?.toLowerCase().trim();
        const roleRequired = path.endsWith('/school/teacher/login') ? 'teacher' : 'student';

        const r = await pool.query("SELECT * FROM school_users WHERE username = $1 AND password = $2 AND role = $3", [normalizedUsername, password, roleRequired]);
        if (r.rows.length > 0) {
          const user = r.rows[0];

          // Verifica Validade
          if (user.access_expiry && new Date(user.access_expiry) < new Date()) {
            return res.status(403).json({ error: 'Acesso Expirado. Por favor, contacte a administração.' });
          }

          return res.status(200).json({
            success: true,
            user: { ...user, password: undefined }
          });
        }
        return res.status(401).json({ error: 'ID de Utilizador ou Senha incorreta.' });
      }
    }

    // ESCOLA DE FUNDAÇÃO: GESTÃO DE USUÁRIOS
    if (path.endsWith('/school/users')) {
      if (req.method === 'GET') {
        const role = queryParams.get('role');
        let r;
        if (role) {
          r = await pool.query("SELECT id, fullname, username, password, role, email, phone, status, is_credentials_generated, access_expiry, teacher_id, class_id, created_at FROM school_users WHERE role = $1 ORDER BY created_at DESC", [role]);
        } else {
          r = await pool.query("SELECT id, fullname, username, password, role, email, phone, status, is_credentials_generated, access_expiry, teacher_id, class_id, created_at FROM school_users ORDER BY role, created_at DESC");
        }
        return res.status(200).json(r.rows);
      }
      if (req.method === 'POST') {
        try {
          const b = await getRequestBody(req);
          const normalizedUsername = b.username?.toLowerCase().trim();
          const expiryVal = b.access_expiry ? new Date(b.access_expiry) : null;

          if (b.id) {
            await pool.query(
              "UPDATE school_users SET fullname=$1, username=$2, password=COALESCE($3, password), role=$4, email=$5, phone=$6, state=$7, city=$8, neighborhood=$9, is_member=$10, church_name=$11, church_address=$12, church_phone=$13, access_expiry=$14, teacher_id=$15, class_id=$16 WHERE id=$17",
              [b.fullname, normalizedUsername, b.password || null, b.role || 'student', b.email, b.phone, b.state, b.city, b.neighborhood, !!b.is_member, b.church_name, b.church_address, b.church_phone, expiryVal, b.teacher_id || null, b.class_id || null, b.id]
            );
          } else {
            await pool.query(
              "INSERT INTO school_users (fullname, username, password, role, email, phone, is_credentials_generated, access_expiry, teacher_id, class_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
              [b.fullname, normalizedUsername, b.password, b.role || 'student', b.email, b.phone, true, expiryVal, b.teacher_id || null, b.class_id || null]
            );
          }
          return res.status(200).json({ success: true });
        } catch (err) {
          console.error("Save User Error:", err);
          return res.status(500).json({ error: 'Erro ao salvar: ' + err.message });
        }
      }
      if (req.method === 'DELETE') {
        const id = queryParams.get('id');
        await pool.query("DELETE FROM school_users WHERE id = $1", [id]);
        return res.status(200).json({ success: true });
      }
    }

    // ESCOLA DE FUNDAÇÃO: GESTÃO DE MÓDULOS (Área Média)
    if (path.endsWith('/school/modules')) {
      if (req.method === 'GET') {
        const r = await pool.query("SELECT * FROM foundation_modules ORDER BY module_order ASC");
        return res.status(200).json(r.rows);
      }
      if (req.method === 'POST') {
        const { id, title, description, video_url, module_order } = await getRequestBody(req);
        if (id) {
          await pool.query(
            "UPDATE foundation_modules SET title=$1, description=$2, video_url=$3, module_order=$4 WHERE id=$5",
            [title, description, video_url, module_order, id]
          );
        } else {
          await pool.query(
            "INSERT INTO foundation_modules (title, description, video_url, module_order) VALUES ($1,$2,$3,$4)",
            [title, description, video_url, module_order]
          );
        }
        return res.status(200).json({ success: true });
      }
      if (req.method === 'DELETE') {
        const id = queryParams.get('id');
        await pool.query("DELETE FROM foundation_modules WHERE id = $1", [id]);
        return res.status(200).json({ success: true });
      }
    }

    // HEARTBEAT (Sessões Ativas e Desconexão)
    if (path.endsWith('/heartbeat/leave') || path.endsWith('/leave')) {
      if (req.method === 'POST') {
        const { userId, sessionId } = await getRequestBody(req);
        if (sessionId) {
          await pool.query("DELETE FROM sessions WHERE id = $1", [sessionId]).catch(() => {});
          await pool.query(
            `UPDATE user_session_logs 
             SET ended_at = CURRENT_TIMESTAMP,
                 last_seen = CURRENT_TIMESTAMP,
                 duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))::INTEGER)
             WHERE session_id = $1`,
            [sessionId]
          ).catch(() => {});
        }
        if (userId) {
          const uid = String(userId).trim();
          const rawId = uid.replace('m-', '').replace('v-', '');
          await pool.query(
            "DELETE FROM sessions WHERE user_id = $1 OR user_id = $2 OR user_id = ('m-' || $2) OR user_id = ('v-' || $2)",
            [uid, rawId]
          ).catch(() => {});
          await pool.query(
            `UPDATE user_session_logs 
             SET ended_at = CURRENT_TIMESTAMP,
                 last_seen = CURRENT_TIMESTAMP,
                 duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))::INTEGER)
             WHERE (user_id = $1 OR user_id = $2 OR user_id = ('m-' || $2)) AND ended_at IS NULL`,
            [uid, rawId]
          ).catch(() => {});
        }
        return res.status(200).json({ success: true });
      }
    }

    if (path.endsWith('/heartbeat')) {
      if (req.method === 'POST') {
        const b = await getRequestBody(req);
        const { userId, sessionId } = b;
        if (sessionId) {
          const uid = String(userId || 'visitor').trim();
          const ip = getClientIp(req, b);
          const device = getClientDevice(req, b);
          const location = await getClientLocation(req, ip, b);

          await pool.query(
            `INSERT INTO sessions (id, user_id, last_seen, created_at, ip_address, location, device_info) 
             VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $3, $4, $5) 
             ON CONFLICT (id) DO UPDATE SET 
               last_seen = CURRENT_TIMESTAMP, 
               user_id = $2,
               ip_address = COALESCE(NULLIF($3, ''), sessions.ip_address),
               location = COALESCE(NULLIF($4, ''), sessions.location),
               device_info = COALESCE(NULLIF($5, ''), sessions.device_info)`,
            [sessionId, uid, ip, location, device]
          );

          await pool.query(
            `UPDATE user_session_logs 
             SET last_seen = CURRENT_TIMESTAMP,
                 duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))::INTEGER)
             WHERE session_id = $1`,
            [sessionId]
          ).catch(() => {});

          return res.status(200).json({ success: true });
        }
        return res.status(400).json({ error: 'Session ID required' });
      }
    }

    // CHAT INTERATIVO
    if (path.endsWith('/chat')) {
      if (req.method === 'GET') {
        const channel = queryParams.get('channel') || 'public';
        try {
          await pool.query("ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP").catch(() => {});
          const r = await pool.query(
            "SELECT id::text, user_id, username, text, channel, COALESCE(timestamp, created_at, CURRENT_TIMESTAMP) as timestamp, COALESCE(created_at, timestamp, CURRENT_TIMESTAMP) as created_at FROM chat_messages WHERE channel = $1 ORDER BY COALESCE(timestamp, created_at, CURRENT_TIMESTAMP) ASC LIMIT 100",
            [channel]
          );
          return res.status(200).json(r.rows);
        } catch (e) {
          console.error("Chat GET error:", e.message);
          return res.status(500).json({ error: e.message });
        }
      }

      if (req.method === 'POST') {
        const body = await getRequestBody(req);
        const { userId, username, text, channel } = body;

        if (!text || !userId) {
          return res.status(400).json({ error: 'Dados insuficientes para enviar mensagem' });
        }

        try {
          await pool.query(
            "INSERT INTO chat_messages (user_id, username, text, channel, timestamp, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
            [String(userId), String(username || 'Anónimo'), String(text), String(channel || 'public')]
          );
          return res.status(200).json({ success: true });
        } catch (e) {
          console.error("Chat POST error:", e.message);
          return res.status(500).json({ error: e.message });
        }
      }
    }

    // REGISTO DE VISITANTE
    if (req.method === 'POST' && path.endsWith('/register') && !path.endsWith('/school/register')) {
      const b = await getRequestBody(req);
      const fullName = (b.fullName || b.fullname || b.name || 'Visitante').trim();
      const phone = (b.phone || '').trim();
      const country = (b.country || 'Angola').trim();
      const countryCode = (b.countryCode || b.country_code || '+244').trim();
      const churchName = (b.churchName || b.church_name || '').trim();

      const r = await pool.query(
        "INSERT INTO visitors (fullname, phone, country, country_code, church_name) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [fullName, phone, country, countryCode, churchName]
      );
      const visitorDbId = r.rows[0]?.id;
      const sessionId = Math.random().toString(36).substring(2, 15);
      const userId = 'v-' + (visitorDbId || Date.now());

      await pool.query("UPDATE visitors SET user_id = $1 WHERE id = $2", [userId, visitorDbId]).catch(() => {});

      await pool.query(
        "INSERT INTO sessions (id, user_id, last_seen) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (id) DO UPDATE SET last_seen = CURRENT_TIMESTAMP, user_id = $2",
        [sessionId, userId]
      ).catch(() => {});

      return res.status(200).json({
        success: true,
        user: { id: userId, fullName, role: 'user', sessionId, country, countryCode, churchName, phone, hasLiveAccess: false }
      });
    }

    // LOGIN DE MEMBROS (Inclui Admin Master)
    if (req.method === 'POST' && path.endsWith('/login') && !path.endsWith('/school/login') && !path.endsWith('/school/teacher/login')) {
      const b = await getRequestBody(req);
      const identifier = (b.email || b.username || '').toLowerCase().trim();
      const password = (b.password || b.pass || '').trim();

      if (!identifier || !password) {
        return res.status(400).json({ error: 'Por favor, insira o ID de Utilizador e a Senha.' });
      }

      if (identifier === 'master_admin' && password === 'angola_faith_2025') {
        const sessionId = Math.random().toString(36).substring(2, 15);
        await pool.query(
          "INSERT INTO sessions (id, user_id, last_seen) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (id) DO UPDATE SET last_seen = CURRENT_TIMESTAMP, user_id = $2",
          [sessionId, 'admin-1']
        ).catch(() => {});

        return res.status(200).json({ 
          success: true,
          user: { id: 'admin-1', role: 'admin', fullName: 'Administrador Master', hasLiveAccess: true, sessionId } 
        });
      }

      const r = await pool.query(
        "SELECT * FROM managed_users WHERE LOWER(TRIM(username)) = $1 AND TRIM(password) = $2", 
        [identifier, password]
      );
      if (r.rows.length > 0) {
        const u = r.rows[0];
        const memberUserId = 'm-' + u.id;

        // Limpar sessões inativas (sem heartbeat há mais de 45 segundos)
        await pool.query("DELETE FROM sessions WHERE last_seen < NOW() - INTERVAL '45 seconds'").catch(() => {});

        // 1. Verificação de Segurança: Sessão Ativa noutro dispositivo ou navegador
        const activeCheck = await pool.query(
          "SELECT id, ip_address, location, device_info, last_seen FROM sessions WHERE (user_id = $1 OR user_id = $2) AND last_seen > NOW() - INTERVAL '40 seconds'",
          [memberUserId, String(u.id)]
        );

        if (activeCheck.rows.length > 0) {
          return res.status(409).json({ 
            error: 'Os logins já estão a ser utilizados noutro dispositivo ou navegador. Por favor, contacte o administrador.',
            code: 'SESSION_ALREADY_ACTIVE'
          });
        }

        const ip = getClientIp(req, b);
        const device = getClientDevice(req, b);
        const location = await getClientLocation(req, ip, b);
        const sessionId = Math.random().toString(36).substring(2, 15);

        // Regista sessão ativa em sessions com dados de IP, localização e dispositivo
        await pool.query(
          `INSERT INTO sessions (id, user_id, last_seen, created_at, ip_address, location, device_info) 
           VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET last_seen = CURRENT_TIMESTAMP, user_id = $2, ip_address = $3, location = $4, device_info = $5`,
          [sessionId, memberUserId, ip, location, device]
        ).catch(() => {});

        // Regista nos logs históricos de sessão
        await pool.query(
          `INSERT INTO user_session_logs (user_id, username, fullname, session_id, ip_address, location, device_info, started_at, last_seen, duration_seconds)
           VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)`,
          [memberUserId, u.username, u.fullname || u.username, sessionId, ip, location, device]
        ).catch(() => {});

        // 2. Regista/atualiza o parceiro na tabela de visitantes para que apareça no registro de visitantes
        try {
          const existingVis = await pool.query("SELECT id FROM visitors WHERE user_id = $1", [memberUserId]);
          if (existingVis.rows.length > 0) {
            await pool.query(
              "UPDATE visitors SET fullname = $1, created_at = CURRENT_TIMESTAMP WHERE user_id = $2",
              [u.fullname || u.username, memberUserId]
            );
          } else {
            await pool.query(
              "INSERT INTO visitors (fullname, phone, country, country_code, church_name, user_id) VALUES ($1, $2, $3, $4, $5, $6)",
              [u.fullname || u.username, u.phone || '', 'Angola', '+244', 'Membro / Parceiro', memberUserId]
            );
          }
        } catch (e) {
          console.error("Erro ao registrar visitante membro:", e);
        }

        return res.status(200).json({
          success: true,
          user: {
            id: memberUserId,
            fullName: u.fullname || u.username,
            username: u.username,
            role: u.role || 'user',
            hasLiveAccess: !!u.has_live_access,
            country: 'Angola',
            sessionId: sessionId
          }
        });
      }
      return res.status(401).json({ error: 'ID de Utilizador ou Senha incorretos' });
    }

    // OUTROS ENDPOINTS (Admin & System)
    if (req.method === 'GET' && path.endsWith('/admin/visitors')) {
      const r = await pool.query(`
        SELECT 
          v.id::text,
          v.fullname,
          v.phone,
          v.country,
          v.country_code,
          v.church_name,
          v.created_at,
          MAX(s.last_seen) as last_seen,
          CASE 
            WHEN MAX(s.last_seen) > NOW() - interval '35 seconds' THEN TRUE 
            ELSE FALSE 
          END as is_online
        FROM visitors v
        LEFT JOIN sessions s ON (
          s.user_id = ('v-' || v.id::text) 
          OR s.user_id = v.id::text 
          OR (v.user_id IS NOT NULL AND (s.user_id = v.user_id OR s.user_id = REPLACE(v.user_id, 'm-', '')))
        )
        GROUP BY v.id, v.fullname, v.phone, v.country, v.country_code, v.church_name, v.created_at
        ORDER BY is_online DESC, v.created_at DESC
      `);
      return res.status(200).json(r.rows);
    }

    // AUDITORIA E HISTÓRICO DE SESSÕES
    if (path.endsWith('/admin/user-logs')) {
      if (req.method === 'GET') {
        const userId = queryParams.get('userId');
        let r;
        if (userId) {
          const uid = String(userId).trim();
          const rawId = uid.replace('m-', '').replace('v-', '');
          r = await pool.query(
            `SELECT id, user_id, username, fullname, session_id, ip_address, location, device_info, started_at, last_seen, ended_at, duration_seconds 
             FROM user_session_logs 
             WHERE user_id = $1 OR user_id = $2 OR user_id = ('m-' || $2)
             ORDER BY started_at DESC LIMIT 50`,
            [uid, rawId]
          );
        } else {
          r = await pool.query(
            `SELECT id, user_id, username, fullname, session_id, ip_address, location, device_info, started_at, last_seen, ended_at, duration_seconds 
             FROM user_session_logs 
             ORDER BY started_at DESC LIMIT 100`
          );
        }
        return res.status(200).json(r.rows);
      }
    }

    // DESCONECTAR / LIBERTAR SESSÃO DE UTILIZADOR
    if (path.endsWith('/admin/disconnect-user')) {
      if (req.method === 'POST') {
        const { userId } = await getRequestBody(req);
        if (!userId) return res.status(400).json({ error: 'userId obrigatório' });
        const uid = String(userId).trim();
        const rawId = uid.replace('m-', '').replace('v-', '');

        await pool.query(
          "DELETE FROM sessions WHERE user_id = $1 OR user_id = $2 OR user_id = ('m-' || $2) OR user_id = ('v-' || $2)",
          [uid, rawId]
        );
        await pool.query(
          `UPDATE user_session_logs 
           SET ended_at = CURRENT_TIMESTAMP,
               last_seen = CURRENT_TIMESTAMP,
               duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))::INTEGER)
           WHERE (user_id = $1 OR user_id = $2 OR user_id = ('m-' || $2) OR user_id = ('v-' || $2)) AND ended_at IS NULL`,
          [uid, rawId]
        ).catch(() => {});

        return res.status(200).json({ success: true, message: 'Sessão desconectada com sucesso.' });
      }
    }

    if (path.endsWith('/admin/users')) {
      if (req.method === 'GET') {
        const r = await pool.query(`
          SELECT 
            u.id::text, 
            u.fullname as name, 
            u.username, 
            u.password, 
            u.has_live_access,
            u.created_at,
            MAX(s.last_seen) as last_seen,
            MIN(s.created_at) as session_started_at,
            CASE 
              WHEN MAX(s.last_seen) > NOW() - interval '40 seconds' THEN TRUE 
              ELSE FALSE 
            END as is_online,
            MAX(s.ip_address) as current_ip,
            MAX(s.location) as current_location,
            MAX(s.device_info) as current_device,
            MAX(s.id) as current_session_id,
            CASE 
              WHEN MAX(s.last_seen) > NOW() - interval '40 seconds' THEN 
                GREATEST(0, EXTRACT(EPOCH FROM (NOW() - MIN(s.created_at)))::INTEGER)
              ELSE 
                COALESCE(
                  (SELECT l.duration_seconds FROM user_session_logs l WHERE (l.user_id = u.id::text OR l.user_id = ('m-' || u.id::text)) ORDER BY l.id DESC LIMIT 1),
                  0
                )
            END as duration_seconds,
            COALESCE(
              MAX(s.ip_address),
              (SELECT l.ip_address FROM user_session_logs l WHERE (l.user_id = u.id::text OR l.user_id = ('m-' || u.id::text)) ORDER BY l.id DESC LIMIT 1),
              'N/A'
            ) as ip_address,
            COALESCE(
              MAX(s.location),
              (SELECT l.location FROM user_session_logs l WHERE (l.user_id = u.id::text OR l.user_id = ('m-' || u.id::text)) ORDER BY l.id DESC LIMIT 1),
              'N/A'
            ) as location,
            COALESCE(
              MAX(s.device_info),
              (SELECT l.device_info FROM user_session_logs l WHERE (l.user_id = u.id::text OR l.user_id = ('m-' || u.id::text)) ORDER BY l.id DESC LIMIT 1),
              'N/A'
            ) as device_info
          FROM managed_users u
          LEFT JOIN sessions s ON (
            (s.user_id = u.id::text OR s.user_id = ('m-' || u.id::text))
            AND s.last_seen > NOW() - interval '40 seconds'
          )
          GROUP BY u.id, u.fullname, u.username, u.password, u.has_live_access, u.created_at
          ORDER BY is_online DESC, u.created_at DESC
        `);
        return res.status(200).json(r.rows);
      }
      if (req.method === 'POST') {
        const { id, fullname, username, password, has_live_access } = await getRequestBody(req);
        if (id) {
          // Update existing
          const numericId = id.startsWith('m-') ? id.substring(2) : id;
          await pool.query(
            "UPDATE managed_users SET fullname = $1, username = $2, password = $3, has_live_access = $4 WHERE id = $5",
            [fullname, username.toLowerCase().trim(), password, !!has_live_access, numericId]
          );
        } else {
          // Insert new
          await pool.query(
            "INSERT INTO managed_users (fullname, username, password, has_live_access) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO UPDATE SET password = $3, fullname = $1, has_live_access = $4",
            [fullname, username.toLowerCase().trim(), password, !!has_live_access]
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
        let configRes = await pool.query("SELECT * FROM system_config WHERE id = 1");
        if (configRes.rows.length === 0) {
          await pool.query("INSERT INTO system_config (id, public_title_pt, public_title_en) VALUES (1, 'LoveWorld TV Angola', 'LoveWorld TV Angola') ON CONFLICT (id) DO NOTHING");
          configRes = await pool.query("SELECT * FROM system_config WHERE id = 1");
        }
        const config = configRes.rows[0] || {};

        let viewerCount = 0;
        try {
          const viewerRes = await pool.query("SELECT COUNT(id) FROM sessions WHERE last_seen > NOW() - interval '2 minutes'");
          viewerCount = parseInt(viewerRes.rows[0].count) || 0;
        } catch (e) { }

        return res.status(200).json({ ...config, viewer_count: viewerCount });
      }
      if (req.method === 'POST') {
        const c = await getRequestBody(req);
        
        await pool.query("ALTER TABLE system_config ADD COLUMN IF NOT EXISTS public_url2 TEXT").catch(() => {});
        await pool.query("ALTER TABLE system_config ADD COLUMN IF NOT EXISTS private_url2 TEXT").catch(() => {});
        await pool.query("ALTER TABLE system_config ADD COLUMN IF NOT EXISTS public_title_pt TEXT").catch(() => {});
        await pool.query("ALTER TABLE system_config ADD COLUMN IF NOT EXISTS public_title_en TEXT").catch(() => {});
        await pool.query("ALTER TABLE system_config ADD COLUMN IF NOT EXISTS public_description_pt TEXT").catch(() => {});
        await pool.query("ALTER TABLE system_config ADD COLUMN IF NOT EXISTS public_description_en TEXT").catch(() => {});
        await pool.query("ALTER TABLE system_config ADD COLUMN IF NOT EXISTS private_title_pt TEXT").catch(() => {});
        await pool.query("ALTER TABLE system_config ADD COLUMN IF NOT EXISTS private_title_en TEXT").catch(() => {});
        await pool.query("ALTER TABLE system_config ADD COLUMN IF NOT EXISTS private_description_pt TEXT").catch(() => {});
        await pool.query("ALTER TABLE system_config ADD COLUMN IF NOT EXISTS private_description_en TEXT").catch(() => {});
        await pool.query("ALTER TABLE system_config ADD COLUMN IF NOT EXISTS is_teacher_live BOOLEAN DEFAULT FALSE").catch(() => {});
        await pool.query("ALTER TABLE system_config ADD COLUMN IF NOT EXISTS live_teacher_name TEXT").catch(() => {});
        await pool.query("ALTER TABLE system_config ADD COLUMN IF NOT EXISTS live_teacher_id TEXT").catch(() => {});
        await pool.query("ALTER TABLE system_config ADD COLUMN IF NOT EXISTS school_live_url TEXT").catch(() => {});

        await pool.query(
          `INSERT INTO system_config (
            id, public_url, public_url2, public_title_pt, public_title_en,
            public_description_pt, public_description_en, private_url, private_url2,
            private_title_pt, private_title_en, private_description_pt, private_description_en,
            is_private_mode, is_teacher_live, live_teacher_name, live_teacher_id, school_live_url
          ) VALUES (
            1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
          ) ON CONFLICT (id) DO UPDATE SET 
            public_url = COALESCE($1, system_config.public_url),
            public_url2 = COALESCE($2, system_config.public_url2),
            public_title_pt = COALESCE($3, system_config.public_title_pt),
            public_title_en = COALESCE($4, system_config.public_title_en),
            public_description_pt = COALESCE($5, system_config.public_description_pt),
            public_description_en = COALESCE($6, system_config.public_description_en),
            private_url = COALESCE($7, system_config.private_url),
            private_url2 = COALESCE($8, system_config.private_url2),
            private_title_pt = COALESCE($9, system_config.private_title_pt),
            private_title_en = COALESCE($10, system_config.private_title_en),
            private_description_pt = COALESCE($11, system_config.private_description_pt),
            private_description_en = COALESCE($12, system_config.private_description_en),
            is_private_mode = COALESCE($13, system_config.is_private_mode),
            is_teacher_live = COALESCE($14, system_config.is_teacher_live),
            live_teacher_name = COALESCE($15, system_config.live_teacher_name),
            live_teacher_id = COALESCE($16, system_config.live_teacher_id),
            school_live_url = COALESCE($17, system_config.school_live_url)`,
          [
            c.public_url !== undefined ? c.public_url : null,
            c.public_url2 !== undefined ? c.public_url2 : null,
            c.public_title_pt !== undefined ? c.public_title_pt : null,
            c.public_title_en !== undefined ? c.public_title_en : null,
            c.public_description_pt !== undefined ? c.public_description_pt : null,
            c.public_description_en !== undefined ? c.public_description_en : null,
            c.private_url !== undefined ? c.private_url : null,
            c.private_url2 !== undefined ? c.private_url2 : null,
            c.private_title_pt !== undefined ? c.private_title_pt : null,
            c.private_title_en !== undefined ? c.private_title_en : null,
            c.private_description_pt !== undefined ? c.private_description_pt : null,
            c.private_description_en !== undefined ? c.private_description_en : null,
            c.is_private_mode !== undefined ? !!c.is_private_mode : null,
            c.is_teacher_live !== undefined ? !!c.is_teacher_live : null,
            c.live_teacher_name !== undefined ? c.live_teacher_name : null,
            c.live_teacher_id !== undefined ? c.live_teacher_id : null,
            c.school_live_url !== undefined ? c.school_live_url : null
          ]
        );
        return res.status(200).json({ success: true });
      }
    }

    if (path.endsWith('/school/live/signaling')) {
      if (req.method === 'GET') {
        const receiverId = queryParams.get('receiver_id');
        const r = await pool.query("SELECT * FROM live_signaling WHERE receiver_id = $1 ORDER BY created_at ASC", [receiverId]);
        if (r.rows.length > 0) {
          await pool.query("DELETE FROM live_signaling WHERE receiver_id = $1", [receiverId]);
        }
        return res.status(200).json(r.rows);
      }
      if (req.method === 'POST') {
        const { sender_id, receiver_id, type, data } = await getRequestBody(req);
        await pool.query(
          "INSERT INTO live_signaling (sender_id, receiver_id, type, data) VALUES ($1, $2, $3, $4)",
          [sender_id, receiver_id, type, JSON.stringify(data)]
        );
        return res.status(200).json({ success: true });
      }
      if (req.method === 'DELETE') {
        const sessionId = queryParams.get('session_id');
        await pool.query("DELETE FROM live_signaling WHERE sender_id = $1 OR receiver_id = $1", [sessionId]);
        return res.status(200).json({ success: true });
      }
    }

    return res.status(404).json({ error: 'Endpoint não encontrado' });
  } catch (err) {
    console.error("Handler Error:", err);
    return res.status(500).json({ error: err.message || 'Erro interno no servidor' });
  }
}

