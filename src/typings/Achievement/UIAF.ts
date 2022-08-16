export enum UIAFStatus {
    ACHIEVEMENT_INVALID = 0,
    ACHIEVEMENT_UNFINISHED = 1,
    ACHIEVEMENT_FINISHED = 2,
    ACHIEVEMENT_POINT_TAKEN = 3,
}
export const UIAFStatusCN = {
    [UIAFStatus.ACHIEVEMENT_INVALID]: '无效',
    [UIAFStatus.ACHIEVEMENT_UNFINISHED]: '未完成',
    [UIAFStatus.ACHIEVEMENT_FINISHED]: '已完成',
    [UIAFStatus.ACHIEVEMENT_POINT_TAKEN]: '已领取',
}
export interface UIAFItem10 {
    id: number
    current: number | null
    timestamp: number
}
export interface UIAFItem {
    id: number
    current: number | null
    timestamp: number
    status: UIAFStatus
}
export interface UIAF {
    // we read source from memo - which is not in the official UIAF format
    source?: string
    info: {
        export_app?: string
        export_app_version?: string
        uiaf_version?: 'v1.0' | 'v1.1'
        export_timestamp?: number
        cocogoat_ext?: {
            version: 'v1.0'
        }
    }
    list: UIAFItem10[]
}
// 9999-12-31 23:59:59
export const UIAFMagicTime = 253402271999
