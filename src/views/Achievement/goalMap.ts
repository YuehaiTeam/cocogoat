import achevementsAmos from '@/plugins/amos/achievements/index'
export const goalMap = {} as Record<number, number>
achevementsAmos.forEach((cat) => {
    cat.achievements.forEach((ach) => {
        goalMap[ach.id] = cat.id
    })
})
