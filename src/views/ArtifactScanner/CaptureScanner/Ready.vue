<template>
    <div :class="$style.ready">
        <div class="content">
            <div class="title">还差最后一步</div>
            <div class="desc">
                请手动切换到背包的圣遗物界面，然后点击下面按钮继续
                <br />
                <div v-if="hasPictureInPicture">如果没有看到悬浮窗，请点击页面空白处</div>
                <div v-else-if="windowId > 0">
                    <el-alert
                        title="当前浏览器不支持悬浮窗"
                        description="如需中断扫描，请按Win键"
                        type="error"
                        show-icon
                    />
                </div>
                <div v-else>
                    <el-alert
                        title="当前浏览器不支持悬浮窗"
                        description="完成翻页后，请点击“停止共享屏幕”按钮或手动回到本窗口点击停止扫描"
                        type="error"
                        show-icon
                    />
                </div>
                <el-alert
                    v-if="windowId > 0"
                    title="自动扫描器只扫描五星圣遗物"
                    description="圣遗物扫描器仍在测试中，如有问题请及时反馈..."
                    type="warning"
                    show-icon
                />
            </div>
        </div>
        <el-button class="start-btn start-gray" @click="step++">
            <div class="l">
                <fa-icon icon="toggle-on" />
            </div>
            <div class="m">
                <div class="t">我已打开圣遗物背包</div>
                <div v-if="windowId > 0" class="d">将自动切换到原神窗口并开始切换</div>
                <div v-else class="d">点击后请回到原神窗口并手动切换圣遗物</div>
            </div>
            <div class="r">
                <fa-icon icon="angle-right" />
            </div>
        </el-button>
    </div>
</template>

<script lang="ts">
import { useArstore } from './state'
import { defineComponent, toRef, computed } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faToggleOn } from '@fortawesome/free-solid-svg-icons'
import { hasPictureInPicture } from '@/utils/compatibility'
library.add(faToggleOn)

export default defineComponent({
    setup() {
        const store = useArstore()
        return {
            hasPictureInPicture,
            step: toRef(store, 'step'),
            windowId: computed(() => store.cap?.windowId || -1),
        }
    },
})
</script>

<style lang="scss" module>
.ready {
    padding-top: 10vh;
    :global {
        .el-alert {
            width: 490px;
            margin: 0 auto;
            margin-top: 0px;
            text-align: left;
            margin-top: 15px;
        }
        .content {
            height: 250px;
            .title {
                font-size: 23px;
                margin-bottom: 10px;
            }
        }
    }
}
</style>
