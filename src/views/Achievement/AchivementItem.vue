<template>
    <section :class="{ sub: i.preStage, [$style.achievementItem]: 1 }">
        <div class="single" :class="{ 'no-contrib': !contributed[i.id] }">
            <div v-show="questType" class="badge" :class="questType ? questType[1] : ''">
                <span>{{ questType ? questType[0] : '' }}</span>
            </div>
            <div class="detail">
                <div class="check">
                    <a v-if="i.preStage && !preFin" class="check-disabled" title="上一阶段未达成"></a>
                    <div class="check-circle" :class="{ checked: isFin }" @click="$emit('check')">
                        <fa-icon v-if="!i.preStage || preFin" icon="check" />
                        <fa-icon v-else icon="ellipsis" />
                    </div>
                </div>
                <div class="middle">
                    <div class="name">
                        <div class="award" :class="{ checked: isFin }">
                            <img :src="img('yuanshi')" alt="原石" />
                            <span class="number">{{ i.reward }}</span>
                        </div>
                        <div class="ntxt" @click="$emit('click-title')">
                            {{ amos[i.name] }}
                            <sup class="version">
                                {{ version }}
                            </sup>
                        </div>
                    </div>
                    <small>
                        <a
                            :href="contributed[i.id] ? contributed[i.id] : searchMys(i)"
                            target="_blank"
                            class="contributed"
                            rel="noopener nofollow"
                        >
                            <fa-icon icon="arrow-up-right-from-square" />
                            {{ contributed[i.id] ? '攻略' : '搜索' }}
                        </a>
                        {{ amos[i.desc].replace('{param0}', i.total.toString()) }}
                    </small>
                </div>
                <div v-if="fin" class="right">
                    <div class="status">
                        <div class="status-out">
                            <input
                                :value="fin.current"
                                type="text"
                                @input="$emit('input-current', ($event?.target as HTMLInputElement).value)"
                            />
                            <div class="sep">/</div>
                            <div class="total">{{ i.total }}</div>
                        </div>
                        <div class="status-in">
                            <div class="total">{{ fin.current }}</div>
                            <div class="sep">/</div>
                            <div class="total">{{ i.total }}</div>
                        </div>
                    </div>
                    <div v-if="isFin" class="date">
                        <div class="date-out">
                            <input
                                :value="formatDate(fin.timestamp)"
                                type="text"
                                @blur="updateDate(($event?.target as HTMLInputElement).value)"
                                @keyup.enter="updateDate(($event?.target as HTMLInputElement).value)"
                            />
                        </div>
                        <div class="date-in placeholder">{{ formatDate(fin.timestamp) }}</div>
                    </div>
                </div>
            </div>
            <div v-show="partial.length > 0" class="partial">
                <li v-for="i in partial" :key="i.id" class="partial-item" :class="partialClassMap[i.type] || i.type">
                    <el-checkbox
                        :model-value="fin && fin.partial[i.id] > 0"
                        @update:model-value="$emit('input-partial', [i.id, $event])"
                    >
                        <span class="partial-badge">
                            {{ partialTypeMap[i.type] || i.type }}
                        </span>
                        {{ getPartialName(i.name) }}
                    </el-checkbox>
                    <span class="date">{{ getPartialDate(fin, i.id) }}</span>
                </li>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { i18n } from '@/i18n'
