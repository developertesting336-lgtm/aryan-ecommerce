// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from  '@tailwindcss/vite'
// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [tailwindcss(),react()],
// })


// import { defineConfig } from "vite";
// import { reactRouter } from "@react-router/dev/vite";
// import tailwindcss from "@tailwindcss/vite";

// export default defineConfig({
//   plugins: [tailwindcss(), reactRouter()],
// });


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  // Bundle every dependency into dist/server/entry-server.js so the Vercel
  // function never has to resolve packages from node_modules at runtime
  // (that was failing with "Cannot find module .../react-router/...").
  ssr: {
    noExternal: true,
  },
})