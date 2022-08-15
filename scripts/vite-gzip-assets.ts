import type { Plugin } from 'vite'
import { gzipSync } from 'zlib'
const gzipAssets = function (): Plugin {
    return {
        name: 'vite-gzip-assets',
        enforce: 'post',
        async transform(code, id) {
            if (id.split('?')[1]?.includes('gzip')) {
                // eslint-disable-next-line no-new-func
                const b64str = new Function(code.replace('export default', 'return'))()
                try {
                    const fn = id.split('/').at(-1)
                    const mime = b64str.split('data:')[1].split(';')[0]
                    const data = Buffer.from(b64str.split('base64,')[1], 'base64')
                    const compressed = gzipSync(data, {
                        level: 9,
                    })
                    console.log('\nGzipped', fn, mime, data.length, '->', compressed.length)
                    return `export default "data:application/gzip;base64,${compressed.toString('base64')}"`
                } catch (e) {}
            }
        },
    } as Plugin
}
export default gzipAssets