import versionMap from './versionMap'
import { badgeMap, badgeTypeMap } from './badgeMap'
import img from '@/assets/images'
import { toRef, PropType, defineComponent, computed } from 'vue'
import { Achievement, UIAFStatus } from '@/typings/Achievement'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import dayjs from 'dayjs'
import { IPartialAchievement } from '@/generated/amos-data/amos/achievements/typing-partial'
import { AchievementItem } from '@/typings/Achievement/Achievement'
library.add(faArrowUpRightFromSquare)
export default defineComponent({
    props: {
        i: {
            type: Object as PropType<Achievement>,
            required: true,
        },
        fin: {
            type: Object as PropType<AchievementItem | undefined>,
            required: false,
        },
        preFin: {
            type: Object as PropType<AchievementItem | undefined>,
            required: false,
        },
        contributed: {
            type: Object as PropType<Record<string, string>>,
            required: true,
        },
        partial: {
            type: Array as PropType<IPartialAchievement>,
            required: true,
        },
    },
    emits: ['input-date', 'input-current', 'input-partial', 'check', 'click-title'],
    setup(props, { emit }) {
        const searchMys = (i: Achievement) => {
            return `https://www.miyoushe.com/ys/search?keyword=${encodeURIComponent(i18n.amos[i.name])}`
        }
        return {
            img,
            searchMys,
            amos: toRef(i18n, 'amos'),
            questType: computed(() => {
                if (props.i.trigger) {
                    let res: string[] | boolean = false
                    if (props.i.trigger.task && props.i.trigger.task.length > 0) {
                        res = badgeMap[props.i.trigger.task[0].type]
                            ? [badgeMap[props.i.trigger.task[0].type], props.i.trigger.task[0].type]
                            : false
                    } else if (props.i.trigger.type) {
                        res = badgeTypeMap[props.i.trigger.type]
                            ? [badgeMap[badgeTypeMap[props.i.trigger.type]], badgeTypeMap[props.i.trigger.type]]
                            : false
                    }
                    return res
                } else {
                    return false
                }
            }),
            isFin: computed(() => {
                return props.fin && props.fin.status > UIAFStatus.ACHIEVEMENT_UNFINISHED
            }),
            version: computed(() => {
                if (!versionMap[props.i.id]) {
                    console.log(props.i.id, 'has no version')
                    return 'BETA'
                }
                return versionMap[props.i.id].toFixed(1) || ''
            }),
            formatDate(datestr: number) {
                try {
                    const d = new Date(datestr * 1000)
                    // check 0
                    if (d.getTime() === 0) {
                        return ''
                    }
                    // check has hour minute second
                    if (d.getHours() || d.getMinutes() || d.getSeconds()) {
                        return dayjs(d).format('YYYY/MM/DD HH:mm:ss')
                    }
                    return dayjs(d).format('YYYY/MM/DD')
                } catch (e) {
                    return ''
                }
            },
            updateDate(datestr: string) {
                const d = datestr.trim()
                if (d === '') {
                    emit('input-date', 0)
                    return
                }
                try {
                    const dt = new Date(d)
                    if (!d.includes(':') && dt.getHours() === 8 && dt.getMinutes() === 0 && dt.getSeconds() === 0) {
                        dt.setHours(0)
                    }
                    emit('input-date', Math.floor(dt.getTime() / 1000))
                } catch (e) {}
            },
            partialTypeMap: {
                quest: '任务',
                subquest: '任务',
                task: '委托',
                subtask: '委托',
                achievement: '成就',
            },
            partialClassMap: {
                quest: 'WQ',
                subquest: 'WQ',
                task: 'IQ',
                subtask: 'IQ',
                achievement: 'AC',
            },
            getPartialDate(fin: AchievementItem | undefined, id: number) {
                if (!fin) return ''
                const ts = fin.partial[id]
                if (!ts) return ''
                return dayjs(ts * 1000).format('YYYY/MM/DD HH:mm:ss')
            },
            getPartialName(namearr: (string | number)[]) {
                const nameArr = namearr.map((i) => {
                    if (typeof i === 'number') {
                        return i18n.amos[i] || i.toString()
                    } else {
                        return i
                    }
                })
                nameArr.forEach((i, a) => {
                    if (i.indexOf('/') === 0) {
                        const regex = new RegExp(i.split('/')[1], i.split('/')[2])
                        // remove regex
                        nameArr[a] = ''
                        // match last item
                        const matches = nameArr[a - 1].match(regex)
                        if (matches && matches[1]) {
                            nameArr[a - 1] = matches[1]
                        }
                    }
                })
                return nameArr.join('')
            },
        }
    },
})
</script>

