import { uniq } from 'lodash-es'
import versionMeta from '@/generated/versionMeta.json'

const versionMap = Object.entries(versionMeta).reduce(
    (prev, curr) => {
        prev[Number(curr[0])] = curr[1]
        return prev
    },
    {} as Record<number, number>,
)
export const versionDateMap = {
    5.3: new Date('2025-01-01'),
    5.2: new Date('2024-11-20'),
    5.1: new Date('2024-10-09'),
    5.0: new Date('2024-08-28'),
    4.7: new Date('2024-06-05'),
    4.6: new Date('2024-04-24'),
    4.5: new Date('2024-03-13'),
    4.4: new Date('2024-01-31'),
    4.3: new Date('2023-12-20'),
    4.2: new Date('2023-11-08'),
    4.1: new Date('2023-09-27'),
    4.0: new Date('2023-08-16'),
    3.8: new Date('2023-07-05'),
    3.7: new Date('2023-05-24'),
    3.6: new Date('2023-04-12'),
    3.5: new Date('2023-03-01'),
    3.4: new Date('2023-01-18'),
    3.3: new Date('2022-12-07'),
    3.2: new Date('2022-11-02'),
    3.1: new Date('2022-09-28'),
    3.0: new Date('2022-08-24'),
    2.8: new Date('2022-07-13'),
    2.7: new Date('2022-05-31'),
    2.6: new Date('2022-03-30'),
} as Record<number, Date>
export default versionMap
export const allVersions = uniq(Object.values(versionMap)).sort((a, b) => b - a)
if (process.env.NODE_ENV === 'development') {
    allVersions.push(0)
}
