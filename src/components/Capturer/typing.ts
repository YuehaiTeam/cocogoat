import type { ICVMat } from '@/utils/cv'
import { CocogoatWebControl } from '@/modules/webcontrol'
export interface ICapturer {
    capture: ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => ICVMat
    windowId: number
    control: CocogoatWebControl
    stop: () => void
    reset: () => void
}
