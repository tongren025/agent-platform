import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { copyFileSync, cpSync, mkdirSync } from 'node:fs'

export default defineConfig({
  base: '/agent-canvas/',
  // 不复制上游 public/ 中的品牌 Logo；只发布工作台实际需要的样式和提示素材。
  publicDir: false,
  plugins: [
    react(),
    {
      name: 'agent-studio-public-assets',
      closeBundle() {
        const outDir = resolve(__dirname, '../../web/public/agent-canvas')
        mkdirSync(outDir, { recursive: true })
        copyFileSync(
          resolve(__dirname, 'public/tailwind.generated.css'),
          resolve(outDir, 'tailwind.generated.css'),
        )
        cpSync(
          resolve(__dirname, 'public/prompt-media'),
          resolve(outDir, 'prompt-media'),
          { recursive: true },
        )
      },
    },
  ],
  // Vite library mode does not replace CommonJS `process.env.NODE_ENV` by default.
  // React/Mantine/Immer still contain that guard; without this define the browser
  // throws “process is not defined” before mountAgentStudioCanvas can render.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'scheduler', 'use-sync-external-store', 'three'],
    alias: [
      {
        find: /^@tabler\/icons-react$/,
        replacement: resolve(__dirname, 'src/vendor/tablerIcons.ts'),
      },
    ],
  },
  worker: {
    format: 'es',
  },
  build: {
    outDir: resolve(__dirname, '../../web/public/agent-canvas'),
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/agentStudioMount.tsx'),
      formats: ['es'],
      fileName: () => 'agent-canvas.js',
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => (
          assetInfo.name?.endsWith('.css')
            ? 'agent-canvas.css'
            : 'assets/[name]-[hash][extname]'
        ),
      },
    },
  },
})
