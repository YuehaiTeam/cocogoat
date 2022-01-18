import { Achievement as GenshinDataAchievement } from '@/plugins/genshin-data/src'
export interface Achievement extends GenshinDataAchievement {
    id: number
    name: string
    desc: string
    reward: number
    hidden: boolean
    order: number
    categoryId: number
}
