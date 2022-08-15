export enum UIAFStatus {
    ACHIEVEMENT_INVALID = 0,
    ACHIEVEMENT_UNFINISHED = 1,
    ACHIEVEMENT_FINISHED = 2,
    ACHIEVEMENT_POINT_TAKEN = 3,
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
        uiaf_version?: '1.0' | '1.1'
        export_timestamp?: number
    }
    list: UIAFItem[]
}
// 9999-12-31 23:59:59
export const UIAFMagicTime = 253402271999
