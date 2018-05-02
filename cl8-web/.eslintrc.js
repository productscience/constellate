// https://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
  },
  env: {
    browser: true,
    jest: true,
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#bulb-rules
    'plugin:vue/recommended',
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard',
    // https://github.com/prettier/eslint-config-prettier
    'prettier',
    'prettier/standard',
  ],
  // required to lint *.vue files
  plugins: ['html', 'prettier'],
  // add your custom rules here
  rules: {
    // // allow paren-less arrow functions
    // 'arrow-parens': 0,
    'space-before-function-paren': 1,
    // 'consistent-return': 1,
    // // allow async-await
    // 'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
  },
}
