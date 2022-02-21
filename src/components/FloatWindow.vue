<template>
    <div>
        <div ref="content" :class="$style.floatContent" :style="{ width: `${width}px`, height: `${height}px` }">
            <slot />
        </div>
        <canvas
            ref="canvas"
            :width="width * 2"
            :height="height * 2"
            :class="$style.floatCanvas"
            :style="{ width: `${width}px`, height: `${height}px` }"
        ></canvas>
        <video
            ref="video"
            autoplay
            :class="$style.floatVideo"
            :style="{ width: `${width}px`, height: `${height}px` }"
            @leavepictureinpicture="$emit('exit')"
        ></video>
    </div>
</template>

<script lang="ts">
import html2canvas from 'html2canvas'
import { defineComponent, ref, watch, onBeforeUnmount, nextTick, provide } from 'vue-demi'
export default defineComponent({
    props: {
        width: Number,
        height: Number,
    },
    emits: ['exit'],
    setup(props) {
        let hasStream = false
        const video = ref(null as unknown as HTMLVideoElement)
        const canvas = ref(null as unknown as HTMLCanvasElement)
        const content = ref(null as unknown as HTMLVideoElement)
        let canvasStream: MediaStream
        const refreshCanvas = async () => {
            await nextTick()
            if (canvas.value) {
                const cres = await html2canvas(content.value, {
                    useCORS: true,
                    width: props.width,
                    height: props.height,
                    scale: Math.max(window.devicePixelRatio, 3),
                })
                if (canvas.value) {
                    const ctx = canvas.value.getContext('2d')
                    ctx && ctx.drawImage(cres, 0, 0, cres.width, cres.height, 0, 0, 500, 200)
                }
            }
        }
        provide('refresh', refreshCanvas)
        watch(
            () => content.value,
            async (v) => {
                if (v && !hasStream) {
                    canvasStream = canvas.value.captureStream()
                    video.value.srcObject = canvasStream
                    await refreshCanvas()
                    hasStream = true
                    try {
                        await video.value.play()
                        await video.value.requestPictureInPicture()
                    } catch (e) {
                        document.addEventListener(
                            'mousedown',
                            async () => {
                                await video.value.play()
                                await video.value.requestPictureInPicture()
                            },
                            {
                                once: true,
                            },
                        )
                    }
                }
            },
        )
        onBeforeUnmount(() => {
            if (video.value) {
                video.value.srcObject = null
            }
            if (canvasStream) {
                canvasStream.getTracks().forEach((track) => track.stop())
            }
            try {
                if (document.pictureInPictureElement === video.value) {
                    document.exitPictureInPicture()
                }
            } catch (e) {}
        })
        return {
            video,
            canvas,
            content,
            refresh: refreshCanvas,
        }
    },
})
</script>

<style lang="scss" module>
.float-content,
.float-canvas,
.float-video {
    overflow: hidden;
    display: inline-block;
    position: relative;
}
</style>
