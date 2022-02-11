import ortWasm from 'onnxruntime-web/dist/ort-wasm.wasm?raw'
import ortWasmMT from 'onnxruntime-web/dist/ort-wasm-threaded.wasm?raw'
import ortWasmSIMD from 'onnxruntime-web/dist/ort-wasm-simd.wasm?raw'
import ortWasmSIMDMT from 'onnxruntime-web/dist/ort-wasm-simd-threaded.wasm?raw'

import cvWasmNormal from '@/plugins/opencv/opencv-normal.wasm?raw'
import cvWasmSimd from '@/plugins/opencv/opencv-simd.wasm?raw'

import ocrModel from '@/plugins/ocr/ppocr.ort?raw'

import testResources from '@/../resources.json'

function absoluteify(url: string) {
    return new URL(url, location.href).href.replace('?raw', '')
}

const defaultResources = {
    'ort-wasm-simd-threaded.wasm': absoluteify(ortWasmSIMDMT),
    'ort-wasm-simd.wasm': absoluteify(ortWasmSIMD),
    'ort-wasm-threaded.wasm': absoluteify(ortWasmMT),
    'ort-wasm.wasm': absoluteify(ortWasm),
    'opencv-normal.wasm': absoluteify(cvWasmNormal),
    'opencv-simd.wasm': absoluteify(cvWasmSimd),
    'ppocr.ort': absoluteify(ocrModel),
} as Record<string, string>

export interface IResourceItem {
    tag: string
    test: string
    prefix?: string
    resources: Record<string, string>
}
export interface IResourceInfo {
    urls: string[]
    blob: Blob | null
    tested: boolean
}

const resources = {
    ...defaultResources,
}
const resourceInfo = {} as Record<string, IResourceInfo>
Object.keys(resources).forEach((key) => {
    resourceInfo[key] = {
        urls: [],
        blob: null,
        tested: false,
    }
})
export default resources
export function setResources(r: typeof defaultResources) {
    for (const key in r) {
        if (Object.prototype.hasOwnProperty.call(r, key)) {
            resources[key] = r[key] || defaultResources[key]
        }
    }
}

export function speedTest() {
    if (process.env.NODE_ENV === 'development' && !location.href.includes('forceCDN')) {
        return []
    }
    // group testresources by tag
    const testResourcesByTag = testResources.reduce((acc, item) => {
        const tag = item.tag
        if (!acc[tag]) {
            acc[tag] = []
        }
        acc[tag].push(item)
        return acc
    }, {} as Record<string, IResourceItem[]>) as Record<string, IResourceItem[]>
    // test each tag
    const allPromises = [] as Promise<IResourceItem>[]
    const waitPromises = [] as Promise<IResourceItem>[]
    for (const tag of Object.keys(testResourcesByTag)) {
        const items = testResourcesByTag[tag]
        const promises = items.map((item) =>
            (async () => {
                const ret = await fetch((item.prefix || '') + item.test, {
                    method: 'HEAD',
                    mode: 'cors',
                })
                if (!ret.ok) {
                    throw new Error(`${item.test} is not available`)
                }

                const r1 = { ...item.resources }
                for (const key of Object.keys(r1)) {
                    resourceInfo[key].urls.push((item.prefix || '') + r1[key])
                }
                return item
            })(),
        )
        allPromises.push(
            Promise.any(promises).then((item) => {
                const r1 = { ...item.resources }
                for (const key of Object.keys(r1)) {
                    r1[key] = (item.prefix || '') + r1[key]
                }
                setResources(r1)
                return item
            }),
        )
        waitPromises.push(...promises)
    }
    return [Promise.allSettled(allPromises), Promise.all(waitPromises)]
}
export function getBlobWithProgress(
    url: string,
    onprogress: (finished: number, total: number) => unknown,
): Promise<Blob> {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'blob'
    xhr.onprogress = (e) => {
        let total = 0
        const fallbackSize = 8 * 1024 * 1024 // 8M
        if (e.lengthComputable) {
            total = e.total
        } else {
            total = Number(xhr.getResponseHeader('content-length') || fallbackSize)
            total *= 1.1 // For gzipped file
        }
        if (total > 0) onprogress(e.loaded, total)
    }
    return new Promise((resolve, reject) => {
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response)
            } else {
                reject(new Error(`${xhr.status} ${xhr.statusText}`))
            }
        }
        xhr.onerror = () => {
            reject(new Error(`${xhr.status} ${xhr.statusText}`))
        }
        xhr.send()
    })
}
export async function requireAsBlob(
    names: string[],
    onprogress: (progress: number) => unknown,
    allSettled?: Promise<unknown>,
) {
    const urls = names
        .map((name) => ({
            name,
            url: resources[name],
            progress: 0,
        }))
        .filter((item) => !item.url.includes('blob:') && !item.url.includes('data:'))
    const sendProgress = () => {
        onprogress(Math.round((urls.reduce((acc, item) => acc + item.progress, 0) / urls.length) * 9999) / 100)
    }
    const promises = urls.map((obj) => {
        const { name, url } = obj
        function loadUrl() {
            const allUrls = [url, ...resourceInfo[name].urls]
            while (allUrls[0] === allUrls[1]) {
                allUrls.shift()
            }
            return allUrls
        }
        return (async function (name): Promise<{ name: string; blob: Blob }> {
            let allUrls = loadUrl()
            let failTimes = 0
            let url: string | undefined
            while ((url = allUrls.shift())) {
                try {
                    const blob = await getBlobWithProgress(url, (finished, total) => {
                        obj.progress = Math.min(finished / total, 1)
                        sendProgress()
                    })
                    return { name, blob }
                } catch (e) {
                    if (failTimes === 0) {
                        allSettled && (await allSettled)
                        allUrls = loadUrl().filter((u) => u !== url)
                    }
                    failTimes++
                    console.error('资源加载失败, 重试：', e)
                }
            }
            throw new Error('资源加载失败')
        })(name)
    })
    const ret = await Promise.all(promises)
    ret.forEach((item) => {
        resources[item.name] = URL.createObjectURL(item.blob)
    })
}
