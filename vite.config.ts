import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || '')
    },
    build: {
      rollupOptions: {
        output: {
          // Function form matches every module id (react/jsx-runtime,
          // react-dom/client, motion/react, ...) which the object form misses.
          manualChunks(id) {
            if (id.includes('node_modules/react')) return 'react';
            if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) return 'motion';
            if (id.includes('node_modules/gsap')) return 'gsap';
            if (id.includes('node_modules/@vis.gl') || id.includes('node_modules/@googlemaps')) return 'maps';
            if (id.includes('node_modules/@supabase')) return 'supabase';
            if (id.includes('node_modules/@base-ui')) return 'baseui';
            if (id.includes('node_modules/lucide-react')) return 'lucide';
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—HMR is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/chat': {
          target: process.env.AI_CHAT_API_URL || 'http://localhost:3002',
          changeOrigin: true,
        },
        '/api/trip-planner/generate': {
          target: process.env.AI_CHAT_API_URL || 'http://localhost:3002',
          changeOrigin: true,
        },
        '/api/weather/home': {
          target: process.env.AI_CHAT_API_URL || 'http://localhost:3002',
          changeOrigin: true,
        },
      },
    },
  };
});
