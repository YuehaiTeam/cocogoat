import {
    AchievementCategory as AmosAchievementCategory,
    Achievement as AmosAchievement,
} from 'cocogoat-amos/dist/achievement/typing'
export interface Achievement extends AmosAchievement {
    sub?: Achievement[]
}
export interface AchievementCategory extends AmosAchievementCategory {
    finished?: number
    totalReward: number
}
export interface IAchievementStore {
    id: number
    categoryId: number
    status: string
    date: string
    images?: Record<string, string>
    partial?: number[]
    partialDetail?: { id: number; timestamp: number }[]
}
export interface UIAFItem {
    id: number
    current: number | null
    timestamp: number
}
export interface UIAF {
    // we read source from memo - which is not in the official UIAF format
    source?: string
    info: {
        export_app?: string
        export_app_version?: string
        uiaf_version?: '1.0'
        export_timestamp?: number
    }
    list: UIAFItem[]
}
// 9999-12-31 23:59:59
export const UIAFMagicTime = 253402271999

export interface IDecomposedAchievement {
    Id: number
    AchievementId: number
    Title: string
    Daily: string[]
    Decomposed: string[]
}
