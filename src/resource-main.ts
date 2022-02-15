import ortWasm from 'onnxruntime-web/dist/ort-wasm.wasm?rawnolocal'
import ortWasmMT from 'onnxruntime-web/dist/ort-wasm-threaded.wasm?rawnolocal'
import ortWasmSIMD from 'onnxruntime-web/dist/ort-wasm-simd.wasm?raw'
import ortWasmSIMDMT from 'onnxruntime-web/dist/ort-wasm-simd-threaded.wasm?rawnolocal'

import cvWasmNormal from '@/plugins/opencv/opencv-normal.wasm?rawnolocal'
import cvWasmSimd from '@/plugins/opencv/opencv-simd.wasm?raw'

import ocrModel from '@/plugins/ocr/ppocr.ort?raw'

function absoluteify(url: string) {
    if (url.startsWith('data:') || url.startsWith('blob:')) return url
    return new URL(url, location.href).href.replace('?raw', '').replace('?rawnolocal', '')
}

export const defaultResources = {
    'ort-wasm-simd-threaded.wasm': absoluteify(ortWasmSIMDMT),
    'ort-wasm-simd.wasm': absoluteify(ortWasmSIMD),
    'ort-wasm-threaded.wasm': absoluteify(ortWasmMT),
    'ort-wasm.wasm': absoluteify(ortWasm),
    'opencv-normal.wasm': absoluteify(cvWasmNormal),
    'opencv-simd.wasm': absoluteify(cvWasmSimd),
    'ppocr.ort': absoluteify(ocrModel),
} as Record<string, string>
