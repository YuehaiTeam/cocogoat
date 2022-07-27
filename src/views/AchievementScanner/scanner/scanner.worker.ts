import { Remote, wrap } from 'comlink'
import type { W } from './scanner.worker.expose'
import resources from '@/resources'
import { requireAsBlob, speedTest } from '@/resource-main'
import { WorkerMacro } from '@/utils/corsWorker'
import { hasSIMD } from '@/utils/compatibility'
import achevementsAmos from '@/plugins/amos/achievements/index'
import { i18n } from '@/i18n'
import { localOptions } from '@/store'
import { cloneDeep } from 'lodash-es'
export function createWorker() {
    const _worker = WorkerMacro(/* @worker './scanner.worker.expose.ts' */)
    const worker = wrap(_worker) as Remote<typeof W>
    return { worker, _worker }
}
export function initScanner() {
    const { worker: workerCV, _worker: w1 } = createWorker()
    const { worker: workerOCR, _worker: w2 } = createWorker()
    const { scannerOnImage, scannerOnLine: scannerOnLine2, recognizeAchievement: recognizeAchievement2 } = workerCV
    const { recognizeAchievement, scannerOnLine } = workerOCR
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
            const i18nAmos = cloneDeep(i18n.amos)
            await Promise.all([
                workerCV.setResources(resources),
                workerOCR.setResources(resources),
                workerCV.initAchievementMap(achevementsAmos, i18nAmos),
                workerOCR.initAchievementMap(achevementsAmos, i18nAmos),
            ])
            progressHandler(100)
        } catch (e) {
            progressHandler(-1)
            throw e
        }
        w1.removeEventListener('error', workerErrorHandler)
        w2.removeEventListener('error', workerErrorHandler)
        await Promise.all([workerCV.init(localOptions.value.onnxWebgl), workerOCR.init(localOptions.value.onnxWebgl)])
    })()
    return {
        recognizeAchievement,
        recognizeAchievement2,
        scannerOnLine,
        scannerOnLine2,
        scannerOnImage,
        initPromise,
        workerCV,
        workerOCR,
        onProgress,
    }
}
let scannerInstance: ReturnType<typeof initScanner>
export function getScannerInstance() {
    if (!scannerInstance) {
        scannerInstance = initScanner()
    }
    return scannerInstance
}
