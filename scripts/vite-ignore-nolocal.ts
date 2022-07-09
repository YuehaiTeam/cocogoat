import type { Plugin } from 'vite'
const ignoreNoLocal = function (): Plugin {
    return {
        name: 'vite-ignore-nolocal',
        enforce: 'pre',
        async transform(code, id) {
            if (id.split('?')[1]?.includes('nolocal')) {
                return `export default ""`
            }
        },
    } as Plugin
}
export default ignoreNoLocal
