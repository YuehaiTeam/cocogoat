<template>
    <div :class="$style.statusInner" @click="step === 4 && (step = 5)">
        <div class="inline-status">
            <float-content
                :in-float="false"
                :capture="false"
                :state="1"
                :success="resT.length"
                :fail="resF.length"
                :scanned="scanned"
                :duplicate="duplicates"
            />
        </div>
        <div v-if="step === 4" class="no-box">
            {{ windowId > 0 ? '自动切换进行中' : '请手动切换圣遗物，并点这里停止' }}
        </div>
        <div v-if="step > 4" class="pbar">
            <div class="pbar-bar" :class="{ finish: step === 6 }">
                <div
                    class="pbar-bar-in"
                    :style="{ width: `${((resT.length + resF.length + duplicates) / scanned) * 100}%` }"
                ></div>
                <div v-if="step === 6" class="pbar-bar-text">完成</div>
            </div>
            <div v-if="step === 6" class="restart" @click="reset">重新开始</div>
        </div>
    </div>
</template>

<script lang="ts">
import { useArstore } from './state'
import { computed, toRef, defineComponent } from 'vue'
import FloatContent from '@/views/AchievementScanner/CaptureScanner/FloatContent.vue'
export default defineComponent({
    components: {
        FloatContent,
    },
    setup() {
        const arstore = useArstore()
        return {
            step: toRef(arstore, 'step'),
            resT: toRef(arstore, 'resT'),
            resF: toRef(arstore, 'resF'),
            scanned: toRef(arstore, 'scanned'),
            duplicates: toRef(arstore, 'duplicates'),
            capKey: toRef(arstore, 'capKey'),
            windowId: computed(() => arstore.cap?.windowId || -1),
            reset: () => arstore.$reset(),
        }
    },
})
</script>

<style lang="scss" module>
.status-inner {
    width: 100%;
    text-align: center;
    padding-bottom: 15px;
    position: absolute;
    top: 35vh;
    left: 0;
    right: 0;
    :global {
        .no-box {
            color: #409eff;
            margin-top: -23px;
            position: relative;
            z-index: 2;
            cursor: pointer;
            small {
                font-size: 13px;
                text-decoration: underline;
            }
            transform: translateY(0);
            -moz-transform: translateY(20px);
        }
        .inline-status {
            width: 180px;
            height: 70px;
            zoom: 1.5;
            transform: scale(1);
            -moz-transform: scale(1.5);
            position: relative;
            user-select: none;
            margin: 0 auto;
            .icon {
                display: none;
            }
            .text {
                left: 0;
                .desc {
                    display: none;
                }
            }
        }
        .pbar {
            width: 230px;
            margin: 0 auto;
            margin-top: -15px;
            z-index: 2;
            position: relative;
            transform: translateY(0);
            -moz-transform: translateY(20px);
            .pbar-bar {
                width: 230px;
                height: 30px;
                border: 1px solid #409eff;
                border-radius: 20px;
                position: relative;
                &.finish {
                    cursor: pointer;
                    transition: all 0.3s;
                    &:hover {
                        opacity: 0.8;
                    }
                }
            }
            .pbar-bar-in {
                height: 100%;
                background: #409eff;
                border-radius: 20px;
                transition: all 0.1s;
            }
            .pbar-bar-text {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                color: #fff;
                line-height: 30px;
                font-size: 14px;
            }
            .restart {
                color: #888;
                font-size: 13px;
                margin-top: 10px;
                cursor: pointer;
                &:hover {
                    color: #666;
                }
            }
        }
    }
}
</style>
