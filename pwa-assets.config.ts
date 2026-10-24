import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config'

// Generates the PNG app icons from the logo. Run with: npm run icons
export default defineConfig({
  preset: {
    ...preset,
    // Android crops icons into circles or squircles, so fill the edges with the tile color
    maskable: { sizes: [512], padding: 0.3, resizeOptions: { background: '#ffd64a' } },
    // iOS rounds the corners itself and does not allow transparency
    apple: { sizes: [180], padding: 0.15, resizeOptions: { background: '#ffd64a' } },
  },
  images: ['public/favicon.svg'],
})
