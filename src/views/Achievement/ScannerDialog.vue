<template>
    <div v-if="showScanner" :class="$style.scannerArea">
        <iframe ref="scannerFrame" class="scanner-frame" :src="frameSrc"></iframe>
        <div class="scanner-back">
            <div class="scanner-box">
                <div class="scanner-title">成就识别</div>
            </div>
        </div>
    </div>
    <el-dialog
        v-model="scannerResult.show"
        :title="`成功扫描 ${scannerResult.length} 个成就`"
        :class="$style.scannerResultDialog"
        destroy-on-close
    >
        以下为失败和识别到的未完成成就列表，您可以自行检查确认后手动添加。
        <div class="faildResults">
            <div v-for="(image, index) in scannerResult.faildImages" :key="index">
                <img :src="image.image" />
                <div class="badge" :class="{ success: image.data.success }">
                    {{ image.data.success ? '未完' : '错误' }}
                </div>
            </div>
        </div>
        <el-button class="feedback-btn" @click="sendOops"> 反馈失败记录 </el-button>
    </el-dialog>
</template>
<script lang="ts">
import { getUrl } from '@/router'
import { useScannerFrame } from './scannerFrame'
import { defineComponent, computed, ref, Ref } from 'vue'
import { IAScannerData } from '../AchievementScanner/scanner/scanner'
export default defineComponent({
    props: {
        showScanner: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:showScanner'],
    setup(props, { emit }) {
        const frameSrc = getUrl('frames.achievement.scan')
        const scannerFrame = ref<HTMLIFrameElement | null>(null)
        const scannerResult = ref({
            show: false,
            length: 0,
            faildImages: [] as { image: string; data: IAScannerData }[],
        })
        const showScanner = computed({
            get() {
                return props.showScanner
            },
            set(value) {
                emit('update:showScanner', value)
            },
        })
        const { sendOops } = useScannerFrame({
            scannerFrame: scannerFrame as Ref<HTMLIFrameElement | null>,
            results: scannerResult,
            showScanner,
        })
        return {
            frameSrc,
            sendOops,
            scannerFrame,
            scannerResult,
        }
    },
})
</script>
<style lang="scss" module>
.scanner-result-dialog {
    width: 600px !important;
    max-width: 90%;
    :global {
        .feedback-btn {
            position: absolute;
            top: 12px;
            right: 50px;
        }
        .faildResults {
            margin-top: 20px;
            width: 100%;
            height: 300px;
            border: 1px solid #ddd;
            padding: 10px;
            box-sizing: border-box;
            display: block;
            overflow-y: scroll;
            overflow-x: hidden;
            & > div {
                width: 100%;
                border: 1px solid #ddd;
                border-radius: 5px;
                display: block;
                margin-bottom: 5px;
                position: relative;
                overflow: hidden;
            }
            img {
                width: 100%;
                height: 100%;
                display: block;
            }
            .badge {
                position: absolute;
                top: 0;
                left: 0;
                font-size: 12px;
                padding: 3px 5px;
                border: aliceblue;
                background: #fe6565;
                color: #fff;
                border-bottom-right-radius: 5px;
            }
            .badge.success {
                background: var(--c-theme);
                color: var(--c-white);
            }
        }
    }
}

.scanner-area {
    position: absolute;
    top: 50px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    overflow: hidden;
    z-index: 900;
    :global {
        .scanner-frame {
            width: 100%;
            height: 100%;
            border: 0;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 2;
        }
        .scanner-back {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            .scanner-box {
                max-width: 100%;
                width: 600px;
                height: 650px;
                background: var(--c-white);
                border-radius: 5px;
                margin: 0 auto;
                margin-top: calc(10vh - 60px);
                .scanner-title {
                    height: 40px;
                    line-height: 40px;
                    font-size: 20px;
                    padding-left: 20px;
                    padding-top: 10px;
                }
            }
        }
    }
}
:global(.pc) .scanner-area {
    left: 80px;
}
:global(.m) .scanner-area {
    bottom: 50px;
    :global {
        .scanner-box {
            margin-top: 0;
            height: 100%;
            border-radius: 0;
        }
    }
}
</style>
