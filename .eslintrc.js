module.exports = {
    root: true,
    parser: 'vue-eslint-parser',
    parserOptions: {
        // 设置 js 的解析器为 @babel/eslint-parser
        // https://github.com/mysticatea/vue-eslint-parser#-options
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2020,
        // ECMAScript modules 模式
        sourceType: 'module',
        ecmaFeatures: {
            // 不允许 return 语句出现在 global 环境下
            globalReturn: false,
            // 开启全局 script 模式
            impliedStrict: true,
            jsx: true,
        },
        // 即使没有 babelrc 配置文件，也使用 @babel/eslint-parser 来解析
        requireConfigFile: false,
        // 仅允许 import export 语句出现在模块的顶层
        allowImportExportEverywhere: false,
    },
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
