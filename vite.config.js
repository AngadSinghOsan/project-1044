import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://project-1044.vercel.app',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})