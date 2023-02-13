<template>
    <div :class="$style.ready">
        <div class="content">
            <div class="title">还差最后一步</div>
            <div class="desc">
                请手动切换到成就列表界面，然后点击下面按钮继续
                <br />
                <div v-if="hasPictureInPicture">如果没有看到悬浮窗，请点击页面空白处</div>
                <div v-else-if="windowId > 0">
                    <el-alert
                        title="当前浏览器不支持悬浮窗"
                        description="如需中断扫描，请按 Win 键"
                        type="warning"
                        show-icon
                    />
                </div>
                <div v-else>
                    <el-alert
                        title="当前浏览器不支持悬浮窗"
                        description="完成翻页后，请点击“停止共享屏幕”按钮或手动回到本窗口点击停止扫描"
                        type="warning"
                        show-icon
                    />
                </div>
            </div>
        </div>
        <el-button class="start-btn start-gray" @click="$emit('done')">
            <div class="l">
                <fa-icon icon="toggle-on" />
            </div>
            <div class="m">
                <div class="t">我已打开成就列表界面</div>
                <div v-if="windowId > 0" class="d">将自动切换到原神窗口并开始翻页</div>
                <div v-else class="d">点击后请回到原神窗口并手动匀速滚动页面</div>
            </div>
            <div class="r">
                <fa-icon icon="angle-right" />
            </div>
        </el-button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faToggleOn } from '@fortawesome/free-solid-svg-icons'
import { hasPictureInPicture } from '@/utils/compatibility'
library.add(faToggleOn)

export default defineComponent({
    props: {
        windowId: {
            type: Number,
            default: 0,
        },
    },
    emits: ['done'],
    setup() {
        return {
            hasPictureInPicture,
        }
    },
})
</script>

<style lang="scss" module>
.ready {
    padding-top: 10vh;
    text-align: center;
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
        .start-btn {
            margin-top: 10px;
            height: 60px;
            text-align: left;
            font-size: 16px;
            transition: all 0.3s;
            width: 490px;
            max-width: 95%;
            box-sizing: border-box;
            &:hover {
                transform: translateY(-5px);
            }
            &.start-gray {
                --el-button-hover-text-color: #333;
                --el-button-hover-border-color: #aaa;
                --el-button-hover-bg-color: #fafafa;
            }
            & > span {
                display: flex;
                width: 100%;
                height: 100%;
                justify-content: flex-start;
            }

            .r {
                opacity: 0.8;
            }

            .m {
                flex-grow: 1;
            }

            .l svg {
                width: 40px;
                height: 24px;
                padding-right: 10px;
            }

            .d {
                font-size: 12px;
                margin-top: 3px;
                opacity: 0.8;
            }
        }
    }
}
</style>
