import { IDecomposedAchievement } from '@/typings/Achievement'
import achievementDecomposedArr from '@/plugins/decomposed-achievements/DecomposedAchievements.json'
export const achievementDecomposed = achievementDecomposedArr.reduce((acc, cur) => {
    acc[cur.AchievementId] = cur
    return acc
}, {} as Record<number, IDecomposedAchievement>)
