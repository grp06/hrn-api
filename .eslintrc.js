module.exports = {
  root: true,
  extends: ['airbnb', 'prettier'],
  plugins: ['prettier', 'mocha'],
  rules: {
    'prettier/prettier': ['error'],
    'no-unused-vars': [
      'warn',
      {
        varsIgnorePattern: 'should|expect',
      },
    ],
    'no-console': 'off',
    'func-names': 'off',
    'no-process-exit': 'off',
    'object-shorthand': 'off',
    'class-methods-use-this': 'off',
    'react/jsx-filename-extension': 0,
    'no-param-reassign': 'off',
    'react-hooks/exhaustive-deps': 'off',
    camelcase: 'off',
    'import/prefer-default-export': 'off',
    'react/prop-types': 'off',
    // globals: {
    //   __logger: 'readonly',
    // },

    'no-underscore-dangle': [
      'error',
      {
        allow: ['__logger'],
      },
    ],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      env: { browser: true, es6: true, node: true },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      globals: { Atomics: 'readonly', SharedArrayBuffer: 'readonly' },
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2018,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      plugins: ['@typescript-eslint'],
      rules: {
        indent: ['error', 2, { SwitchCase: 1 }],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        'comma-dangle': ['error', 'always-multiline'],
        '@typescript-eslint/no-explicit-any': 0,
      },
    },
  ],
}
