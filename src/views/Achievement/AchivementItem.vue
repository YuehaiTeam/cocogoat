<template>
    <section :class="{ sub: i.preStage, [$style.achievementItem]: 1 }">
        <div class="single" :class="{ 'no-contrib': !contributed[i.id] }">
            <div v-show="questType" class="badge" :class="questType ? questType[1] : ''">
                <span>{{ questType ? questType[0] : '' }}</span>
            </div>
            <div class="check">
                <a v-if="i.preStage && !preFin" class="check-disabled" title="上一阶段未达成"></a>
                <div class="check-circle" :class="{ checked: fin }" @click="$emit('check')">
                    <fa-icon v-if="!i.preStage || preFin" icon="check" />
                    <fa-icon v-else icon="ellipsis" />
                </div>
            </div>
            <div class="middle">
                <div class="name">
                    <div class="award" :class="{ checked: fin }">
                        <img src="@/assets/images/yuanshi.png" alt="原石" />
                        <span class="number">{{ i.reward }}</span>
                    </div>
                    <div class="ntxt" @click="$emit('click-title')">
                        {{ amos[i.name] }}
                    </div>
                </div>
                <small>
                    <a
                        v-if="contributed[i.id]"
                        :href="contributed[i.id]"
                        target="_blank"
                        class="contributed"
                        rel="noopener nofollow"
                    >
                        <fa-icon icon="arrow-up-right-from-square" />
                        攻略
                    </a>
                    {{ amos[i.desc] }}
                </small>
            </div>
            <div v-if="fin" class="right">
                <div class="status">
                    <input
                        :value="fin.status"
                        type="text"
                        @input="$emit('input-status', ($event?.target as HTMLInputElement).value)"
                    />
                </div>
                <div class="date">
                    <input
                        :value="fin.date"
                        type="text"
                        @input="$emit('input-date', ($event?.target as HTMLInputElement).value)"
                    />
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { i18n } from '@/i18n'
import { toRef, PropType, defineComponent, computed } from 'vue'
import { Achievement, IAchievementStore } from '@/typings/Achievement'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
library.add(faArrowUpRightFromSquare)
export default defineComponent({
    props: {
        i: {
            type: Object as PropType<Achievement>,
            required: true,
        },
        fin: {
            type: Object as PropType<IAchievementStore | undefined>,
            required: false,
        },
        preFin: {
            type: Object as PropType<IAchievementStore | undefined>,
            required: false,
        },
        contributed: {
            type: Object as PropType<Record<string, string>>,
            required: true,
        },
    },
    emits: ['input-date', 'input-status', 'check', 'click-title'],
    setup(props) {
        const badgeMap = {
            WQ: '任务',
            IQ: '委托',
        } as Record<string, string>
        return {
            amos: toRef(i18n, 'amos'),
            questType: computed(() => {
                if (props.i.trigger && props.i.trigger.task && props.i.trigger.task.length > 0) {
                    return badgeMap[props.i.trigger.task[0].type]
                        ? [badgeMap[props.i.trigger.task[0].type], props.i.trigger.task[0].type]
                        : false
                } else {
                    return false
                }
            }),
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
        }
    }
    :global {
        .single {
            background: #fff;
            border-radius: 3px;
            color: #555;
            position: relative;
            padding: 15px;
            .badge {
                position: absolute;
                top: 0;
                right: 0;
                font-size: 12px;
                width: 35px;
                height: 35px;
                pointer-events: none;
                &:after {
                    border-right: 40px solid #409eff;
                    border-bottom: 40px solid #fff;
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
                    opacity: 0.6;
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
            }
            small {
                max-width: calc(100% - 80px);
                overflow: hidden;
                white-space: nowrap;
                display: inline-block;
                text-overflow: ellipsis;

                a {
                    text-decoration: none;
                    color: #409eff;
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
                        border-color: #409eff;
                        opacity: 0.8;
                    }
                }
            }
            .award {
                user-select: none;
                display: inline-block;
                height: 25px;
                vertical-align: top;
                color: #409eff;
                font-size: 12px;
                padding: 0 5px;
                box-sizing: border-box;
                border-radius: 3px;
                margin-right: 10px;
                width: 55px;
                text-align: center;
                border: 1px solid #409eff;
                &.checked {
                    background: #409eff;
                    color: #fff;
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
                width: 80px;
                position: absolute;
                right: 15px;
                top: 15px;
                input {
                    appearance: none;
                    border: 0;
                    color: #409eff;
                    width: 100%;
                    text-align: center;
                    background: transparent;
                    display: block;
                    outline: 0;
                    border: 1px solid transparent;
                    border-radius: 3px;
                    &:focus,
                    &:hover {
                        border-color: #409eff;
                    }
                }
                .status input {
                    font-size: 17px;
                    height: 22px;
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
                    &.checked {
                        color: #fff;
                        background: #409eff;
                        border-color: #409eff;
                    }
                    &:hover {
                        border-color: #409eff;
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
            padding-left: 10px;
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
            width: 65px;
            position: absolute;
            right: 10px;
            input {
                width: 65px;
                font-size: 12px;
            }
            .status input {
                font-size: 15px;
                height: 17px;
            }
        }
    }
}
</style>
