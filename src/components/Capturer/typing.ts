import { Ref } from 'vue'
import type { ICVMat } from '@/utils/cv'
import { CocogoatWebControl } from '@/modules/webcontrol'
export interface ICapturer {
    capture: ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => ICVMat
    windowId: number
    control: CocogoatWebControl
    stop: () => void
    reset: () => void
    requestCapture: () => void
    video: Ref<HTMLVideoElement>
    click: (x: number, y: number) => Promise<void>
    onFrame: (cb: () => unknown | Promise<unknown>) => void
    // eslint-disable-next-line max-params
    drag: (
        fr: { x: number; y: number },
        to: { x: number; y: number },
        duration?: number,
        step?: number,
        end?: number,
    ) => Promise<void>
}
