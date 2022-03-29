<template>
    <div :class="$style.intro">
        <el-button class="start-btn start-gray" @click="requestCapture">
            <div class="l">
                <fa-icon icon="video" />
            </div>
            <div class="m">
                <div class="t">开始扫描</div>
                <div class="d">点击开始后请选择原神窗口(如下图)</div>
            </div>
            <div class="r">
                <fa-icon icon="angle-right" />
            </div>
        </el-button>
        <img src="@/assets/openscreenshare.png" alt="请参照图片开始抓屏" />
        <footer-component />
    </div>
</template>

<script lang="ts">
import Footer from '../Common/Footer.vue'
import { defineComponent } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faVideo, faAngleRight } from '@fortawesome/free-solid-svg-icons'
library.add(faVideo, faAngleRight)
import { useArstore } from './state'
import { storeToRefs } from 'pinia'
export default defineComponent({
    components: {
        FooterComponent: Footer,
    },
    setup() {
        const store = useArstore()
        return {
            ...storeToRefs(store),
            requestCapture: () => store.requestCapture(),
        }
    },
})
</script>

<style module lang="scss">
.intro {
    padding-top: 10vh;
    :global {
        img {
            display: block;
            margin: 0 auto;
            margin-top: 30px;
            margin-bottom: 25px;
            width: 490px;
            max-width: 95%;
            border-radius: var(--el-border-radius-base);
            box-sizing: border-box;
            border: 1px solid var(--el-border-color-base);
        }
    }
}
</style>
