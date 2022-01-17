import { expose } from 'comlink'
import * as cvUtils from '../cvUtils'
import * as scanner from './scanner'
const W = {
    ...cvUtils,
    ...scanner,
}
expose(W)
