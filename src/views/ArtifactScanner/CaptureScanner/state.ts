import { watch } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import type { ICVMat } from '@/utils/cv'
import { tillChanged } from '@/utils/cv/measurement'
import { CocogoatWebControl } from '@/modules/webcontrol'
import { IMatFromImageData, toCanvas } from '@/utils/IMat'
import type { IArScannerData } from './../scanner/scanner'
import { getScannerInstance } from '../scanner/scanner.client'
import fastq from 'fastq'
import { setArtifactHash } from '@/views/Artifact/artifactUtil'
const tempCanvas = document.createElement('canvas')
const tempCtx = tempCanvas.getContext('2d')
export const useArstore = defineStore('artifact-capture-scanner', {
    state: () => {
        return {
            step: 1,
            video: null as HTMLVideoElement | null,
            stream: null as MediaStream | null,
            windowId: -1,
            control: new CocogoatWebControl(),
            scanner: null as ReturnType<typeof getScannerInstance> | null,
            panelRect: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            },
            centerRect: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            },
            countRect: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            },
            queue: null as fastq.queue | null,
            results: [] as IArScannerData[],
            resultHashes: [] as string[],
            scanned: 0,
            duplicates: 0,
        }
    },
    getters: {
        resF: (state) => state.results.filter((r) => !r.success),
        resT: (state) => state.results.filter((r) => r.success),
    },
    actions: {
        async requestCapture() {
            if (!this.video) return
            try {
                this.stream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false,
                })
                this.video.srcObject = this.stream
                this.video.play()
                this.step++
            } catch (err) {
                console.error(err)
                ElMessage.error({
                    message: (err as Error).toString(),
                })
            }
        },
        capture() {
            if (!this.video) throw new Error('No video')
            if (!tempCtx) throw new Error('No canvas context')
            let imageData = null as ImageData | null
            while (!imageData) {
                tempCtx.drawImage(this.video, 0, 0, tempCanvas.width, tempCanvas.height)
                imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
                if (!imageData) {
                    console.warn('->capture FAILD')
                }
            }
            return IMatFromImageData(imageData)
        },
        capturePanel() {
            if (!this.video) throw new Error('No video')
            if (!tempCtx) throw new Error('No canvas context')
            let imageData = null as ImageData | null
            while (!imageData) {
                // crop to panelRect
                tempCtx.drawImage(
                    this.video,
                    this.panelRect.x,
                    this.panelRect.y,
                    this.panelRect.width,
                    this.panelRect.height,
                    0,
                    0,
                    tempCanvas.width,
                    tempCanvas.height,
                )
                imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
                if (!imageData) {
                    console.warn('->capture FAILD')
                }
            }
            return IMatFromImageData(imageData)
        },
        async switchToNext() {
            if (!this.windowId) return
        },
        async waitForSwitch() {
            if (!this.scanner) throw new Error('No scanner')
            const res = await tillChanged(this.scanner.diffCached, this.capturePanel, {
                interval: 50,
                threhold: 80,
            })
            console.log('->changed', res.result)
            return res.image
        },
        async analyzeUI() {
            if (!this.video) throw new Error('No video')
            if (!this.scanner) throw new Error('No scanner')
            tempCanvas.width = this.video.videoWidth
            tempCanvas.height = this.video.videoHeight
            const image = this.capture()
            const bag = await this.scanner.workerCV.analyzeBag(image)
            this.panelRect = bag.panelRect
            this.centerRect = bag.centerRect
            this.countRect = bag.countRect
            tempCanvas.width = bag.panelRect.width
            tempCanvas.height = bag.panelRect.height
            await Promise.all([this.scanner.workerCV.setCachedBag(bag), this.scanner.workerOCR.setCachedBag(bag)])
            console.log('->analyzeUI', bag)
        },
        async scannerLoop() {
            if (!this.video) throw new Error('No video')
            if (!tempCtx) throw new Error('No canvas context')
            if (this.queue) {
                this.queue.killAndDrain()
            }
            this.queue = fastq.promise(store.worker, 1)
            await this.analyzeUI()
            let image = this.capturePanel()
            while (this.step === 4) {
                this.scanned++
                this.queue.push({ image, id: this.scanned })
                try {
                    image = await this.waitForSwitch()
                } catch (e) {}
            }
        },
        async worker({ image, id }: { image: ICVMat | null; id: number }) {
            if (!this.scanner) throw new Error('No scanner')
            if (!this.queue) throw new Error('No queue')
            if (!image) return
            let sid = 1
            let onimg = this.scanner.onScreenShot
            if (this.queue.concurrency === 2 && id % 2 === 0) {
                onimg = this.scanner.onScreenShot2
                sid = 2
            }
            const res = await onimg(image)
            const data = {
                ...res,
                image: toCanvas(image).toDataURL(),
            } as IArScannerData
            if (data.success && data.artifact) {
                const hash = setArtifactHash(data.artifact)
                // find duplicated
                if (this.resultHashes.includes(hash)) {
                    this.duplicates++
                    console.log(`->${sid}dup`, data.artifact)
                } else {
                    console.log(`->${sid}got`, data.artifact)
                    this.results.push(data)
                    this.resultHashes.push(hash)
                }
            } else {
                this.results.push(data)
                console.warn(`->${sid}fail`, data)
                new Image().src = toCanvas(image).toDataURL()
            }
        },
    },
})
const store = useArstore()
watch(
    () => store.step,
    async (step) => {
        if (step === 4) {
            store.scanner = getScannerInstance()
            store.scannerLoop()
            return
        }
        if (step === 5) {
            store.queue && (store.queue.concurrency = 2)
            console.log('->waiting for queue')
            await store.queue?.push({ image: null, id: -1 })
            console.log('->done')
            store.step = 6
            return
        }
        if (step === 6 && store.video) {
            // destroy media track
            store.stream && store.stream.getTracks().forEach((t) => t.stop())
            store.stream = null
            store.video.pause()
            store.video.srcObject = null
            return
        }
    },
)
watch(
    () => store.stream,
    (stream) => {
        stream &&
            stream.getVideoTracks()[0]?.addEventListener('ended', () => {
                store.stream = null
                if (!store.video) return
                store.video.pause()
                store.video.srcObject = null
                if (store.step > 3) {
                    store.step = 5
                    return
                }
                store.$reset()
            })
    },
)
