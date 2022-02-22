import { Remote, wrap } from 'comlink'
import type { W } from './scanner.worker.expose'
import resources from '@/resources'
import { requireAsBlob, speedTest } from '@/resource-main'
import { Worker, installToWindow } from '@/utils/corsWorker'
import { hasSIMD } from '@/utils/compatibility'
import { i18n } from '@/i18n'
export function createWorker() {
    let _worker: Worker
    /// #if SINGLEFILE
    installToWindow()
    const Worker = require('./scanner.worker.expose.ts').default
    _worker = new Worker() as Worker
    console.log('Worker created using worker-loader')
    /// #else
    _worker = new Worker(new URL('./scanner.worker.expose.ts', import.meta.url)) as Worker
    console.log('Worker created using worker-plugin')
    /// #endif
    const worker = wrap(_worker) as Remote<typeof W>
    return { worker, _worker }
}
export function initScanner() {
    const { worker: workerCV, _worker: w1 } = createWorker()
    const { worker: workerOCR, _worker: w2 } = createWorker()
    const { scannerOnImage, recognizeAchievement: recognizeAchievement2 } = workerCV
    const { recognizeAchievement } = workerOCR
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let progressHandler = (progress: number) => {
        // do nothing
    }
    const onProgress = (handler: (progress: number) => unknown) => {
        progressHandler = handler
    }
    const workerErrorHandler = (e: ErrorEvent) => {
        progressHandler(-99)
        throw e
    }
    w1.addEventListener('error', workerErrorHandler)
    w2.addEventListener('error', workerErrorHandler)
    const initPromise = (async () => {
        try {
            const [race, all] = speedTest()
            const ortWasm = hasSIMD ? 'ort-wasm-simd.wasm' : 'ort-wasm.wasm'
            const ocvWasm = hasSIMD ? 'opencv-simd.wasm' : 'opencv-normal.wasm'
            await race
            await requireAsBlob([ortWasm, ocvWasm, 'ppocr.ort'], (e) => progressHandler(e), all)
            await Promise.all([
                workerCV.setResources(resources),
                workerOCR.setResources(resources),
                workerCV.initAchievementMap(i18n.value.achievements),
                workerOCR.initAchievementMap(i18n.value.achievements),
            ])
            progressHandler(100)
        } catch (e) {
            progressHandler(-1)
            throw e
        }
        w1.removeEventListener('error', workerErrorHandler)
        w2.removeEventListener('error', workerErrorHandler)
        await Promise.all([workerCV.init(), workerOCR.init()])
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
