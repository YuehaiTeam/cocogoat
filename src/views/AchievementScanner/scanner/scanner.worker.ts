import { Remote, wrap } from 'comlink'
import type { W } from './scanner.worker.expose'
import resources, { requireAsBlob, speedTest } from '@/resources'
import { Worker } from '@/utils/corsWorker'
import { hasSimd } from '@/utils/WasmFeatureCheck'
export function createWorker() {
    const worker = new Worker(new URL('./scanner.worker.expose.ts', import.meta.url))
    return wrap(worker) as Remote<typeof W>
}
export function initScanner() {
    const workerCV = createWorker()
    const workerOCR = createWorker()
    const { scannerOnImage, recognizeAchievement: recognizeAchievement2 } = workerCV
    const { recognizeAchievement } = workerOCR
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let progressHandler = (progress: number) => {
        // do nothing
    }
    const onProgress = (handler: (progress: number) => unknown) => {
        progressHandler = handler
    }
    const initPromise = (async () => {
        try {
            await speedTest()
            const hasSimdResult = hasSimd()
            const ortWasm = hasSimdResult ? 'ort-wasm-simd.wasm' : 'ort-wasm.wasm'
            const ocvWasm = hasSimdResult ? 'opencv-simd.wasm' : 'opencv-normal.wasm'
            await requireAsBlob([ortWasm, ocvWasm, 'ppocr.ort'], (e) => progressHandler(e))
            await Promise.all([workerCV.setResources(resources), workerOCR.setResources(resources)])
            progressHandler(100)
        } catch (e) {
            progressHandler(-1)
            throw e
        }
        await workerCV.init()
        await workerOCR.init()
    })()
    return {
        recognizeAchievement,
        recognizeAchievement2,
        scannerOnImage,
        initPromise,
        workerCV,
        workerOCR,
        onProgress,
    }
}
