import { Remote, wrap } from 'comlink'
import type { W } from './scanner.worker.expose'
import resources, { speedTest } from '@/resources'
import { Worker } from '@/utils/corsWorker'
export function createWorker() {
    const worker = new Worker(new URL('./scanner.worker.expose.ts', import.meta.url))
    return wrap(worker) as Remote<typeof W>
}
export function initScanner() {
    const workerCV = createWorker()
    const workerOCR = createWorker()
    const { scannerOnImage, recognizeAchievement: recognizeAchievement2 } = workerCV
    const { recognizeAchievement } = workerOCR
    const initPromise = (async () => {
        await speedTest()
        await Promise.all([workerCV.setResources(resources), workerOCR.setResources(resources)])
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
    }
}
