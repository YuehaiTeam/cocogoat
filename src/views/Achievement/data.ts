import { AchievementCategory } from '@/typings/Achievement'
import achevementsAmos_ from '@/plugins/amos/achievements/index'
export const achevementsAmos = achevementsAmos_ as AchievementCategory[]
achevementsAmos.forEach((e) => {
    e.totalReward = 0
})
