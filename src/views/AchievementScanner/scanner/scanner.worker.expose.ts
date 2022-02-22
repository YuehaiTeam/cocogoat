import { expose } from 'comlink'
import * as cvUtils from '../cvUtils'
import * as scanner from './scanner'
import { initAchievementMap } from './achievementsList'
import { setResources } from '@/resources'
export const W = {
    ...cvUtils,
    ...scanner,
    setResources,
    initAchievementMap,
}
expose(W)
