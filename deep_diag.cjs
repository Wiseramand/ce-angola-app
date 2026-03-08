const { Pool } = require('pg');

async function runDiagnostics() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL });
    try {
        console.log("--- STARTING DEEP DIAGNOSTICS ---");

        // 1. Check DB System Config
        const configRes = await pool.query("SELECT is_teacher_live, live_teacher_id, live_teacher_name FROM system_config WHERE id = 1");
        console.log("\n[1] SYSTEM CONFIG:");
        console.table(configRes.rows);

        // 2. Check Signaling Table
        const sigRes = await pool.query("SELECT id, sender_id, receiver_id, type, created_at FROM live_signaling ORDER BY created_at DESC LIMIT 10");
        console.log("\n[2] RECENT SIGNALS (max 10):");
        if (sigRes.rows.length === 0) console.log("No signals found.");
        else console.table(sigRes.rows);

        console.log("\n--- DIAGNOSTICS COMPLETE ---");
    } catch (e) {
        console.error("DIAGNOSTICS FAILED:", e);
    } finally {
        await pool.end();
    }
}

runDiagnostics();
