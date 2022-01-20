import { Achievement } from '@/typings/Achievement'
import _achievementMap from '@genshin-data/chinese-simplified/achievements.json'
export const achievementMap = _achievementMap
export const achievementTitles: { str: string; obj: Achievement }[] = []
export const achievementEC: { str: string; obj: Achievement }[] = []
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
