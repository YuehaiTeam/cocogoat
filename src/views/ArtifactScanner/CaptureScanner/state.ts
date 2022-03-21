import { watch } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import { CocogoatWebControl } from '@/modules/webcontrol'
export const useArstore = defineStore('artifact-capture-scanner', {
    state: () => {
        return {
            step: 1,
            video: null as HTMLVideoElement | null,
            stream: null as MediaStream | null,
            windowId: -1,
            control: new CocogoatWebControl(),
        }
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
    },
})
const store = useArstore()
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
