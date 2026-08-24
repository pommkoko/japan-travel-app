import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // ใช้ public/manifest.json เดิมที่มีอยู่แล้ว ไม่ต้อง generate ใหม่
      injectRegister: 'auto', // inject โค้ดลงทะเบียน Service Worker ให้อัตโนมัติ
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // ห้าม cache request ไปยัง Supabase เด็ดขาด (กันข้อมูลค้าง/error ตอนออฟไลน์)
            urlPattern: ({ url }) => url.origin.includes('supabase.co'),
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ],
})
