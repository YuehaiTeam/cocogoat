import ortWasm from 'onnxruntime-web/dist/ort-wasm.wasm?url&nolocal'
import ortWasmMT from 'onnxruntime-web/dist/ort-wasm-threaded.wasm?url&nolocal'
import ortWasmSIMD from 'onnxruntime-web/dist/ort-wasm-simd.wasm?url&gzip'
import ortWasmSIMDMT from 'onnxruntime-web/dist/ort-wasm-simd-threaded.wasm?url&nolocal'

import cvWasmNormal from '@/plugins/opencv/opencv-normal.wasm?url&nolocal'
import cvWasmSimd from '@/plugins/opencv/opencv-simd.wasm?url&gzip'

import ocrModel from '@/plugins/ocr/ppocr.ort?url&gzip'
import yasModel from '@/plugins/yas/yas.ort?url&gzip'

import resources, { IResourceItem, resourceInfo, setResources } from '@/resources'
import testResources from '@/../resources.json'
import { ElMessageBox } from 'element-plus'
import 'element-plus/theme-chalk/el-overlay.css'
import 'element-plus/theme-chalk/el-message-box.css'

function absoluteify(url: string) {
    if (url.startsWith('data:') || url.startsWith('blob:')) return url
    return new URL(url, location.href).href.replace('?url', '').replace('?url&nolocal', '')
}

export const defaultResources = {
    'ort-wasm-simd-threaded.wasm': absoluteify(ortWasmSIMDMT),
    'ort-wasm-simd.wasm': absoluteify(ortWasmSIMD),
    'ort-wasm-threaded.wasm': absoluteify(ortWasmMT),
    'ort-wasm.wasm': absoluteify(ortWasm),
    'opencv-normal.wasm': absoluteify(cvWasmNormal),
    'opencv-simd.wasm': absoluteify(cvWasmSimd),
    'ppocr.ort': absoluteify(ocrModel),
    'yas.ort': absoluteify(yasModel),
} as Record<string, string>

export const absoluteSizes = {
    'ort-wasm-simd-threaded.wasm': 6416737,
    'ort-wasm-simd.wasm': 7177826,
    'ort-wasm-threaded.wasm': 5959415,
    'ort-wasm.wasm': 6765843,
    'opencv-normal.wasm': 3548861,
    'opencv-simd.wasm': 4752861,
    'ppocr.ort': 4504512,
    'yas.ort': 8928032,
} as Record<string, number>

export function speedTest() {
    if (window && navigator && navigator.serviceWorker && navigator.serviceWorker.controller) {
        const swResUrls = {} as typeof resources
        Object.keys(defaultResources).forEach((key) => {
            swResUrls[key] = `/_sw/resources/${key}`
        })
        setResources(swResUrls)
        return []
    }
    if (process.env.VUE_APP_LOCALRES === 'true' && window && !location.href.includes('forceCDN')) {
        return []
    }
    // group testresources by tag
    const testResourcesByTag = testResources.reduce(
        (acc, item) => {
            const tag = item.tag
            if (!acc[tag]) {
                acc[tag] = []
            }
            acc[tag].push(item)
            return acc
        },
        {} as Record<string, IResourceItem[]>,
    ) as Record<string, IResourceItem[]>
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
    return [Promise.allSettled(allPromises), Promise.allSettled(waitPromises)]
}
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pako: any
    }
}
export function getBlobWithProgress(
    url: string,
    onprogress: (finished: number, total: number) => unknown,
    fallbackSize = 8 * 1024 * 1024, // 8M
): Promise<Blob> {
    if (url.startsWith('data:application/gzip')) {
        return (async () => {
            const f = fetch(url)
            try {
                if (window.DecompressionStream) {
                    const ds = new window.DecompressionStream('gzip')
                    const response = await f
                    if (!response.body) {
                        throw new Error('No body')
                    }
                    const decompressedStream = response.body.pipeThrough(ds)
                    console.log('Decompressed successfully using stream')
                    return await new Response(decompressedStream).blob()
                } else {
                    throw new Error('DecompressionStream not available')
                }
            } catch (e) {
                if (!document.querySelector('.el-overlay.is-message-box'))
                    ElMessageBox({
                        title: '出错了！',
                        message: '您当前的浏览器版本过低，请升级浏览器或连接网络再试。',
                        showConfirmButton: false,
                        showClose: false,
                        closeOnClickModal: false,
                        closeOnPressEscape: false,
                    })
                throw new Error('cannot decompress file')
            }
        })()
    } else if (url.startsWith('data:')) {
        return fetch(url).then((res) => res.blob())
    }
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'blob'
    xhr.onprogress = (e) => {
        let total = 0
        if (e.lengthComputable) {
            total = e.total
        } else {
            total = Number(xhr.getResponseHeader('content-length') || fallbackSize)
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
        .filter((item) => !item.url.includes('blob:'))
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
                    const blob = await getBlobWithProgress(
                        url,
                        (finished, total) => {
                            obj.progress = Math.min(finished / total, 1)
                            sendProgress()
                        },
                        absoluteSizes[name],
                    )
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
    for (const item of ret) {
        if (location.protocol === 'file:') {
            // blob not supported in file protocol, use base64 instead
            resources[item.name] = await blobToBase64(item.blob)
        } else {
            resources[item.name] = URL.createObjectURL(item.blob)
        }
    }
}
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
    })
}
