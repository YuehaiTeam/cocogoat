import { Plugin } from 'vite'
export function singleFileHTML(): Plugin {
    return {
        name: 'vite:singlefile-html',
        enforce: 'post',
        generateBundle: (_, bundle) => {
            const htmlFiles = Object.keys(bundle).filter((i) => i.endsWith('.html'))
            const bundlesToDelete = [] as string[]
            for (const name of htmlFiles) {
                const htmlChunk = bundle[name] as { source: string }
                let replacedHtml = htmlChunk.source as string
                replacedHtml = replacedHtml.replace(/"__VITE_PRELOAD__"/g, 'void 0')
                htmlChunk.source = replacedHtml
            }
        },
    }
}
