<template>
    <div :class="$style.ready">
        <div class="content">
            <div class="title">还差最后一步</div>
            <div class="desc">
                请手动切换到背包的圣遗物界面，然后点击下面按钮继续
                <br />
                如果没有看到悬浮窗，请点击页面空白处
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
import { defineComponent, toRef } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faToggleOn } from '@fortawesome/free-solid-svg-icons'
library.add(faToggleOn)

export default defineComponent({
    setup() {
        const store = useArstore()
        return {
            step: toRef(store, 'step'),
            windowId: toRef(store, 'windowId'),
        }
    },
})
</script>

<style lang="scss" module>
.ready {
    padding-top: 10vh;
    :global {
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
