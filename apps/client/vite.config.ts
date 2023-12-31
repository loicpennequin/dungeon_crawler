import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VueRouterAutoImports } from 'unplugin-vue-router';
import { fileURLToPath, URL } from 'node:url';
import AutoImport from 'unplugin-auto-import/vite';
import VueRouter from 'unplugin-vue-router/vite';
import Components from 'unplugin-vue-components/vite';
import { ArkUiResolver } from './tools/ark-ui-resolver';
import { compilerOptions, transformAssetUrls } from 'vue3-pixi';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

const BUILD_OUTPUT_DIR = path.resolve(process.cwd(), '../server/public');

export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: fileURLToPath(new URL('./src/pages', import.meta.url)),
      dts: './typed-router.d.ts'
    }),

    vue({
      reactivityTransform: true,
      template: {
        compilerOptions,
        transformAssetUrls
      },
      script: {
        defineModel: true
      }
    }),

    AutoImport({
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: [
        'vue',
        '@vueuse/core',
        'vee-validate',
        'vue-i18n',
        VueRouterAutoImports,
        {
          '@tanstack/vue-query': [
            'useQuery',
            'useQueries',
            'useMutation',
            'useInfiniteQuery',
            'useQueryClient'
          ]
        }
      ],
      dirs: ['./src/features/**/composables', './src/features/**/composables/**']
    }),

    Components({
      dts: true,
      extensions: ['vue'],
      globs: ['./src/features/**/components/**/*.vue'],
      directoryAsNamespace: false,
      resolvers: [ArkUiResolver]
    }),

    VitePWA({
      registerType: 'prompt',
      srcDir: 'src',
      filename: 'sw.ts',
      strategies: 'injectManifest',
      devOptions: {
        enabled: false,
        type: 'module'
      },
      manifest: {
        name: 'Dungeon Crawler',
        short_name: 'DC',
        description: 'GOTY fr fr',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icon/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icon/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  server: {
    port: 3000
  },

  build: {
    outDir: BUILD_OUTPUT_DIR,
    emptyOutDir: true
  }
});
