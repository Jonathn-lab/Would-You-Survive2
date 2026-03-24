import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use /Would-You-Survive2/ base path only in production (for GitHub Pages), root path for local dev
  base: process.env.NODE_ENV === 'production' ? '/Would-You-Survive2/' : '/',
})
