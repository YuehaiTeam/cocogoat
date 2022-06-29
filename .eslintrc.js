module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'alloy',
        'plugin:vue/vue3-essential',
        'alloy/vue',
        'eslint:recommended',
        '@vue/typescript/recommended',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2020,
    },
    rules: {
        'no-console': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'prettier/prettier': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'vue/multi-word-component-names': 'off',
        'vue/no-empty-component-block': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'vue/no-duplicate-attributes': [
            'error',
            {
                allowCoexistClass: true,
                allowCoexistStyle: true,
            },
        ],
        'vue/custom-event-name-casing': 'off',
    },
}
