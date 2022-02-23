import { Achievement as GenshinDataAchievement } from '@/plugins/genshin-data/src'
export interface Achievement extends GenshinDataAchievement {
    categoryId: number
    preStage?: number
    postStage?: number
    sub?: Achievement[]
}
export interface AchievementCategory {
    id: string
    originalId: number
    name: string
    order: number
    achievements: Achievement[]
    finished?: number
}
export interface IAchievementStore {
    id: number
    categoryId: number
    status: string
    date: string
    images: Record<string, string>
}
