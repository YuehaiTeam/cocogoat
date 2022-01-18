import ortWasm from 'onnxruntime-web/dist/ort-wasm.wasm?raw'
import ortWasmMT from 'onnxruntime-web/dist/ort-wasm-threaded.wasm?raw'
import ortWasmSIMD from 'onnxruntime-web/dist/ort-wasm-simd.wasm?raw'
import ortWasmSIMDMT from 'onnxruntime-web/dist/ort-wasm-simd-threaded.wasm?raw'

import cvWasmNormal from '@/plugins/opencv/opencv-normal.wasm?raw'
import cvWasmSimd from '@/plugins/opencv/opencv-simd.wasm?raw'

import ocrModel from '@/plugins/ocr/ppocr.ort?raw'

import testResources from '@/../resources.json'

const defaultResources = {
    'ort-wasm-simd-threaded.wasm': ortWasmSIMDMT.replace('?raw', ''),
    'ort-wasm-simd.wasm': ortWasmSIMD.replace('?raw', ''),
    'ort-wasm-threaded.wasm': ortWasmMT.replace('?raw', ''),
    'ort-wasm.wasm': ortWasm.replace('?raw', ''),
    'opencv-normal.wasm': cvWasmNormal.replace('?raw', ''),
    'opencv-simd.wasm': cvWasmSimd.replace('?raw', ''),
    'ppocr.ort': ocrModel.replace('?raw', ''),
} as Record<string, string>

export interface IResourceItem {
    tag: string
    test: string
    prefix?: string
    resources: Record<string, string>
}

const resources = {
    ...defaultResources,
}
export default resources
export function setResources(r: typeof defaultResources) {
    for (const key in r) {
        if (Object.prototype.hasOwnProperty.call(r, key)) {
            resources[key] = r[key] || defaultResources[key]
        }
    }
}

export async function speedTest() {
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
    }
    return await Promise.allSettled(allPromises)
}
