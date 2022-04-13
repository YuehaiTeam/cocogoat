import {
    AchievementCategory as AmosAchievementCategory,
    Achievement as AmosAchievement,
} from '@yuehaiteam/amos/dist/achievement/typing'
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
}
