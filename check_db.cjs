const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL });

async function check() {
    try {
        const res = await pool.query("SELECT is_teacher_live, live_teacher_id, live_teacher_name FROM system_config WHERE id=1");
        console.log("DADOS ATUAIS DA LIVE:");
        console.table(res.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
