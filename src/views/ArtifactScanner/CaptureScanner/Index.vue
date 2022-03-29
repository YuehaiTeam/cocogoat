<template>
    <div>
        <Loader v-if="load === false" @done="load = true" />
        <div v-else :class="$style.scannerUi">
            <c-ready v-if="step === 3" />
            <c-progress v-else-if="step > 3" />
            <web-capturer
                :key="capKey"
                ref="cap"
                :popup="step > 2 && step < 5"
                @exit="step > 3 ? (step = 5) : reset()"
                @ready="step = 3"
            >
                <float-content-b
                    :state="step === 4 ? 1 : 0"
                    :success="resT.length"
                    :fail="resF.length"
                    :scanned="scanned"
                    :duplicate="duplicates"
                    :webControlEnabled="windowId > 0 ? 1 : undefined"
                />
            </web-capturer>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, computed, toRef, defineComponent } from 'vue'
import { useArstore } from './state'
import Loader from '../Common/Loader.vue'
import CReady from './Ready.vue'
import CProgress from './Progress.vue'
import FloatContentB from './Float.vue'
import WebCapturer from '@/components/Capturer/WebCapturer/Index.vue'
export default defineComponent({
    components: {
        Loader,
        CReady,
        CProgress,
        FloatContentB,
        WebCapturer,
    },
    setup() {
        const load = ref(false)
        const arstore = useArstore()
        arstore.$reset()
        return {
            load,
            step: toRef(arstore, 'step'),
            resT: toRef(arstore, 'resT'),
            resF: toRef(arstore, 'resF'),
            scanned: toRef(arstore, 'scanned'),
            duplicates: toRef(arstore, 'duplicates'),
            capKey: toRef(arstore, 'capKey'),
            cap: toRef(arstore, 'cap'),
            windowId: computed(() => arstore.cap?.windowId || -1),
            reset: () => arstore.$reset(),
        }
    },
})
</script>
<style lang="scss" module>
.scanner-ui {
    text-align: center;
    :global {
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
