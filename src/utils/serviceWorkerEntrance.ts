import { template } from '@/assets/mihoyoImages/characterIcon'
import characterAmos from '@/plugins/amos/characters'
import { ServiceWorker } from '@/utils/serviceWorker'
import ProgressNotf from '@/components/ProgressNotf.vue'
import { h, VNode, ComponentInternalInstance } from 'vue'
import { ElNotification, NotificationHandle } from 'element-plus'
import 'element-plus/theme-chalk/el-notification.css'
import { hasSIMD } from './compatibility'
const ortWasm = hasSIMD ? 'ort-wasm-simd.wasm' : 'ort-wasm.wasm'
const ocvWasm = hasSIMD ? 'opencv-simd.wasm' : 'opencv-normal.wasm'
const resourcesArr = [ortWasm, ocvWasm, 'ppocr.ort', 'yas.ort']
export const sw = new ServiceWorker(
    new URL(/* webpackChunkName: "sw" */ /* webpackEntryOptions: { filename: "sw.js" } */ '@/sw.ts', import.meta.url),
    {
        fallback: '/sw.js',
        manifest: window.$cocogoat.manifest || '',
        additionalCachedUrls: [
            ...characterAmos.map((c) => template.replace('#', c.key)),
            ...resourcesArr.map((r) => new URL('/_sw/resources/' + r, location.href).toString()),
        ],
        onprogress(this: ServiceWorker, a, b) {
            if (!this.custom.progress) {
                const comp = h(ProgressNotf)
                const notf = ElNotification({
                    title: '离线数据更新中...',
                    message: comp,
                    position: 'bottom-right',
                    showClose: false,
                    duration: 0,
                    type: 'info',
                })
                this.custom.progress = {
                    notf,
                    comp,
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const progress = this.custom.progress as any
            const vonde = progress.comp as VNode
            const notf = progress.notf as NotificationHandle
            const comp = vonde.component as ComponentInternalInstance
            if (comp.exposed) {
                comp.exposed.setProgress((a / b) * 100)
            }
            if (a >= b) {
                setTimeout(() => {
                    notf.close()
                    ElNotification({
                        title: '离线数据更新完成',
                        position: 'bottom-right',
                        type: 'success',
                    })
                }, 500)
            }
        },
    },
)
if (location.href.includes('let-me-in')) {
    sw.uninstall()
} else if (process.env.NODE_ENV === 'production' || location.href.includes('force-sw')) {
    sw.install()
}
window.$cocogoat.sw = sw
