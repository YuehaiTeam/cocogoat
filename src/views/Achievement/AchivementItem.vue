<template>
    <section :class="{ sub: i.preStage, [$style.achievementItem]: 1 }">
        <div class="single">
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
                    <div class="ntxt">
                        {{ i.name }}
                    </div>
                </div>
                <small>
                    {{ i.desc }}
                </small>
            </div>
            <div v-if="fin" class="right">
                <div class="status">
                    <input :value="fin.status" type="text" @input="$emit('input-status', $event.target.value)" />
                </div>
                <div class="date">
                    <input :value="fin.date" type="text" @input="$emit('input-date', $event.target.value)" />
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { PropType } from '@vue/runtime-core'
import { Achievement, IAchievementStore } from '@/typings/Achievement'
export default {
    props: {
        i: {
            type: Object as PropType<Achievement>,
        },
        fin: {
            type: [Object, undefined] as PropType<IAchievementStore | undefined>,
        },
        preFin: {
            type: [Object, undefined] as PropType<IAchievementStore | undefined>,
        },
    },
    emits: ['input-date', 'input-status', 'check'],
    setup() {
        return {}
    },
}
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
            .ntxt {
                display: inline-block;
                white-space: nowrap;
                max-width: calc(100% - 200px);
                overflow: hidden;
                text-overflow: ellipsis;
            }
            small {
                max-width: calc(100% - 145px);
                overflow: hidden;
                white-space: nowrap;
                display: inline-block;
                text-overflow: ellipsis;
            }
            .award {
                user-select: none;
                display: inline-block;
                height: 25px;
                vertical-align: middle;
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
</style>
