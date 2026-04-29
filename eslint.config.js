// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require('eslint/config');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const expoConfig = require('eslint-config-expo/flat');
const pluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const pluginUnusedImports = require('eslint-plugin-unused-imports');
const pluginSimpleImportSort = require('eslint-plugin-simple-import-sort');
const pluginJest = require('eslint-plugin-jest');

module.exports = defineConfig([
  expoConfig,
  globalIgnores([
    'dist/*',
    '.expo/*',
    'android/*',
    'ios/*',
    'node_modules/*',
    'coverage/*',
    'components/ui/*',
    '**/*.md',
  ]),
  {
    plugins: {
      '@typescript-eslint': tsPlugin,
      'unused-imports': pluginUnusedImports,
      'simple-import-sort': pluginSimpleImportSort,
    },
    rules: {
      'prefer-destructuring': [
        'warn',
        {
          object: true,
          array: false,
        },
        {
          enforceForRenamedProperties: false,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'unused-imports/no-unused-imports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react', '^expo', '^@?\\w'], // External packages
            ['^@/components/ui/', '^\\./ui/'], // Gluestack UI components
            ['^@/', '^\\./', '^.+\\.s?css$'], // Internal modules and styles
          ],
        },
      ],
    },
  },
  {
    files: ['__tests__/**/*.{ts,tsx}', '**/*.{spec,test}.{ts,tsx}'],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
  pluginPrettierRecommended,
]);
