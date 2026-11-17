import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  plugins: [tailwindcss(), react()],
  ssr: {
    // Bundle everything only for the production build (needed on Vercel).
    // In dev, let Node load react-dom/server and other deps normally.
    noExternal: command === 'build' ? true : undefined,
  },
}))