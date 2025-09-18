import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  root: './playground',
  base: '/vue-otp-input/',
  build: {
    outDir: '../playground-dist',
  },
  server: {
    port: 3000,
  },
})
