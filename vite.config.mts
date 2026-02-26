// Plugins
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Fonts from 'unplugin-fonts/vite'
import Layouts from 'vite-plugin-vue-layouts-next'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import browserslistToEsbuild from 'browserslist-to-esbuild'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import VueRouter from 'vue-router/vite'
import path from 'path'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build: {
    target: browserslistToEsbuild(),
    modulePreload: {
      polyfill: false
    }
  },
  plugins: [
    VueRouter({
      dts: 'src/route-map.d.ts',
    }),
    Layouts(),
    AutoImport({
      imports: [
        'vue',
        {
          'vue-router/auto': ['useRoute', 'useRouter'],
        }
      ],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
      vueTemplate: true,
    }),
    Components({
      dts: 'src/components.d.ts',
    }),
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    VueI18nPlugin({
      include: [path.resolve(__dirname, './src/locales/**')],
      compositionOnly: true,
      // Hilft beim Debugging von fehlenden Keys
      runtimeOnly: false,
    }),
    Fonts({
      fontsource: {
        families: [
          {
            name: 'Roboto',
            weights: [100, 300, 400, 500, 700, 900],
            styles: ['normal', 'italic'],
          },
        ],
      },
      custom: {
        families: [
          {
            name: 'Material Design Icons',
            local: 'Material Design Icons',
            src: './node_modules/@mdi/font/fonts/materialdesignicons-webfont.woff2',
          },
        ],
        display: 'block',
        preload: false,
      },
    }),
    {
      name: 'exclude-unused-fonts',
      // Dieser Hook wird aufgerufen, bevor Vite ein Asset generiert
      generateBundle(_, bundle) {
        for (const fileName in bundle) {
          // Prüfe auf die Dateiendungen, die du NICHT willst
          if (fileName.match(/\.(ttf|eot|woff|otf)$/)) {
            delete bundle[fileName];
            console.log(`🗑️  Asset entfernt: ${fileName}`);
          }
        }
      }
    }
    // {
    //   name: 'remove-mdi-preloads',
    //   enforce: "post",
    //   transformIndexHtml: {
    //     order: 'post',
    //     handler(html) {
    //       // Entfernt die störenden Preload-Links für die alten Formate im finalen Build
    //       return html.replace(/<link rel="preload" [^>]+?\.(eot|ttf|woff)(?!\d)[^>]*?>/g, '')
    //     }
    //   }
    // }
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3001,
    allowedHosts: true
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler',
      } as any,
    },
  },
})
