import type { Plugin } from 'vite'
const dictCompress = function (): Plugin {
    return {
        name: 'vite-dict-compress',
        enforce: 'post',
        async transform(code, id) {
            if (id.split('?')[1]?.includes('dictcompress')) {
                const origstr = new Function(code.replace('export default', 'return'))()
                const newstr = origstr.replace(/\r/g, '').replace(/\n/g, '')
                return `export default ${JSON.stringify(newstr)}`
            }
        },
    } as Plugin
}
export default dictCompress
