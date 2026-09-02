import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// nothing fancy here, just the standard vite + react setup we used in class
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
