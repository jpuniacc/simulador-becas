import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/crm': {
        target: 'http://crmadmision-qa.uniacc.cl',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/crm/, ''),
        secure: false,
        // JPS: Configuración del proxy para debugging y monitoreo de peticiones al CRM
        // Funcionamiento: Agrega listeners al proxy para registrar errores, peticiones y respuestas
        // Esto permite debuggear problemas de CORS y conexión con el servidor CRM durante desarrollo local
        // Solo se usa en localhost, en QA/DEV se envía directamente al CRM sin proxy
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})
