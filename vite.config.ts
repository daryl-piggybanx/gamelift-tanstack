import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  // optimizeDeps: {
  //   exclude: [
  //     'gameliftstreams-1.0.0.js', 
  //     'gameliftstreams-1.0.0.mjs'
  //   ], // don't pre-bundle SDK
  // },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    },
    port: 3000,
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart(),
  ],
  // assetsInclude: ['**/*.js', '**/*.mjs']
})
