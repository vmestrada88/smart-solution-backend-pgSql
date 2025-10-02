import js from '@eslint/js';


export default [
  js.configs.recommended,
  {
    ignores: ['node_modules/**', 'assets/**']
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        performance: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        options: 'readonly',
        setTimeout: 'readonly',
        __dirname: 'readonly',
      }
    },
    plugins: {
      
    },
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'windows'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-unused-vars': 'error'
    }
  }
];