<style lang="scss" module>
.achievement-item {
    padding-top: 15px;
    &:global(.sub) {
        padding-top: 0;
        :global(.single) {
            background: #f0f7ff;
            border-top: 1px solid #d3e8ff;
            :global(.dark) & {
                background: #212426;
                border-top: 1px solid var(--c-border);
            }
        }
    }
    :global {
        .single {
            background: var(--c-white);
            border-radius: 3px;
            color: var(--c-text);
            position: relative;
            .detail {
                padding: 15px;
            }
            .partial {
                background: #f0f7ff;
                border-top: 1px solid #d3e8ff;
                .partial-badge {
                    height: 19px;
                    border: 1px solid;
                    font-size: 12px;
                    padding: 1px 3px;
                    box-sizing: border-box;
                    border-radius: 2px;
                }
                .date {
                    float: right;
                    font-size: 12px;
                    height: 100%;
                    line-height: 28px;
                    opacity: 0.8;
                }
                :global(.dark) & {
                    background: #212426;
                    border-top: 1px solid var(--c-border);
                }
                padding: 5px 23px;
                .partial-item {
                    list-style: none;
                }
                .partial-item .el-checkbox {
                    height: 28px;
                }
            }
            .badge {
                position: absolute;
                top: 0;
                right: 0;
                font-size: 12px;
                width: 35px;
                height: 35px;
                pointer-events: none;
                &:after {
                    border-right: 40px solid var(--c-theme);
                    border-bottom: 40px solid var(--c-white);
                    content: ' ';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                }
                span {
                    position: relative;
                    z-index: 2;
                    color: #fff;
                    transform: rotate(45deg) scale(0.9);
                    display: block;
                    transform-origin: bottom;
                    margin-left: 6px;
                    margin-top: 3px;
                }
                &.WQ:after {
                    opacity: 0.7;
                }
                &.IQ:after {
                    border-right-color: #a87bfd;
                }
                &.AQ:after {
                    border-right-color: #ec6f10;
                }
                :global(.dark) & {
                    &.AQ:after {
                        border-right-color: #9c5723;
                    }
                }
            }

            .ntxt {
                display: inline-block;
                white-space: nowrap;
                max-width: calc(100% - 140px);
                overflow: hidden;
                text-overflow: ellipsis;
                cursor: pointer;
                transition: all 0.3s;
                &:hover {
                    color: #0079cc;
                }
                .version {
                    font-size: 12px;
                    color: var(--c-theme);
                    margin-left: -2px;
                    font-family: genshin;
                }
            }
            small {
                max-width: calc(100% - 80px);
                overflow: hidden;
                white-space: nowrap;
                display: inline-block;
                text-overflow: ellipsis;

                a {
                    text-decoration: none;
                    color: var(--c-theme);
                    display: inline-block;
                    vertical-align: top;
                    border-bottom: 1px solid transparent;
                    box-sizing: border-box;
                    transition: all 0.3s;
                    font-size: 12px;
                    width: 55px;
                    text-align: center;
                    margin-right: 5px;
                    position: relative;
                    top: 2px;
                    &:hover {
                        border-color: var(--c-theme);
                        opacity: 0.8;
                    }
                }
            }
            .award {
                user-select: none;
                display: inline-block;
                height: 25px;
                vertical-align: top;
                color: var(--c-theme);
                font-size: 12px;
                padding: 0 5px;
                box-sizing: border-box;
                border-radius: 3px;
                margin-right: 10px;
                width: 55px;
                text-align: center;
                border: 1px solid var(--c-theme);
                &.checked {
                    background: var(--c-theme);
                    color: var(--c-white);
                }
                img {
                    height: 18px;
                    vertical-align: top;
                    padding-top: 3px;
                    padding-right: 4px;
                    display: inline-block;
                    margin-left: -2px;
                }
                .number {
                    height: 18px;
                    vertical-align: top;
                    padding-top: 4px;
                    display: inline-block;
                }
            }

            .right {
                text-align: right;
                position: absolute;
                right: 15px;
                top: 15px;
                input,
                .placeholder {
                    appearance: none;
                    border: 0;
                    color: var(--c-theme);
                    width: 100%;
                    text-align: center;
                    background: transparent;
                    display: block;
                    outline: 0;
                    border: 1px solid transparent;
                    border-radius: 3px;
                    &:focus,
                    &:hover {
                        border-color: var(--c-theme);
                    }
                }

                .date {
                    position: relative;
                    font-size: 13px;
                    padding-top: 3px;
                    .date-out {
                        position: absolute;
                        right: 0;
                        top: 0;
                        z-index: 2;
                    }

                    .date-in {
                        opacity: 0;
                    }
                }
                .status {
                    position: relative;
                    display: inline-block;
                    .status-out {
                        position: absolute;
                        top: 0;
                        right: 0;
                        z-index: 2;
                        min-width: 80px;
                    }

                    .status-in {
                        opacity: 0;
                        padding-right: 6px;
                    }
                }
                .status-out,
                .status-in {
                    text-align: center;
                    display: inline-flex;
                    font-size: 17px;
                    font-family: Consolas, monospace;

                    & > div {
                        color: var(--c-theme);
                        display: inline-block;
                        height: 26px;
                        line-height: 26px;
                        height: 24px;
                        line-height: 24px;
                        border: 1px solid transparent;
                    }
                    input {
                        font-size: 17px;
                        height: 22px;
                        display: inline-block;
                        text-align: right;
                        font-family: Consolas, monospace;
                        border-top-right-radius: 0;
                        border-bottom-right-radius: 0;
                        &:focus,
                        &:hover {
                            border-right-color: transparent;
                            & + div {
                                border-top-color: var(--c-theme);
                                border-bottom-color: var(--c-theme);
                                & + div {
                                    border-top-color: var(--c-theme);
                                    border-bottom-color: var(--c-theme);
                                    border-right-color: var(--c-theme);
                                }
                            }
                        }
                    }
                    .sep {
                        padding-right: 2px;
                        margin-left: -1px;
                        border-left: 0;
                    }
                    .total {
                        padding-right: 4px;
                        margin-left: -1px;
                        margin-right: -2px;
                        border-left: 0;
                        border-top-right-radius: 3px;
                        border-bottom-right-radius: 3px;
                    }
                }
            }
            .middle {
                margin-left: 50px;
            }
            .name {
                font-weight: bold;
            }
            .desc {
                color: #888;
                font-size: 13px;
            }
            .check {
                position: absolute;
                user-select: none;
                height: 40px;
                width: 40px;
                left: 15px;
                top: 20px;
                box-sizing: border-box;
                .check-disabled {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    border: 0;
                    z-index: 2;
                    height: 40px;
                    cursor: not-allowed;
                }
                .check-circle {
                    cursor: pointer;
                    width: 34px;
                    height: 34px;
                    border: 2px solid #bfdfff;
                    border-radius: 100%;
                    box-sizing: border-box;
                    color: #bfdfff;
                    font-size: 23px;
                    text-align: center;
                    transition: all 0.3s;
                    :global(.dark) & {
                        opacity: 0.6;
                    }
                    &.checked {
                        color: var(--c-white);
                        background: var(--c-theme);
                        border-color: var(--c-theme);
                        :global(.dark) & {
                            opacity: 0.9;
                        }
                    }
                    &:hover {
                        border-color: var(--c-theme);
                    }
                    &.checked:hover {
                        border-color: #0079cc;
                        background: #0079cc;
                    }
                }
            }
        }
    }
}
:global(.m) .achievement-item {
    :global {
        .ntxt {
            max-width: calc(100% - 120px);
            font-size: 15px;
        }
        .single {
            .detail {
                padding-left: 10px;
            }
            small {
                max-width: calc(100% - 60px);
                font-size: 12px;
                a {
                    width: 45px;
                    margin-right: 1px;
                }
            }
        }
        .check {
            left: 10px;
        }
        .middle {
            margin-left: 40px;
        }
        .award {
            width: 45px;
            margin-right: 5px;
            img {
                width: 15px;
                height: 15px;
                padding-top: 5px;
            }
        }
        .right {
            min-width: 65px;
            position: absolute;
            right: 10px;
            input {
                width: 65px;
                font-size: 12px;
            }
            .status-in,
            .status-out {
                &.status-in {
                    padding-right: 8px;
                }
                font-size: 15px;

                & > div {
                    height: 19px;
                    line-height: 21px;
                    font-size: 13px;
                    vertical-align: bottom;
                }
                input {
                    font-size: 15px;
                    height: 17px;
                    width: 100%;
                    padding-right: 1px;
                }
                .sep {
                    padding: 0;
                }
            }
        }
    }
}
</style>
