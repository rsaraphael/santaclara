import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-products-json',
      writeBundle() {
        copyFileSync(
          resolve(__dirname, 'src/products.json'),
          resolve(__dirname, 'd/products.json')
        )
      },
    },
  ],
  base: '',
  build: {
    outDir: 'd',
    copyPublicDir: false,
  },
})
