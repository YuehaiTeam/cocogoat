module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'alloy',
        'alloy/vue',
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/typescript/recommended',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2020,
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'prettier/prettier': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    },
}
