import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import handler from './api/server.js';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  return {
    plugins: [
      react(),
      {
        name: 'api-dev-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api')) {
              try {
                await handler(req, res);
              } catch (e) {
                console.error("Vite API Middleware Error:", e);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
              }
            } else if (req.url && req.url.startsWith('/uploads/')) {
              const filePath = path.join(process.cwd(), 'public', req.url);
              if (fs.existsSync(filePath)) {
                fs.createReadStream(filePath).pipe(res);
              } else {
                next();
              }
            } else {
              next();
            }
          });
        }
      }
    ],
    server: {
      port: 3000,
      host: true
    },
    build: {
      outDir: 'dist'
    }
  };
});
