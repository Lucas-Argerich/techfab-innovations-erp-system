module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: 'standard',
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-trailing-spaces': 'warn',
    'padded-blocks': 'warn',
    'eol-last': 'warn'
  }
}
