<template>
    <section :class="$style.webCapturer">
        <c-intro v-if="step === 1" @request-capture="requestCapture" />
        <c-client v-else-if="step === 2" :control="control" @done="afterClient" />
        <video ref="video" style="display: none" />
        <float-window
            v-if="hasPictureInPicture && popup"
            :width="250"
            :height="100"
            :class="$style.floatwindow"
            @exit="$emit('exit')"
        >
            <slot />
        </float-window>
    </section>
</template>

<script lang="ts">
import { ref, watch, onBeforeUnmount, defineComponent } from 'vue'
import CIntro from './Intro.vue'
import CClient from './Client.vue'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import { IMatFromImageData } from '@/utils/IMat'
import FloatWindow from '@/components/FloatWindow2.vue'
import { CocogoatWebControl, IWindow } from '@/modules/webcontrol'
import { hasPictureInPicture } from '@/utils/compatibility'
import delay from 'delay'

export default defineComponent({
    components: {
        CIntro,
        CClient,
        FloatWindow,
    },
    props: {
        popup: {
            type: Boolean,
            required: true,
        },
    },
    emits: ['ready', 'exit'],
    setup(props, { emit }) {
        const step = ref(1)
        const video = ref(null as HTMLVideoElement | null)
        const stream = ref(null as MediaStream | null)
        const control = new CocogoatWebControl()
        const windowId = ref(0)
        const requestCapture = async () => {
            if (!video.value) return
            try {
                stream.value = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false,
                })
                video.value.srcObject = stream.value
                video.value.play()
                step.value++
            } catch (err) {
                console.error(err)
                ElMessage.error({
                    message: (err as Error).toString(),
                })
            }
        }
        const afterClient = (wid: number) => {
            windowId.value = wid
            step.value++
            emit('ready')
        }
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        const capture = ({ x = 0, y = 0, w = 0, h = 0 }) => {
            if (!video.value) throw new Error('No video')
            if (!tempCtx) throw new Error('No canvas context')
            const vi = video.value as HTMLVideoElement
            let imageData = null as ImageData | null
            if (w > 0 && h > 0) {
                if (tempCanvas.width !== w || tempCanvas.height !== h) {
                    tempCanvas.width = w
                    tempCanvas.height = h
                }
            } else {
                if (tempCanvas.width !== vi.videoWidth || tempCanvas.height !== vi.videoHeight) {
                    tempCanvas.width = vi.videoWidth
                    tempCanvas.height = vi.videoHeight
                }
            }
            while (!imageData) {
                if (w > 0 && h > 0) {
                    tempCtx.drawImage(vi, x, y, w, h, 0, 0, tempCanvas.width, tempCanvas.height)
                } else {
                    tempCtx.drawImage(vi, 0, 0, tempCanvas.width, tempCanvas.height)
                }
                imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
                if (!imageData) {
                    console.warn('->capture FAILD')
                }
            }
            return IMatFromImageData(imageData)
        }
        const stop = () => {
            stream.value && stream.value.getTracks().forEach((t) => t.stop())
            stream.value = null
            video.value && video.value.pause()
            video.value && (video.value.srcObject = null)
            onFrameStarted = false
        }
        const reset = () => {
            stop()
            step.value = 1
        }
        let cachedWindow = undefined as IWindow | undefined
        const click = async (x: number, y: number, cache = true) => {
            if (control && video.value) {
                const clickPos = await control.toAbsolute(windowId.value, x, y, {
                    dx: video.value.videoWidth,
                    dy: video.value.videoHeight,
                    window: cache ? cachedWindow || null : null,
                })
                await control.SetCursorPos(clickPos.x, clickPos.y)
                await delay(10)
                await control.mouse_event(control.MOUSEEVENTF_LEFTDOWN, 0, 0, 0)
                await control.mouse_event(control.MOUSEEVENTF_LEFTUP, 0, 0, 0)
                if (cache) {
                    cachedWindow = clickPos.win
                }
            }
        }
        const drag = async (
            fr: { x: number; y: number },
            to: { x: number; y: number },
            duration = 2000,
            step = 10,
            end = 500,
            // eslint-disable-next-line max-params
        ) => {
            if (control && video.value) {
                const absFr = await control.toAbsolute(windowId.value, fr.x, fr.y, {
                    dx: video.value.videoWidth,
                    dy: video.value.videoHeight,
                    window: null,
                })
                const absTo = await control.toAbsolute(windowId.value, to.x, to.y, {
                    dx: video.value.videoWidth,
                    dy: video.value.videoHeight,
                    window: absFr.win,
                })
                await control.SetCursorPos(absFr.x, absFr.y)
                await delay(10)
                await control.mouse_event(control.MOUSEEVENTF_LEFTDOWN, 0, 0, 0)
                for (let i = 0; i < step; i++) {
                    const x = absFr.x + ((absTo.x - absFr.x) * i) / step
                    const y = absFr.y + ((absTo.y - absFr.y) * i) / step
                    await control.SetCursorPos(x, y)
                    await delay(duration / step)
                }
                await control.SetCursorPos(absTo.x, absTo.y)
                await delay(end)
                await control.mouse_event(control.MOUSEEVENTF_LEFTUP, 0, 0, 0)
            }
        }
        const onFrameFun = {
            cb: () => {
                // do nothing
            },
        }
        let onFrameStarted = false
        const onFrame = (cb: () => unknown) => {
            onFrameFun.cb = cb
            if (video.value && !onFrameStarted) {
                const fun = () => {
                    onFrameFun.cb()
                    if (onFrameStarted) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        video.value.requestVideoFrameCallback(fun)
                    }
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                video.value.requestVideoFrameCallback(fun)
                onFrameStarted = true
            }
        }
        watch(stream, (stream) => {
            stream &&
                stream.getVideoTracks()[0]?.addEventListener('ended', () => {
                    stop()
                    emit('exit')
                })
        })
        onBeforeUnmount(() => {
            stop()
        })
        return {
            step,
            video,
            stream,
            control,
            windowId,
            requestCapture,
            afterClient,
            capture,
            stop,
            reset,
            hasPictureInPicture,
            click,
            drag,
            onFrame,
        }
    },
})
</script>

<style lang="scss" module>
.floatwindow {
    opacity: 0;
    position: absolute;
    top: -9999px;
    left: -9999px;
}
.web-capturer {
    text-align: center;
    :global {
        .start-btn {
            margin-top: 10px;
            height: 60px;
            text-align: left;
            font-size: 16px;
            transition: all 0.3s;
            width: 490px;
            max-width: 95%;
            box-sizing: border-box;
            &:hover {
                transform: translateY(-5px);
            }
            &.start-gray {
                --el-button-hover-text-color: #333;
                --el-button-hover-border-color: #aaa;
                --el-button-hover-bg-color: #fafafa;
            }
            & > span {
                display: flex;
                width: 100%;
                height: 100%;
                justify-content: flex-start;
            }

            .r {
                opacity: 0.8;
            }

            .m {
                flex-grow: 1;
            }

            .l svg {
                width: 40px;
                height: 24px;
                padding-right: 10px;
            }

            .d {
                font-size: 12px;
                margin-top: 3px;
                opacity: 0.8;
            }
        }
    }
}
</style>
