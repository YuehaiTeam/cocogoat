<template>
    <el-dialog :title="achievement ? amos[achievement.name] : ''" :model-value="!!achievement" @close="$emit('close')">
        <div :class="$style.trigger">
            <div class="trigger-type">
                <b>触发方式：</b>
                <span>{{
                    triggerText[achievement?.trigger.type || '未知'] || achievement?.trigger.type || '未知'
                }}</span>
            </div>
            <ul v-if="achievement?.trigger.task" class="task-type">
                <li v-for="i in achievement.trigger.task" :key="i.questId">
                    <span class="badge" :class="i.type">{{ taskType[i.type] || i.type || '主线任务' }}</span>
                    <span class="name">{{ amos[i.name] }}</span>
                </li>
            </ul>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { i18n } from '@/i18n'
import { Achievement } from '@/typings/Achievement'
import { defineComponent, PropType, toRef } from 'vue'

export default defineComponent({
    props: {
        achievement: {
            type: Object as PropType<Achievement>,
            required: false,
        },
    },
    emits: ['close'],
    setup() {
        const triggerText = {
            FINISH_QUEST_OR: '完成以下任务之一',
            FINISH_QUEST_AND: '完成以下所有任务',
            DAILY_TASK_VAR_EQUAL: '每日委托触发特定对话',
        } as Record<string, string>
        const taskType = {
            WQ: '世界任务',
            IQ: '每日委托',
        } as Record<string, string>
        return {
            triggerText,
            taskType,
            amos: toRef(i18n, 'amos'),
        }
    },
})
</script>

<style lang="scss" module>
.trigger {
    :global {
        .badge {
            font-size: 12px;
            background: #409eff;
            color: #fff;
            padding: 2px 5px;
            margin-right: 5px;
            border-radius: 3px;
            &.IQ {
                background: #7236e1;
            }
        }

        .task-type li {
            margin-top: 10px;
        }
    }
}
</style>
