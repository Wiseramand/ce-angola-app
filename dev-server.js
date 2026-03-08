import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import handler from './api/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Middleware to parse JSON
app.use(express.json());

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for local dev
});

app.post('/api/school/upload', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum ficheiro recebido' });
    res.json({ url: `/uploads/${req.file.filename}` });
});

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
