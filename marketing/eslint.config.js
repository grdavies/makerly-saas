import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

export default createConfigForNuxt({
  features: {
    // Enable features you want to use
    tooling: true,
    typography: true,
  },
  rules: {
    // Customize rules for our codebase
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': 'allow-with-description',
        'ts-nocheck': 'allow-with-description',
        'ts-check': false,
      },
    ],
    'no-case-declarations': 'off', // Allow declarations in case blocks
    'no-useless-escape': 'off', // Allow escape characters in regex
    'unicorn/prefer-number-properties': 'off', // Allow parseInt/parseFloat and isNaN
    'vue/attributes-order': 'warn',
    'vue/require-default-prop': 'warn',
    'vue/html-self-closing': 'warn',
  },
});
