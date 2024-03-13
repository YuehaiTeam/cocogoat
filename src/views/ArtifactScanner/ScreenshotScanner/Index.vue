<template>
    <div>
        <div :class="$style.listContainer">
            <div v-if="step === 1" class="step1">
                <div class="top" :style="images.length > 0 ? {} : { padding: 0 }">
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
                        <span>点击选择圣遗物截图（支持多选）<br />或拖动图片到这里</span>
                        <input
                            ref="fileInput"
                            multiple
                            class="file-input"
                            type="file"
                            accept="image/*"
                            @change="onFileChange"
                        />
                    </div>
                    <button v-if="images.length > 0" @click="step++">识别</button>
                </div>
                <div v-elloading="loading" class="list">
                    <el-scrollbar>
                        <el-empty v-if="images.length <= 0">
                            <template #description>
                                <p>
                                    支持完整背包圣遗物页面截图和圣遗物面板截图
                                    <br />
                                    上传背包截图时请确保所有图片分辨率一致
                                    <br />
                                    如无法多选请更换浏览器
                                </p>
                            </template>
                        </el-empty>
                        <div class="image-content">
                            <img v-for="i in images" :key="i.id" :src="i.src" />
                        </div>
                    </el-scrollbar>
                </div>
            </div>
            <div v-if="step === 2" class="step2">
                <el-progress
                    type="circle"
                    :percentage="progress || 0"
                    :format="(percent: number) => percent.toFixed(2) + '%'"
                />
                <div class="inline-status">
                    <float-content
                        :in-float="false"
                        :capture="false"
                        :state="1"
                        :success="recognized.success"
                        :fail="recognized.fail"
                        :scanned="images.length"
                        :duplicate="dup"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, watch, defineComponent, computed, Ref } from 'vue'
import { getScannerInstance } from '../scanner/scanner.client'
import type { IArScannerData } from '../scanner/scanner'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faInbox } from '@fortawesome/free-solid-svg-icons'

import { vLoading } from 'element-plus/es/components/loading/src/directive'
import 'element-plus/theme-chalk/el-loading.css'
import fastq from 'fastq'
import { useRoute } from 'vue-router'
import { IMatFromImageElement, toCanvas } from '@/utils/IMat'
import FloatContent from '../../AchievementScanner/CaptureScanner/FloatContent.vue'
import { send } from '../utils'
import { setArtifactHash } from '@/views/Artifact/artifactUtil'

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
        const { onScreenShot, onScreenShot2 } = getScannerInstance()
        const fileInput = ref(null as HTMLInputElement | null)
        const images = ref([] as HTMLImageElement[])
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
            // make files as <img> objects in base64
            images.value = []
            loading.value = true
            const imagePromises = Array.from(files).map((file, index) => {
                return new Promise((resolve) => {
                    const img = new Image()
                    img.src = URL.createObjectURL(file)
                    img.id = 'rcycle-img-' + index
                    img.onload = () => {
                        resolve(img)
                    }
                }) as Promise<HTMLImageElement>
            })
            ;(images as Ref<HTMLImageElement[]>).value = await Promise.all(imagePromises)
            loading.value = false
        }
        const results = ref([] as IArScannerData[])
        const resultHashes = [] as string[]
        const dup = ref(0)
        const recognized = computed(() => {
            return {
                success: results.value.filter((r) => r.success).length,
                fail: results.value.filter((r) => !r.success).length,
            }
        })
        const progress = computed(() => {
            return ((recognized.value.success + recognized.value.fail + dup.value) / images.value.length) * 100
        })
        watch([images, recognized, dup], () => {
            send('progress', {
                scanned: images.value.length,
                ...recognized.value,
                dup: dup.value,
            })
        })
        const route = useRoute()
        const recoginzeWorker = async ({ image: imgel, thread }: { image: HTMLImageElement; thread: boolean }) => {
            if (!imgel) return
            const image = IMatFromImageElement(imgel)
            let s = onScreenShot
            if (thread) {
                s = onScreenShot2
            }
            const r = await s(image)
            if (r.success && r.artifact) {
                // find duplicated
                const hash = setArtifactHash(r.artifact)
                if (resultHashes.includes(hash)) {
                    dup.value++
                    return
                } else {
                    resultHashes.push(hash)
                }
            }
            let rimage = ''
            if (!r.success || route.query.withImage) {
                rimage = toCanvas(r.image).toDataURL()
                new Image().src = rimage
            }
            results.value.push({
                ...r,
                image: rimage,
            })
        }
        const ocrQueue = fastq.promise(recoginzeWorker, 2)
        async function startScan() {
            ocrQueue.killAndDrain()
            ocrQueue.pause()
            let last = Promise.resolve() as Promise<void>
            send('state', 'processing')
            images.value.forEach((element, index) => {
                last = ocrQueue.push({
                    image: element as HTMLImageElement,
                    thread: index % 2 === 0,
                })
            })
            ocrQueue.resume()
            await last
            send('state', 'finish')
            send('result', {
                result: results.value,
                dup: dup.value,
            })
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
            images,
            progress,
            recognized,
            results,
            dup,
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
            height: 450px;
            margin-top: 30px;
            border: 1px solid #ddd;
            border-radius: 5px;
            img {
                width: 33.33%;
                box-sizing: border-box;
                padding: 1%;
            }
        }
        .step2 {
            text-align: center;
            padding-top: 6vh;
            zoom: 1.25;
        }
        .inline-status {
            .desc {
                display: none;
            }
        }
    }
}
</style>
