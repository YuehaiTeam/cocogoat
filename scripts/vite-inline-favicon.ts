import { Plugin } from 'vite'
import { resolve } from 'path'
import { readFileSync } from 'fs'
function inlineFavicon(): Plugin {
    return {
        name: 'vite:inline-favicon',
        enforce: 'post',
        generateBundle: (opt, bundle) => {
            const htmlFiles = Object.keys(bundle).filter((i) => i.endsWith('.html'))
            for (const name of htmlFiles) {
                const htmlChunk = bundle[name] as { source: string }
                let replacedHtml = htmlChunk.source as string
                replacedHtml = replacedHtml.replace(/<link rel="icon" href="([^"]+)"\s*\/?>/, (...args) => {
                    console.log('InlineFaviconVite:', args[1])
                    let icon = args[1]
                    if (icon[0] === '/') icon = '.' + icon
                    const path = resolve(opt.dir || __dirname, icon)
                    try {
                        const content = readFileSync(path)
                        const iconExt = path.split('.').pop()
                        const mimeType = iconExt === 'ico' ? 'image/x-icon' : `image/${iconExt}`
                        icon = `data:${mimeType};base64,${content.toString('base64')}`
                    } catch (e) {}
                    return args[0].replace(args[1], icon)
                })
                htmlChunk.source = replacedHtml
            }
        },
    }
}
export default inlineFavicon
