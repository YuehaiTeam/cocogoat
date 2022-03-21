import { expose } from 'comlink'
import * as cvUtils from './cvUtils'
import * as scanner from './scanner'
import { initAchievementMap } from './achievementsList'
import { setResources } from '@/resources'
import { diffCached } from '@/utils/cv/measurement.worker'
export const W = {
    ...cvUtils,
    ...scanner,
    setResources,
    initAchievementMap,
    diffCached,
}
expose(W)
