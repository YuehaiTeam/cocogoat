<template>
    <div>
        <div :class="$style.listContainer">
            <el-alert
                type="warning"
                title="录屏识别为未经完全验证的测试功能"
                description="识别错误率可能较高，请仔细核对确认或等待完善"
                show-icon
                center
                :closable="false"
            ></el-alert>
            <div class="step1">
                <div v-if="step === 1" class="top" :style="blob ? {} : { padding: 0 }">
                    <div
                        class="dropzone"
                        :class="{ 'drag-over': dragOver }"
                        @dragover.prevent.stop="dragOver = true"
                        @dragleave="dragOver = false"
                        @drop.prevent.stop="onFileDrop"
                        @click="dropzoneClick"
                    >
                        <i>
                            <fa-icon icon="inbox" />
                        </i>
                        <span>点击选择成就翻页录屏<br />或拖动视频文件到这里</span>
                        <input ref="fileInput" class="file-input" type="file" accept="video/*" @change="onFileChange" />
                    </div>
                    <button v-if="blob" @click="step++">识别</button>
                </div>
                <div v-if="step === 2" class="top inline-status">
                    <float-content
                        :in-float="false"
                        :capture="false"
                        :state="1"
                        :success="recognized.success"
                        :fail="recognized.fail"
                        :scanned="scanned"
                        :duplicate="dup"
                    />
                </div>
                <div v-elloading="loading" class="list">
                    <el-empty v-if="!blob">
                        <template #description>
                            <p>
                                请开启录屏并匀速从上向下翻动成就列表
                                <br />
                                如翻页速度过快可能会导致漏识别
                            </p>
                        </template>
                    </el-empty>
                    <div v-show="blob" class="image-content">
                        <video
                            ref="videoEl"
                            preload="preload"
                            playsinline
                            muted
                            webkit-playsinline
                            @timeupdate="onVideoProgress"
                        ></video>
                    </div>
                    <div v-show="splitEnded" class="overlay">
                        <div>
                            <el-progress
                                type="circle"
                                :percentage="progress || 0"
                                :format="(percent: number) => percent.toFixed(2) + '%'"
                            />
                        </div>
                    </div>
                    <div v-show="blob && !splitEnded" class="videoprogress">
                        <div class="videoprogress-in" :style="{ width: videoProgress + '%' }"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, watch, defineComponent, computed } from 'vue'
import { ocrCompatible } from '@/utils/compatibility'
import { getScannerInstance } from '../scanner/scanner.worker'
import type { IAScannerData, IAScannerFaild } from '../scanner/scanner'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faInbox } from '@fortawesome/free-solid-svg-icons'

import { vLoading } from 'element-plus/es/components/loading/src/directive'
import 'element-plus/theme-chalk/el-loading.css'
import fastq from 'fastq'
import { useRoute } from 'vue-router'
import { IMatFromCanvasElement, toCanvas } from '@/utils/IMat'
import FloatContent from '../CaptureScanner/FloatContent.vue'
import { send } from '../utils'
import type { ICVMat } from '@/utils/cv'

library.add(faInbox)

