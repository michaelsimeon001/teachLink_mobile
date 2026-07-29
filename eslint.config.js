// https://docs.expo.dev/guides/using-eslint/
// Prettier configuration: Managed separately via .prettierrc and runs independently
// to avoid conflicts. Pre-commit hook ensures both Prettier and ESLint pass.

const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.rnstorybook/storybook.requires.ts', 'scripts/**', '**/_tests_/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11yPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // #809: Require a justification comment on every @ts-ignore or @ts-expect-error.
      // @ts-ignore suppresses ALL type errors on the next line without verifying they
      // still exist; it is easy to forget and leaves dead suppressions in the codebase.
      // @ts-expect-error is safer (fails if the suppression is no longer needed) but
      // still requires a minimum-length reason so reviewers can evaluate legitimacy.
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': 'allow-with-description',
          'ts-expect-error': 'allow-with-description',
          'ts-nocheck': true,
          'ts-check': false,
          minimumDescriptionLength: 10,
        },
      ],
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      'react/jsx-pascal-case': ['warn', { allowAllCaps: true }],
      'react/function-component-definition': [
        'warn',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'error',
      'import/no-unresolved': 'off',

      // Prevent inline component definitions that defeat memoization
      'react/no-unstable-nested-components': ['error', { allowAsProps: false }],

      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',

      // Enforce structured logging — use src/utils/logger instead of console.*
      // Logger internals may reference console internally (excluded via ignores above).
      // Note: `{ allow: [] }` is rejected by ESLint 9's rule schema, so use the
      // bare 'error' form, which disallows every console method.
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
]);