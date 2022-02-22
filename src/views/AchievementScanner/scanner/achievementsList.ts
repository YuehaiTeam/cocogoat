import { Achievement, AchievementCategory } from '@/typings/Achievement'
export let achievementMap = [] as AchievementCategory[]
export const achievementTitles: { str: string; obj: Achievement }[] = []
export const achievementEC: { str: string; obj: Achievement }[] = []
export function initAchievementMap(map: AchievementCategory[]) {
    achievementMap = map
    achievementMap.forEach((c) => {
        c.achievements.forEach((a) => {
            const x = {
                ...a,
                categoryId: c.originalId || 0,
            }
            achievementTitles.push({
                str: a.name,
                obj: x,
            })
            achievementEC.push({
                str: `${a.name}-${a.desc}`,
                obj: x,
            })
        })
    })
    console.log('created achievement map with length=' + achievementTitles.length)
}
