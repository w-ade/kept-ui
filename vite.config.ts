import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose on the LAN so the lab can be opened on a phone.
  server: { host: true, port: 5190, strictPort: true },
})
