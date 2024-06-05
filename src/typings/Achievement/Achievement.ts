import { Ref, ref } from 'vue'
import { Achievement } from './Amos'
import { UIAFItem, UIAFStatus } from './UIAF'
import { IPartialAchievement } from '@/generated/amos-data/amos/achievements/typing-partial'

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
    _amos: Achievement | null = null
    _part: IPartialAchievement | null = null
    constructor(data: IAchievementItem) {
        if (data instanceof AchievementItem) {
            this._data = data._data
        } else {
            this._data = ref(data)
        }
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
    get amos() {
        if (this._amos) return Promise.resolve(this._amos)
        const achievementsAmos = import('@/generated/amos-data/amos/achievements/index')
        const goalMap = import('@/views/Achievement/goalMap')
        const achPartialAmos = import('@/generated/amos-data/amos/achievements/partial')
        return Promise.all([achievementsAmos, achPartialAmos, goalMap]).then(
            ([{ default: achievementsAmos }, { default: achPartialAmos }, { goalMap }]) => {
                const goalId = goalMap[this.id]
                const amos = achievementsAmos
                    .find((cat) => cat.id === goalId)
                    ?.achievements.find((ach) => ach.id === this.id)
                if (!amos) {
                    throw new Error(`Achievement ${this.id} not found`)
                }
                this._amos = amos
                this._part = achPartialAmos[this.id] || []
                return this._amos
            },
        )
    }
    get goalId() {
        return this.amos.then((amos) => amos.categoryId)
    }
    get part() {
        return this.amos.then(() => this._part as IPartialAchievement)
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
    async finishAllPartials() {
        this.partial = (await this.part).reduce(
            (acc, part) => {
                acc[part.id] = Math.floor(Date.now() / 1000)
                return acc
            },
            {} as Record<number, number>,
        )
        return this
    }
    static fromObject(obj: Record<number, IAchievementItem>): Record<number, AchievementItem> {
        return Object.values(obj).reduce(
            (acc, data) => {
                acc[data.id] = new AchievementItem(data)
                return acc
            },
            {} as Record<number, AchievementItem>,
        )
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
