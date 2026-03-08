
import express from 'express';
import handler from './api/server.js';

const app = express();
const port = 3001;

// Middleware to parse JSON
app.use(express.json());

// Proxy all /api requests to the Vercel handler
app.all('/api/*', async (req, res) => {
    // Mocking the Vercel request/response object if needed
    // But here we can just call our handler directly
    try {
        await handler(req, res);
    } catch (err) {
        console.error("Local Dev Server Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Local API Server running at http://localhost:${port}`);
    console.log(`Proxy /api requests to this server in vite.config.ts`);
});
