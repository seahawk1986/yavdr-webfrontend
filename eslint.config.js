import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import vueParser from 'vue-eslint-parser'
import globals from 'globals' // Neu importieren

export default [
  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      'vendor/**',
      // HIER: Dateien ausschließen, die nicht in der tsconfig sind
      'src/pages/Installer/**',
      'src/pages/VDR/SetupEditor2.vue'
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  {
    name: 'app/main-rules',
    files: ['**/*.{ts,mts,tsx,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        // Falls du Auto-Imports nutzt, füge hier die globalen Vue-Funktionen hinzu:
        ref: 'readonly',
        computed: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        Ref: 'readonly', // Für TypeScript Typen
      },
    },
    rules: {
      // 1. Unbenutzte Variablen lockern (erlaubt _variable)
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }],

      // 2. Deine bestehenden Regeln
      '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
      'no-undef': 'off',
      'no-redeclare': 'warn',

      // 3. Spezifische Vue Fixes aus deinem Log
      'vue/return-in-computed-property': 'error',
      'vue/valid-template-root': 'warn',
    },
  },

  eslintConfigPrettier,
]