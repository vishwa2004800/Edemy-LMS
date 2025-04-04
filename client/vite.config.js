import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    proxy:{
      "/api":"http://localhost:5000",
    }
  }
  
})
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       "/api": "http://localhost:5000",
//     }
//   },
//   optimizeDeps: {
//     include: ['react', 'react-dom']
//   },
//   esbuild: {
//     jsxInject: `import React from 'react'`
//   }
  
// })
