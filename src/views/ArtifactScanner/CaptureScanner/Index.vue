<template>
    <div>
        <Loader v-if="(load = false)" @done="load = true" />
        <div v-else :class="$style.scannerUi">
            <c-intro v-if="step === 1" />
            <c-client v-else-if="step === 2" />
            <c-ready v-else-if="step === 3" />
            <c-progress v-else />
            <video ref="video" style="display: none" />
        </div>
    </div>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia'
import { ref, defineComponent } from 'vue'
import { useArstore } from './state'
import Loader from '../Common/Loader.vue'
import CIntro from './Intro.vue'
import CClient from './Client.vue'
import CReady from './Ready.vue'
import CProgress from './Progress.vue'
export default defineComponent({
    components: {
        Loader,
        CIntro,
        CClient,
        CReady,
        CProgress,
    },
    setup() {
        const load = ref(false)
        const arstore = useArstore()
        arstore.$reset()
        return {
            load,
            ...storeToRefs(arstore),
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
