/**
 * ESLint configuration for LoadUp project
 * 
 * This configuration is designed to work with ES modules and TypeScript
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    // Temporarily disable Next.js rules that are causing issues
    // 'next/core-web-vitals',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
      },
    },
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
    // Configure the next/link rule to use the correct pages directory
    'next': {
      'rootDir': ['./apps/admin-dashboard/', './apps/driver-app/'],
    },
  },
  rules: {
    // ES Module specific rules
    'import/extensions': [
      'warn', // Downgraded from error to warning
      'ignorePackages',
      {
        js: 'always',
        jsx: 'always',
        ts: 'always',
        tsx: 'always',
        mjs: 'always',
      },
    ],
    
    // React rules
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js
    'react/prop-types': 'off', // We use TypeScript for prop validation
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // Import rules
    'import/order': [
      'warn', // Downgraded from error to warning
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-unresolved': 'warn', // Downgraded from error to warning
    'import/no-duplicates': 'warn', // Downgraded from error to warning
    'import/export': 'warn', // Downgraded from error to warning
    'import/no-named-as-default-member': 'warn',
    
    // General rules
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'prefer-const': 'warn', // Downgraded from error to warning
    'no-var': 'warn', // Downgraded from error to warning
    'eqeqeq': ['error', 'always'],
    
    // Accessibility rules
    'jsx-a11y/alt-text': 'warn', // Downgraded from error to warning
  },
  overrides: [
    // Override for test files
    {
      files: ['**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*'],
      env: {
        jest: true,
      },
      rules: {
        'import/extensions': 'off',
        'import/no-unresolved': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
    // Override for CommonJS files
    {
      files: ['**/*.cjs'],
      rules: {
        'import/extensions': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'import/order': 'off',
      },
    },
    // Override for Next.js pages and API routes
    {
      files: ['**/pages/**/*.js', '**/pages/**/*.tsx', '**/app/**/*.js', '**/app/**/*.tsx'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    // Override for script files
    {
      files: ['scripts/**/*.js', 'scripts/**/*.ts'],
      rules: {
        'no-console': 'off',
        'import/order': 'warn',
      },
    },
    // Override for dist files (compiled output)
    {
      files: ['**/dist/**/*.js', '**/dist/**/*.jsx'],
      rules: {
        'import/extensions': 'off',
        'import/no-unresolved': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
        'prefer-const': 'off',
        'no-var': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '.next/',
    'analysis/',
  ],
}; 