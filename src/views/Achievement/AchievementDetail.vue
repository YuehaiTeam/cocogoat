<template>
    <el-dialog
        :title="achievement ? amos[achievement.name] : ''"
        :model-value="!!achievement"
        :z-index="111"
        :width="500"
        :class="$style.detailDialog"
        @closed="$emit('close')"
    >
        <div :class="$style.trigger">
            <a
                class="el-link el-link--info is-underline trigger-id"
                target="_blank"
                rel="nofollow"
                :href="`https://genshin.honeyhunterworld.com/a_${achievement?.id || 0}/?lang=CHS`"
            >
                <span class="el-link--inner"> ID: {{ achievement?.id }} </span>
            </a>
            <div class="trigger-type">
                <b>触发方式：</b>
                <span>
                    {{ triggerText[achievement?.trigger.type || '未知'] || achievement?.trigger.type || '未知'
                    }}{{ hasHiddenOperation ? '后进行特殊操作' : '' }}
                </span>
            </div>
            <ul v-if="tasks.length > 0" class="task-type">
                <li v-for="i in tasks" :key="i.questId">
                    <span v-for="j in i.badges" :key="j" class="badge" :class="j">
                        {{ taskType[j] || j }}
                    </span>
                    <span class="name">
                        <a
                            class="el-link el-link--default is-underline"
                            target="_blank"
                            rel="nofollow"
                            :href="`https://genshin.honeyhunterworld.com/q_${i.questId}/?lang=CHS`"
                        >
                            <span class="el-link--inner"> {{ amos[i.name] }} </span>
                        </a>
                    </span>
                </li>
            </ul>
            <div v-if="showNoTask" class="no-task">触发该成就的任务为无名隐藏任务</div>
            <div class="desc">点击 ID 或任务名可查看详情<br />触发条件为程序自动提取，请以实际游戏或攻略为准</div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { i18n } from '@/i18n'
import { Achievement } from '@/typings/Achievement'
import { defineComponent, PropType, toRef, computed } from 'vue'
import 'element-plus/theme-chalk/el-link.css'

export default defineComponent({
    props: {
        achievement: {
            type: Object as PropType<Achievement>,
            required: false,
        },
    },
    emits: ['close'],
    setup(props) {
        const triggerText = {
            FINISH_QUEST_OR: '完成以下任务之一',
            FINISH_QUEST_AND: '完成以下所有任务',
            FINISH_PARENT_QUEST_OR: '完成以下任务之一',
            FINISH_PARENT_QUEST_AND: '完成以下所有任务',
            DAILY_TASK_VAR_EQUAL: '每日委托触发特定对话',
            MAIN_COOP_SAVE_POINT_AND: '邀约任务',
            ELEMENT_REACTION_TIMELIMIT_KILL_NUM: '有限时间内元素反应击杀数量',
            HOME_UNLOCK_BGM_COUNT: '尘歌壶解锁BGM数量',
        } as Record<string, string>
        const taskType = {
            WQ: '世界任务',
            AQ: '魔神任务',
            IQ: '每日委托',
            LQ: '邀约任务',
            H: '前置条件',
        } as Record<string, string>
        const tasks = computed(() => {
            if (!props.achievement || !props.achievement.trigger.task) return []
            return props.achievement.trigger.task.map((e) => {
                return {
                    ...e,
                    badges: e.type.split(' '),
                }
            })
        })
        const hasHiddenOperation = computed(() => {
            return tasks.value.find((e) => e.badges.includes('H'))
        })
        const showNoTask = computed(() => {
            if (!props.achievement) return []
            return (
                tasks.value.length === 0 &&
                ['FINISH_QUEST_OR', 'FINISH_QUEST_AND', 'FINISH_PARENT_QUEST_OR', 'FINISH_PARENT_QUEST_AND'].includes(
                    props.achievement.trigger.type,
                )
            )
        })
        return {
            triggerText,
            taskType,
            amos: toRef(i18n, 'amos'),
            tasks,
            hasHiddenOperation,
            showNoTask,
        }
    },
})
</script>

<style lang="scss" module>
.detail-dialog {
    max-width: 95%;
    :global {
        .el-dialog__headerbtn {
            padding-top: 4px;
        }
    }
}
.trigger {
    margin-top: -20px;
    :global {
        .trigger-id {
            font-size: 12px;
            position: absolute;
            top: 24px;
            right: 54px;
        }

        .badge {
            font-size: 12px;
            background: var(--c-theme);
            color: #fff;
            padding: 2px 5px;
            margin-right: 5px;
            border-radius: 3px;
            &.IQ {
                background: #8d4be5;
                & + .name a:hover {
                    color: #8d4be5;
                    &:after {
                        border-color: #8d4be5;
                    }
                }
            }
            &.H {
                background: #dd5959;
            }

            &.AQ {
                background: #ec6f10;
            }
            :global(.dark) & {
                &.AQ {
                    background: #9c5723;
                }
            }
        }
        .name {
            height: 20px;
            vertical-align: bottom;
        }
        .no-task {
            padding: 30px;
            text-align: center;
        }

        .desc {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 15px;
            margin-bottom: -15px;
        }
        .task-type li {
            margin-top: 10px;
        }
    }
}
</style>
