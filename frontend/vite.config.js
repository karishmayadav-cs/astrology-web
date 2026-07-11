import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        proxyTimeout: 120000,   // 2 minutes — daily-analysis makes 2 sequential Groq calls
        timeout: 120000,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            console.error('[Vite Proxy Error]', err.code, err.message);
            // Only send a response if headers haven't been sent yet
            if (res && !res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Backend server is not running or is unreachable. Start it with: node backend/server.js' }));
            }
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
