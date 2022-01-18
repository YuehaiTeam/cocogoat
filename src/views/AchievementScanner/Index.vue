<template>
    <main>
        <section v-if="state === S.Init">
            <div class="loader">
                <div class="loader-animation">
                    <span class="cssload-loader"><span class="cssload-loader-inner"></span></span>
                </div>
                <div class="loader-text">椰羊正在饮甘露，马上就来</div>
            </div>
        </section>
        <section v-else>
            <video ref="video" style="display: none"></video>
            <div v-if="state < S.Wait" class="start-page">
                <h1>椰羊·成就扫描</h1>
                <button class="start" @click="requestCapture">开始</button>
                <div class="desc">点击开始后，请按下图指示选择原神窗口以识别</div>
                <img src="@/assets/openscreenshare.png" alt="请参照图片开始抓屏" />
            </div>
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
            <div v-if="state > S.Wait" class="status-inner">
                <div class="inline-status">
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
                <div v-if="state === S.Capture" class="no-box">请按悬浮窗提示滚动页面</div>
                <div v-if="state > S.Capture" class="pbar">
                    <div class="pbar-bar" :class="{ finish: state === S.Finish }">
                        <div
                            class="pbar-bar-in"
                            :style="{ width: `${((recognized.success + recognized.fail + dup) / scanned) * 100}%` }"
                        ></div>
                        <div v-if="state === S.Finish" class="pbar-bar-text">完成</div>
                    </div>
                    <div v-if="state === S.Finish" class="restart" @click="reset">重新开始</div>
                </div>
            </div>
            <button v-if="state === S.Wait" @click="state = S.Capture">
                我已切换到成就页面（自动识别页面未完成）<br />如没看到悬浮窗请点击窗口空白处
            </button>
            <div v-if="isTop" class="list">
                <div v-for="(i, a) in results" :key="a" class="item">
                    <div v-if="!i.success">
                        <img :src="i.images.main" />
                    </div>
                    <div v-else class="title">{{ i.achievement.name }} {{ i.date || '未完成' }}</div>
                </div>
                <textarea
                    v-if="state === S.Finish && $route.query.exportToPaiminMoe"
                    :value="exportToPaiminMoe"
                    rows="6"
                    cols="50"
                ></textarea>
            </div>
        </section>
    </main>
</template>

<script lang="ts">
import { IMatFromImageData, toCanvas } from '@/utils/IMat'
import { initScanner } from './scanner/scanner.worker'
const { recognizeAchievement, recognizeAchievement2, scannerOnImage, initPromise, workerCV, workerOCR } = initScanner()
enum S {
    Fail = -1,
    Init = 0,
    Ready = 1,
    Request = 2,
    Wait = 3,
    Capture = 4,
    Processing = 5,
    Finish = 6,
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
        const isTop = window === parent
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
                    r.images = {
                        main: toCanvas(line.image).toDataURL(),
                    }
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
        const state = ref(S.Init)
        initPromise.then(() => {
            state.value = S.Ready
        })
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
                if (state.value === S.Finish) {
                    console.log('finish')
                    parent &&
                        !isTop &&
                        parent.postMessage(
                            {
                                event: 'cocogoat-scanner-achievements',
                                data: JSON.stringify({
                                    results: results.value,
                                    dup: dup.value,
                                }),
                            },
                            '*',
                        )
                }
            },
        )
        const reset = async () => {
            await Promise.all([workerCV.reset(), workerOCR.reset()])
            results.value = []
            scanned.value = 0
            dup.value = 0
            state.value = S.Ready
        }
        const exportToPaiminMoe = computed(() => {
            const exportArray = results.value
                .filter((e) => e.success)
                .map((e) => {
                    const a = (e as IAScannerData).achievement
                    return [a.categoryId, a.id]
                })
            return `/* 
* 复制此处所有内容，
* 在Paimon.moe页面按F12打开调试器，
* 选择控制台(Console)
* 粘贴并回车执行完成导入
*/
const b = ${JSON.stringify(exportArray)};
const a = (await localforage.getItem('achievement')) || [];
b.forEach(c=>{a[c[0]]=a[c[0]]||{};a[c[0]][c[1]]=true})
await localforage.setItem('achievement',a);
location.href='/achievement'`
        })
        return {
            S,
            state,
            video,
            requestCapture,
            results,
            scanned,
            recognized,
            capture,
            dup,
            isTop,
            reset,
            exportToPaiminMoe,
        }
    },
})
</script>

