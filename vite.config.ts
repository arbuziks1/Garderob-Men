import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: {
    // .trycloudflare.com — для временных ссылок через `cloudflared tunnel`,
    // чтобы показать локальный dev-сервер клиенту/себе на телефоне.
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
})
