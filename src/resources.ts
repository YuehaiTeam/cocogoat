import ortWasm from 'onnxruntime-web/dist/ort-wasm.wasm?raw'
import ortWasmMT from 'onnxruntime-web/dist/ort-wasm-threaded.wasm?raw'
import ortWasmSIMD from 'onnxruntime-web/dist/ort-wasm-simd.wasm?raw'
import ortWasmSIMDMT from 'onnxruntime-web/dist/ort-wasm-simd-threaded.wasm?raw'

import cvWasmNormal from '@/plugins/opencv/opencv-normal.wasm?raw'
import cvWasmSimd from '@/plugins/opencv/opencv-simd.wasm?raw'

const defaultResources = {
    'ort-wasm-simd-threaded.wasm': ortWasmSIMDMT.replace('?raw', ''),
    'ort-wasm-simd.wasm': ortWasmSIMD.replace('?raw', ''),
    'ort-wasm-threaded.wasm': ortWasmMT.replace('?raw', ''),
    'ort-wasm.wasm': ortWasm.replace('?raw', ''),
    'opencv-normal.wasm': cvWasmNormal.replace('?raw', ''),
    'opencv-simd.wasm': cvWasmSimd.replace('?raw', ''),
} as Record<string, string>
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