export default defineComponent({
    components: {
        FloatContent,
    },
    directives: {
        elloading: vLoading,
    },
    setup() {
        const load = ref(false)
        const loading = ref(false)
        const step = ref(1)
        const results = ref([] as (IAScannerData | IAScannerFaild)[])
        const dup = ref(0)
        const scanned = ref(0)
        const splitEnded = ref(false)
        const videoEl = ref<HTMLVideoElement | null>(null)
        const videoProgress = ref(0)
        const recognized = computed(() => {
            return {
                success: results.value.filter((r) => r.success).length,
                fail: results.value.filter((r) => !r.success).length,
            }
        })
        const onVideoProgress = (e: Event) => {
            const el = e.target as HTMLVideoElement
            if (el.currentTime > 0) {
                videoProgress.value = (el.currentTime / el.duration) * 100
            }
        }
        if (!ocrCompatible) {
            return {
                load,
                step,
                recognized,
                scanned,
                dup,
                videoEl,
                splitEnded,
                videoProgress,
                onVideoProgress,
            }
        }
        const { scannerOnLine, scannerOnLine2, scannerOnImage } = getScannerInstance()
        const fileInput = ref(null as HTMLInputElement | null)
        const blob = ref(null as Blob | null)
        const dragOver = ref(false)
        const dropzoneClick = () => {
            if (fileInput.value) {
                fileInput.value.click()
            }
        }
        const onFileDrop = (e: DragEvent) => {
            if (!e.dataTransfer) return
            dragOver.value = false
            const files = e.dataTransfer.files
            onFiles(files)
        }
        const onFileChange = (e: Event) => {
            const files = (e.target as HTMLInputElement).files
            if (!files) return
            onFiles(files)
        }
        const onFiles = async (files: FileList) => {
            loading.value = true
            if (videoEl.value && videoEl.value.src) {
                URL.revokeObjectURL(videoEl.value.src)
            }
            if (videoEl.value) {
                blob.value = files[0]
                videoEl.value.src = URL.createObjectURL(blob.value)
            }
            loading.value = false
        }
        const progress = computed(() => {
            return ((recognized.value.success + recognized.value.fail + dup.value) / scanned.value) * 100
        })
        watch([recognized, dup], () => {
            send('progress', {
                scanned,
                ...recognized.value,
                dup: dup.value,
            })
        })
        const route = useRoute()
        const recoginzeWorker = async ({ image, thread }: { image: ICVMat | null; thread: boolean }) => {
            if (!image) return
            let s = scannerOnLine
            if (thread && splitEnded.value) {
                s = scannerOnLine2
            }
            const r = await s(image)
            // 检查重复
            if (r.success) {
                const r2 = results.value.find((i) => {
                    if (!i.success) return false
                    const n = i as IAScannerData
                    return n.achievement.id === r.achievement.id
                })
                if (!r.done || route.query.withImage) {
                    r.images = {
                        main: toCanvas(image).toDataURL('image/webp'),
                    }
                }
                if (r2) {
                    dup.value++
                } else {
                    results.value.push(r)
                }
            } else {
                r.images = {
                    main: toCanvas(image).toDataURL('image/webp'),
                }
                results.value.push(r)
                new Image().src = r.images.main
            }
        }
        const ocrQueue = fastq.promise(recoginzeWorker, 2)
        let lastimat = null as null | ReturnType<typeof IMatFromCanvasElement>
        const splitWorker = async (imat: null | ReturnType<typeof IMatFromCanvasElement>) => {
            try {
                if (!imat) {
                    if (lastimat) {
                        const lines = await scannerOnImage(lastimat, false, true)
                        const totalHeight = lines.reduce((a, b) => a + b.image.rows, 0)
                        for (const line of lines) {
                            if (line.image.rows > ((totalHeight / lines.length) * 2) / 3) {
                                // block太少的，认为是半行
                                ocrQueue.push({ image: line.image, thread: scanned.value % 2 === 0 })
                                scanned.value++
                            }
                        }
                    }
                    return
                }
                lastimat = imat
                const lines = await scannerOnImage(imat, false, false)
                const totalHeight = lines.reduce((a, b) => a + b.image.rows, 0)
                for (const line of lines) {
                    if (line.image.rows > ((totalHeight / lines.length) * 2) / 3) {
                        // block太少的，认为是半行
                        ocrQueue.push({ image: line.image, thread: scanned.value % 2 === 0 })
                        scanned.value++
                    }
                }
            } catch (e) {
                console.error(e)
            }
        }
        const cvQueue = fastq.promise(splitWorker, 1)
        const tmpCanvas = document.createElement('canvas')
        const tmpCtx = tmpCanvas.getContext('2d')
        function startScan() {
            if (!videoEl.value) return
            console.log('startScan')
            ocrQueue.killAndDrain()
            tmpCanvas.width = videoEl.value.videoWidth
            tmpCanvas.height = videoEl.value.videoHeight
            let fri = 0
            const onFrame = () => {
                fri++
                if (fri % 2 === 0) return
                if (!videoEl.value) return
                if (!tmpCtx) return
                if (splitEnded.value) return
                const vi = videoEl.value as HTMLVideoElement
                tmpCtx.drawImage(vi, 0, 0, vi.videoWidth, vi.videoHeight)
                const imat = IMatFromCanvasElement(tmpCanvas)
                cvQueue.push(imat)
            }
            const frameCallback = () => {
                onFrame()
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                videoEl.value.requestVideoFrameCallback(frameCallback)
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            videoEl.value.requestVideoFrameCallback(frameCallback)
            videoEl.value.addEventListener(
                'ended',
                async () => {
                    await cvQueue.push(null)
                    splitEnded.value = true
                    console.log('processing')
                    send('state', 'processing')
                    await ocrQueue.push({
                        image: null,
                        thread: false,
                    })
                    send('state', 'finish')
                    send('result', {
                        result: results.value,
                        dup: dup.value,
                        metadata: {
                            scanner: 'RvfcScanner',
                            capturer: 'VideoCapturer',
                            ua: navigator.userAgent,
                            w: videoEl.value?.videoWidth,
                            h: videoEl.value?.videoHeight,
                        },
                    })
                },
                {
                    once: true,
                },
            )
            videoEl.value.play()
        }
        watch(step, (v) => {
            if (v === 2) {
                startScan()
            }
        })

        return {
            step,
            load,
            loading,
            onFileDrop,
            onFileChange,
            dropzoneClick,
            fileInput,
            dragOver,
            progress,
            recognized,
            results,
            dup,
            scanned,
            blob,
            videoEl,
            splitEnded,
            videoProgress,
            onVideoProgress,
        }
    },
})
</script>

<style lang="scss" module>
.list-container {
    padding-top: 11vh;
    width: 520px;
    max-width: 100%;
    margin: 0 auto;
    :global {
        .top {
            position: relative;
            padding-right: 90px;
            height: 70px;
            &.inline-status {
                .desc {
                    display: none;
                }
                zoom: 1.25;
                text-align: center;
                margin-bottom: -14px;
                padding: 0;
            }
            .dropzone {
                height: 64px;
                border: 1px solid #ddd;
                border-radius: 5px;
                box-sizing: border-box;
                color: #555;
                display: flex;
                justify-content: space-evenly;
                align-items: center;
                align-content: center;
                font-size: 15px;
                cursor: pointer;
                user-select: none;
                transition: all 0.2s;
                text-align: center;
                &.drag-over,
                &:hover {
                    opacity: 0.5;
                }
                .file-input {
                    display: none;
                }

                i {
                    font-size: 30px;
                    height: 64px;
                    padding-top: 12px;
                    box-sizing: border-box;
                }
            }

            button {
                position: absolute;
                right: 0;
                top: 0;
                height: 64px;
                width: 80px;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 15px;
                cursor: pointer;
                color: #555;
                transition: all 0.2s;
                &:hover {
                    color: #fff;
                    background: #555;
                }
            }
        }
        .list {
            height: 380px;
            margin-top: 30px;
            border: 1px solid #ddd;
            border-radius: 5px;
            position: relative;
            .videoprogress {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 7px;
                background: #eee;
                border-radius: 5px;
                .videoprogress-in {
                    background: var(--c-theme);
                    height: 100%;
                    border-radius: 5px;
                    transition: all 0.25s linear;
                }
            }

            .overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .image-content {
                height: 100%;
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 10px;
                video {
                    border-radius: 5px;
                    width: 100%;
                    box-sizing: border-box;
                }
            }
        }
    }
}
</style>
