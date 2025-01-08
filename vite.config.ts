import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    // (Optional) specify the port you want Vite to run on.
    // The default is 5173, but you can change it if needed:
    // port: 3000,

    proxy: {
      // This means any request to "/api" will be proxied to the Django server at 127.0.0.1:8000
      '/api': {
        target: 'http://127.0.0.1:8000', // Your Django address
        changeOrigin: true,
        // optionally:
        // rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})