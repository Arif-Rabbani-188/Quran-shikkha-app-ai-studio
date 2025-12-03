import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icons/*.png', 'screenshots/*.png', 'favicon.ico'],
          devOptions: {
            enabled: true
          },
          workbox: {
            maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
            globPatterns: ['**/*.{js,css,html,ico,png,woff2}'],
            globIgnores: ['**/icons/*.svg', '**/favicon.svg'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/api\.quran\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'api-cache',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
                  }
                }
              },
              {
                urlPattern: /^https:\/\/translate\.google\.com\/translate_tts.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'audio-cache',
                  expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 60 * 60 * 24 * 30 // 1 month
                  }
                }
              },
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                  }
                }
              },
              {
                urlPattern: /^https:\/\/cdn\.tailwindcss\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'css-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 30 // 1 month
                  }
                }
              }
            ]
          },
          manifest: {
            name: 'QuranShikha - Learn Quran',
            short_name: 'QuranShikha',
            description: 'Interactive Quran learning app with Bengali translations and pronunciation guide',
            theme_color: '#10b981',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait-primary',
            scope: '/',
            start_url: '/',
            lang: 'bn',
            categories: ['education', 'books', 'lifestyle'],
            icons: [
              {
                src: 'icons/icon-72x72.png',
                sizes: '72x72',
                type: 'image/png'
              },
              {
                src: 'icons/icon-96x96.png',
                sizes: '96x96', 
                type: 'image/png'
              },
              {
                src: 'icons/icon-128x128.png',
                sizes: '128x128',
                type: 'image/png'
              },
              {
                src: 'icons/icon-144x144.png',
                sizes: '144x144',
                type: 'image/png'
              },
              {
                src: 'icons/icon-152x152.png',
                sizes: '152x152',
                type: 'image/png'
              },
              {
                src: 'icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: 'icons/icon-384x384.png',
                sizes: '384x384',
                type: 'image/png'
              },
              {
                src: 'icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
