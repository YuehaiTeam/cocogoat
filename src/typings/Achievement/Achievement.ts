import { Ref, ref } from 'vue'
import { Achievement } from './Amos'
import { UIAFItem, UIAFStatus } from './UIAF'
import achievementsAmos from '@/plugins/amos/achievements/index'
import achPartialAmos from '@/plugins/amos/achievements/partial'
import { goalMap } from '../../views/Achievement/goalMap'
import { IPartialAchievement } from 'cocogoat-amos/dist/achievement-partial/typing'

export enum IAchievementSource {
    SCAN = 'scan',
    USER = 'user',
    IMPORT = 'import',
}

export interface IAchievementItem extends UIAFItem {
    partial: Record<number, number>
    image: string
    source: IAchievementSource
}
export class AchievementItem implements IAchievementItem {
    _data: Ref<IAchievementItem> | IAchievementItem
    _amos: Achievement
    _part: IPartialAchievement
    goalId: number
    constructor(data: IAchievementItem) {
        if (data instanceof AchievementItem) {
            this._data = data._data
        } else {
            this._data = ref(data)
        }
        this.goalId = goalMap[this.id]
        const amos = achievementsAmos
            .find((cat) => cat.id === this.goalId)
            ?.achievements.find((ach) => ach.id === this.id)
        if (!amos) {
            throw new Error(`Achievement ${this.id} not found`)
        }
        this._amos = amos
        this._part = achPartialAmos[this.id] || []
    }
    data() {
        return 'value' in this._data ? this._data.value : this._data
    }
    get id() {
        return this.data().id
    }
    set id(_id) {
        throw new Error('Id is readonly')
    }
    get current() {
        return this.data().current
    }
    set current(current) {
        this.data().current = current
    }
    get timestamp() {
        return this.data().timestamp
    }
    set timestamp(timestamp) {
        this.data().timestamp = timestamp
    }
    get status() {
        return this.data().status
    }
    set status(status) {
        this.data().status = status
    }
    get partial() {
        return this.data().partial
    }
    set partial(partial) {
        this.data().partial = partial
    }
    get image() {
        return this.data().image
    }
    set image(image) {
        this.data().image = image
    }
    get source() {
        return this.data().source
    }
    set source(source) {
        this.data().source = source
    }
    toJSON() {
        return this.data()
    }
    finishPartial(id: number, timestamp = Math.floor(Date.now() / 1000)) {
        this.partial[id] = timestamp
    }
    removePartial(id: number) {
        delete this.partial[id]
    }
    finishAllPartials() {
        this.partial = this._part.reduce((acc, part) => {
            acc[part.id] = Math.floor(Date.now() / 1000)
            return acc
        }, {} as Record<number, number>)
        return this
    }
    static fromObject(obj: Record<number, IAchievementItem>): Record<number, AchievementItem> {
        return Object.values(obj).reduce((acc, data) => {
            acc[data.id] = new AchievementItem(data)
            return acc
        }, {} as Record<number, AchievementItem>)
    }
    static create(id: number, status = UIAFStatus.ACHIEVEMENT_POINT_TAKEN) {
        return new AchievementItem({
            id,
            current: 0,
            timestamp: Math.floor(Date.now() / 1000),
            status,
            partial: {},
            image: '',
            source: IAchievementSource.USER,
        })
    }
}
