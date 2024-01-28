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
                        <span>拖动第三方工具导出的图片集到这里<br />或点击选择文件（支持多选）</span>
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
                    <DynamicScroller
                        :items="images"
                        :min-item-size="52"
                        :custom-scrollbar="CustomElScrollVue"
                        class="scroller"
                        key-field="id"
                    >
                        <template #before>
                            <el-empty v-if="images.length <= 0" description="请添加图片" />
                        </template>
                        <template v-slot="{ item: i, active }">
                            <DynamicScrollerItem :item="i" :active="active" :size-dependencies="[]">
                                <img :src="i.src" />
                            </DynamicScrollerItem>
                        </template>
                    </DynamicScroller>
                </div>
            </div>
            <div v-if="step === 2" class="step2">
                <el-progress
                    type="circle"
                    :percentage="progress"
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
import { ocrCompatible } from '@/utils/compatibility'
import { getScannerInstance } from '../scanner/scanner.worker'
import type { IAScannerData, IAScannerFaild } from '../scanner/scanner'

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import CustomElScrollVue from '@/components/ElCustomScroll.vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller/src/index'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faInbox } from '@fortawesome/free-solid-svg-icons'

import { vLoading } from 'element-plus/es/components/loading/src/directive'
import 'element-plus/theme-chalk/el-loading.css'
import fastq from 'fastq'
import { useRoute } from 'vue-router'
import { IMatFromImageElement } from '@/utils/IMat'
import FloatContent from '../CaptureScanner/FloatContent.vue'
import { send } from '../utils'

library.add(faInbox)

export default defineComponent({
    components: {
        FloatContent,
        DynamicScroller,
        DynamicScrollerItem,
    },
    directives: {
        elloading: vLoading,
    },
    setup() {
        const load = ref(false)
        const loading = ref(false)
        const step = ref(1)
        if (!ocrCompatible) {
            return {
                load,
                step: 0,
                recognized: {
                    success: 0,
                    fail: 0,
                },
                images: [],
            }
        }
        const fileInput = ref(null as HTMLInputElement | null)
        const images = ref<HTMLImageElement[]>([])
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
                const reader = new FileReader()
                reader.readAsDataURL(file)
                return new Promise((resolve) => {
                    reader.onload = () => {
                        const img = new Image()
                        img.src = reader.result as string
                        img.id = 'rcycle-img-' + index
                        img.onload = () => {
                            resolve(img)
                        }
                    }
                }) as Promise<HTMLImageElement>
            })
            ;(images as Ref<HTMLImageElement[]>).value = await Promise.all(imagePromises)
            loading.value = false
        }
        const results = ref([] as (IAScannerData | IAScannerFaild)[])
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
        const recoginzeWorker = async ({ image, thread }: { image: HTMLImageElement; thread: boolean }) => {
            let s = scannerOnLine
            if (thread) {
                s = scannerOnLine2
            }
            const imat = await IMatFromImageElement(image)
            const r = await s(imat)
            // 检查重复
            if (r.success) {
                const r2 = results.value.find((i) => {
                    if (!i.success) return false
                    const n = i as IAScannerData
                    return n.achievement.id === r.achievement.id
                })
                if (!r.done || route.query.withImage) {
                    r.images = {
                        main: image.src,
                    }
                }
                if (r2) {
                    dup.value++
                } else {
                    results.value.push(r)
                }
            } else {
                r.images = {
                    main: image.src,
                }
                results.value.push(r)
                new Image().src = r.images.main
            }
        }
        const ocrQueue = fastq.promise(recoginzeWorker, 2)
        async function startScan() {
            ocrQueue.killAndDrain()
            ocrQueue.pause()
            let last = Promise.resolve() as Promise<void>
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
                metadata: {
                    ua: navigator.userAgent,
                    scanner: 'LineScanner',
                },
            })
        }
        watch(step, (v) => {
            if (v === 2) {
                startScan()
            }
        })

        const { scannerOnLine, scannerOnLine2 } = getScannerInstance()
        return {
            step,
            load,
            loading,
            onFileDrop,
            onFileChange,
            dropzoneClick,
            fileInput,
            dragOver,
            CustomElScrollVue,
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
                width: 100%;
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
