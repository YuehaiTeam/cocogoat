<template>
    <div>
        <video ref="video" style="width: 320px"></video>
        <div class="imgList">
            <img v-for="(img, i) in imgList" :key="i" :src="img" style="width: 320px" />
        </div>
        <button @click="requestCapture">start</button>
        <float-window
            v-if="state === S.Wait || state === S.Capture"
            :width="250"
            :height="100"
            class="floatwindow"
            @exit="state = S.Processing"
        >
            <float-content
                :capture="capture"
                :state="state === S.Capture ? 1 : 0"
                :success="recognized.success"
                :fail="recognized.fail"
                :scanned="scanned"
                :duplicate="dup"
            />
        </float-window>
        <div v-if="state === S.Capture || state === S.Processing" class="inline-status">
            <float-content
                :in-float="false"
                :capture="false"
                :state="1"
                :success="recognized.success"
                :fail="recognized.fail"
                :scanned="scanned"
                :duplicate="dup"
                @click="state === S.Capture && (state = S.Processing)"
            />
        </div>
        <button @click="state++">>></button>
        <div class="list">
            <div v-for="(i, a) in results" :key="a" class="item">
                <div v-if="!i.success">失败</div>
                <div v-else class="title">{{ i.achievement.name }} {{ i.date || '未完成' }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { IMatFromImageData, toCanvas } from '@/utils/IMat'
import getWorker from './scanner/scanner.worker'
const workerCV = getWorker()
const workerOCR = getWorker()
const { scannerOnImage, recognizeAchievement: recognizeAchievement2 } = workerCV
const { recognizeAchievement } = workerOCR
workerCV.init()
workerOCR.init()
enum S {
    Ready,
    Request,
    Wait,
    Capture,
    Processing,
    Finish,
    Fail,
}
import { computed, defineComponent, ref, watch } from 'vue-demi'
import FloatWindow from '@/components/FloatWindow.vue'
import FloatContent from './FloatContent.vue'
import delay from 'delay'
import FastQ from 'fastq'
import type { IAScannerData, IAScannerLine, IAScannerFaild } from './scanner/scanner'
export default defineComponent({
    name: 'AchievementScanner',
    components: {
        FloatWindow,
        FloatContent,
    },
    setup() {
        const capture = ref(false)
        const results = ref([] as (IAScannerData | IAScannerFaild)[])
        const scanned = ref(0)
        const dup = ref(0)
        const recognized = computed(() => {
            return {
                success: results.value.filter((r) => r.success).length,
                fail: results.value.filter((r) => !r.success).length,
            }
        })
        const recoginzeWorker = async ({ line, thread }: { line: IAScannerLine | null; thread: boolean }) => {
            if (line) {
                let p = recognizeAchievement
                if (thread && state.value === S.Processing) {
                    ocrQueue.concurrency = 2
                    p = recognizeAchievement2
                }
                const r = await p(line)
                // 检查重复
                if (r.success) {
                    const r2 = results.value.find((i) => {
                        if (!i.success) return false
                        const n = i as IAScannerData
                        return n.achievement.id === r.achievement.id
                    })
                    if (r2) {
                        dup.value++
                    } else {
                        results.value.push(r)
                    }
                } else {
                    new Image().src = toCanvas(line.image).toDataURL()
                    results.value.push(r)
                }
            }
            if (state.value !== S.Processing) {
                await delay(400)
            }
        }
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        const cvWorker = async ({ imageData, keepLastLine }: { imageData: ImageData; keepLastLine: boolean }) => {
            const lines = await scannerOnImage(IMatFromImageData(imageData), keepLastLine)
            for (const line of lines) {
                if (line.blocks.length > 2) {
                    // block太少的，认为是半行
                    ocrQueue.push({ line, thread: scanned.value % 2 === 0 })
                    scanned.value++
                }
            }
            if (keepLastLine) {
                ocrQueue.push({ line: null, thread: false })
            }
        }
        const ocrQueue = FastQ.promise(recoginzeWorker, 1)
        ocrQueue.drain = () => {
            if (state.value === S.Processing) {
                state.value = S.Finish
            }
        }
        const cvQueue = FastQ.promise(cvWorker, 1)
        const video = ref(null as unknown as HTMLVideoElement)
        const state = ref(S.Ready)
        const imgList = ref([] as string[])
        let captureStream: MediaStream | null = null
        const requestCapture = async () => {
            try {
                captureStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false,
                })
                video.value.srcObject = captureStream
                video.value.play()
                state.value = S.Wait
            } catch (err) {
                console.error('Error: ' + err)
                state.value = S.Fail
            }
        }
        const scannerLoop = async () => {
            tempCanvas.width = video.value.videoWidth
            tempCanvas.height = video.value.videoHeight
            while (state.value === S.Capture) {
                ;(async () => {
                    capture.value = true
                    await delay(100)
                    capture.value = false
                })()
                try {
                    tempCtx && tempCtx.drawImage(video.value, 0, 0, tempCanvas.width, tempCanvas.height)
                    const imageData = tempCtx && tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
                    if (imageData) {
                        await Promise.all([cvQueue.push({ imageData, keepLastLine: false }), delay(200)])
                    } else {
                        await delay(500)
                    }
                } catch (e) {}
            }
        }
        watch(
            () => state.value,
            async () => {
                if (state.value === S.Capture) {
                    console.log('capture')
                    scannerLoop()
                }
                if (state.value === S.Processing) {
                    tempCtx && tempCtx.drawImage(video.value, 0, 0, tempCanvas.width, tempCanvas.height)
                    const imageData = tempCtx && tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
                    if (imageData) {
                        cvQueue.push({ imageData, keepLastLine: true })
                    }
                    captureStream && captureStream.getTracks().forEach((track) => track.stop())
                    console.log('processing')
                    ocrQueue.resume()
                }
            },
        )
        return {
            S,
            state,
            video,
            imgList,
            requestCapture,
            results,
            scanned,
            recognized,
            capture,
            dup,
        }
    },
})
</script>

<style lang="scss" scoped>
.floatwindow {
    opacity: 0;
    position: absolute;
    top: -9999px;
    left: -9999px;
}
.inline-status {
    width: 250px;
    height: 100px;
    zoom: 1.5;
    position: relative;
    border: 1px solid #409eff;
    cursor: pointer;
    user-select: none;
}
</style>
