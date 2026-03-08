
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
      CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY,
        public_url TEXT, public_url2 TEXT, public_title TEXT, public_description TEXT,
        private_url TEXT, private_url2 TEXT, private_title TEXT, private_description TEXT,
        is_private_mode BOOLEAN DEFAULT FALSE,
        is_teacher_live BOOLEAN DEFAULT FALSE,
        live_teacher_name TEXT
      );
      INSERT INTO system_config (id, public_title) VALUES (1, 'LoveWorld TV Angola') ON CONFLICT DO NOTHING;
    `);

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

    try { await pool.query("ALTER TABLE foundation_modules ADD COLUMN IF NOT EXISTS video_url TEXT"); } catch (e) { }
    try { await pool.query("ALTER TABLE foundation_modules ADD COLUMN IF NOT EXISTS module_order INTEGER"); } catch (e) { }

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

    // Garantir que o professor padrão existe
    await pool.query(`
      INSERT INTO school_users (fullname, username, password, role, status, is_credentials_generated)
      VALUES ('Professor Lucas', 'prof_lucas', 'faith2025', 'teacher', 'active', TRUE)
      ON CONFLICT (username) DO UPDATE SET password = 'faith2025', role = 'teacher'
    `);
  } catch (e) { console.error("DB Init Error:", e); }
};

async function getRequestBody(req) {
  // 1. Se o body já foi parseado (Vercel/Connect/Express)
  if (req.body && typeof req.body === 'object') return req.body;

  // 2. Se for um GET ou HEAD, não há body
  if (req.method === 'GET' || req.method === 'HEAD') return {};

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
        const roleRequired = path.endsWith('/school/teacher/login') ? 'teacher' : 'student';

        const r = await pool.query("SELECT * FROM school_users WHERE username = $1 AND password = $2 AND role = $3", [username, password, roleRequired]);
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
          r = await pool.query("SELECT id, fullname, username, role, email, phone, status, is_credentials_generated, access_expiry, teacher_id, class_id, created_at FROM school_users WHERE role = $1 ORDER BY created_at DESC", [role]);
        } else {
          r = await pool.query("SELECT id, fullname, username, role, email, phone, status, is_credentials_generated, access_expiry, teacher_id, class_id, created_at FROM school_users ORDER BY role, created_at DESC");
        }
        return res.status(200).json(r.rows);
      }
      if (req.method === 'POST') {
        try {
          const b = await getRequestBody(req);
          const expiryVal = b.access_expiry ? new Date(b.access_expiry) : null;

          if (b.id) {
            await pool.query(
              "UPDATE school_users SET fullname=$1, username=$2, password=$3, role=$4, email=$5, phone=$6, state=$7, city=$8, neighborhood=$9, is_member=$10, church_name=$11, church_address=$12, church_phone=$13, access_expiry=$14, teacher_id=$15, class_id=$16 WHERE id=$17",
              [b.fullname, b.username, b.password, b.role || 'student', b.email, b.phone, b.state, b.city, b.neighborhood, !!b.is_member, b.church_name, b.church_address, b.church_phone, expiryVal, b.teacher_id || null, b.class_id || null, b.id]
            );
          } else {
            await pool.query(
              "INSERT INTO school_users (fullname, username, password, role, email, phone, is_credentials_generated, access_expiry, teacher_id, class_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
              [b.fullname, b.username, b.password, b.role || 'student', b.email, b.phone, true, expiryVal, b.teacher_id || null, b.class_id || null]
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
          "UPDATE system_config SET public_url=$1, public_url2=$2, public_title=$3, public_description=$4, private_url=$5, private_url2=$6, private_title=$7, private_description=$8, is_private_mode=$9, is_teacher_live=$10, live_teacher_name=$11 WHERE id=1",
          [c.public_url, c.public_url2, c.public_title, c.public_description, c.private_url, c.private_url2, c.private_title, c.private_description, !!c.is_private_mode, !!c.is_teacher_live, c.live_teacher_name]
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