<style lang="scss" scoped>
.loader {
    width: 200px;
    padding-top: 40vh;
    color: #666;
    text-align: center;
    font-size: 14px;
    margin: 0 auto;
}

.loader-text {
    padding-top: 15px;
}
section {
    width: 100%;
}
.floatwindow {
    opacity: 0;
    position: absolute;
    top: -9999px;
    left: -9999px;
}
.status-inner {
    width: 100%;
    text-align: center;
    padding-bottom: 15px;
    position: absolute;
    top: 35vh;
    left: 0;
    right: 0;
    .no-box {
        color: #409eff;
        margin-top: -23px;
        position: relative;
        z-index: 2;
        cursor: pointer;
        small {
            font-size: 13px;
            text-decoration: underline;
        }
    }
}

.inline-status {
    width: 180px;
    height: 70px;
    zoom: 1.5;
    position: relative;
    user-select: none;
    margin: 0 auto;
    &::v-deep(.icon) {
        display: none;
    }
    &::v-deep(.text) {
        left: 0;
        .desc {
            display: none;
        }
    }
}

.cssload-loader {
    display: block;
    margin: 0 auto;
    width: 30px;
    height: 30px;
    position: relative;
    border: 3px solid #333;
    animation: cssload-loader 2.3s infinite ease;
}

.cssload-loader-inner {
    vertical-align: top;
    display: inline-block;
    width: 100%;
    background-color: #333;
    animation: cssload-loader-inner 2.3s infinite ease-in;
}

@keyframes cssload-loader {
    0% {
        transform: rotate(0deg);
    }

    25% {
        transform: rotate(180deg);
    }

    50% {
        transform: rotate(180deg);
    }

    75% {
        transform: rotate(360deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@keyframes cssload-loader-inner {
    0% {
        height: 0%;
    }

    25% {
        height: 0%;
    }

    50% {
        height: 100%;
    }

    75% {
        height: 100%;
    }

    100% {
        height: 0%;
    }
}
.pbar {
    width: 230px;
    margin: 0 auto;
    margin-top: -15px;
    z-index: 2;
    position: relative;
    .pbar-bar {
        width: 230px;
        height: 30px;
        border: 1px solid #409eff;
        border-radius: 20px;
        position: relative;
        &.finish {
            cursor: pointer;
            transition: all 0.3s;
            &:hover {
                opacity: 0.8;
            }
        }
    }

    .pbar-bar-in {
        height: 100%;
        background: #409eff;
        border-radius: 20px;
        transition: all 0.1s;
    }
    .pbar-bar-text {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        color: #fff;
        line-height: 30px;
        font-size: 14px;
    }
}
.list {
    font-size: 12px;
    height: calc(100vh - 50px);
    overflow: overlay;
    overflow-x: hidden;
    img {
        max-width: 100%;
    }
}
.start-page {
    position: absolute;
    top: 10vh;
    right: 0;
    left: 0;
    h1 {
        text-align: center;
        font-weight: normal;
    }
    img {
        display: block;
        margin: 0 auto;
        margin-top: 30px;
        width: 490px;
        max-width: 100%;
    }
    button.start {
        width: 200px;
        height: 55px;
        background: #333;
        border-radius: 55px;
        border: 0;
        color: #fff;
        display: block;
        margin: 0 auto;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.2s;
        &:hover {
            opacity: 0.7;
        }
    }
    .desc {
        text-align: center;
        margin-top: 20px;
    }
}
.restart {
    color: #888;
    font-size: 13px;
    margin-top: 10px;
    cursor: pointer;
    &:hover {
        color: #666;
    }
}
</style>
