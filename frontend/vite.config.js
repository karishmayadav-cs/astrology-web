import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_BACKEND_URL || process.env.VITE_BACKEND_URL || 'http://localhost:5000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendTarget,
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
                res.end(JSON.stringify({ error: `Backend server is not running or is unreachable at ${backendTarget}.` }));
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
  };
});

