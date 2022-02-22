import { Achievement as GenshinDataAchievement } from '@/plugins/genshin-data/src'
export interface Achievement extends GenshinDataAchievement {
    categoryId: number
    preStage?: number
}
export interface AchievementCategory {
    id: string
    originalId: number
    name: string
    order: number
    achievements: Achievement[]
}
export interface IAchievementStore {
    id: number
    status: string
    date: string
    images: Record<string, string>
}
