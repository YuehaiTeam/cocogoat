<template>
    <div>
        <div :class="$style.floatContent">
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
import { defineComponent, ref, onBeforeUnmount, provide, onMounted } from 'vue-demi'
export default defineComponent({
    props: {
        width: Number,
        height: Number,
    },
    emits: ['exit'],
    setup() {
        let hasStream = false
        const video = ref(null as unknown as HTMLVideoElement)
        const canvas = ref(null as unknown as HTMLCanvasElement)
        let canvasStream: MediaStream
        provide('canvas', canvas)
        const init = async () => {
            if (!hasStream) {
                canvasStream = canvas.value.captureStream()
                video.value.srcObject = canvasStream
                hasStream = true
            }
            if (document.pictureInPictureElement === null) {
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
        }
        onMounted(init)
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
            init,
            video,
            canvas,
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
