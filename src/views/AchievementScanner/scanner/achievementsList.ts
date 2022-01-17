import { Achievement } from '@/plugins/genshin-data/src'
import _achievementMap from '@genshin-data/chinese-simplified/achievements.json'
export const achievementMap = _achievementMap
export const achievementTitles: { str: string; obj: Achievement }[] = []
export const achievementEC: { str: string; obj: Achievement }[] = []
achievementMap.forEach((c) => {
    c.achievements.forEach((a) => {
        achievementTitles.push({
            str: a.name,
            obj: a,
        })
        achievementEC.push({
            str: `${a.name}-${a.desc}`,
            obj: a,
        })
    })
})
