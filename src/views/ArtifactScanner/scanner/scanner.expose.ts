import { expose } from 'comlink'

import { initMap } from './map'
import * as cvUtil from './cvUtil'
import * as scanner from './scanner'
import { recognize } from '@/modules/yas'
import { setResources } from '@/resources'
import { diffCached, diffCachedA } from '@/utils/cv/measurement.worker'

export const W = {
    recognize,
    ...scanner,
    ...cvUtil,
    setResources,
    initMap,
    diffCached,
    diffCachedA,
}
expose(W)
