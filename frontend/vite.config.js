import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      "csc342-503.csc.ncsu.edu"
    ],
    watch: {
      usePolling: true,
      interval: 100
    }
  }
})