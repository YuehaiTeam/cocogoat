<template>
    <div>
        <div class="titlebar">椰羊·扫描成就并导出到Paimon.moe</div>
        <iframe ref="contentFrame" src="/frames/achievement-scanner" frameborder="0"></iframe>
        <div v-if="finished" class="model-backdrop">
            <div class="model">
                <div class="title">扫描完成</div>
                <div v-if="showFaildImages" class="faildResults">
                    <img v-for="(image, index) in faildResults" :key="index" :src="image" />
                </div>
                <textarea v-else :value="exportToPaiminMoe"></textarea>
                <div class="operations">
                    <span v-if="faildResults.length > 0" @click="showFaildImages = !showFaildImages">{{
                        showFaildImages ? '返回导出结果' : '查看失败项'
                    }}</span>
                    <a v-if="faildResults.length > 0"> | </a>
                    <span class="reset" @click="reset">重新开始</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, computed, defineComponent, watch } from 'vue'
import type { IAScannerData, IAScannerFaild } from './scanner/scanner'

export default defineComponent({
    setup() {
        const showFaildImages = ref(false)
        const finished = ref(false)
        const results = ref([] as (IAScannerData | IAScannerFaild)[])
        const faildResults = computed(() => results.value.filter((item) => !item.success).map((e) => e.images?.main))
        const contentFrame = ref<HTMLIFrameElement | null>(null)
        watch(contentFrame, (v) => {
            if (!v) return
            window.addEventListener('message', (ev: MessageEvent) => {
                const { app, event, data } = ev.data
                if (app !== 'cocogoat.scanner.achievement') return
                console.log(ev)
                if (event === 'ready') {
                    finished.value = false
                    return
                }
                if (event === 'result') {
                    const { result } = JSON.parse(data)
                    results.value = result
                    finished.value = true
                    console.log('got result from scanner')
                }
            })
        })
        const exportToPaiminMoe = computed(() => {
            const exportArray = results.value
                .filter((e) => e.success && (e as IAScannerData).date)
                .map((e) => {
                    const a = (e as IAScannerData).achievement
                    return [a.categoryId, a.id]
                })
            return `/* 
* 复制此处所有内容，
* 在Paimon.moe页面按F12打开调试器，
* 选择控制台(Console)
* 粘贴并回车执行完成导入
*/
const b = ${JSON.stringify(exportArray)};
const a = (await localforage.getItem('achievement')) || {};
b.forEach(c=>{a[c[0]]=a[c[0]]||{};a[c[0]][c[1]]=true})
await localforage.setItem('achievement',a);
location.href='/achievement'`
        })
        const reset = () => {
            contentFrame.value?.contentWindow?.postMessage(
                {
                    app: 'cocogoat.scanner.achievement',
                    event: 'reset',
                },
                '*',
            )
        }
        return {
            finished,
            results,
            exportToPaiminMoe,
            contentFrame,
            reset,
            faildResults,
            showFaildImages,
        }
    },
})
</script>

<style lang="scss" scoped>
.titlebar {
    height: 50px;
    background: #409eff;
    color: #fff;
    line-height: 48px;
    box-sizing: border-box;
    font-size: 18px;
    padding-left: 20px;
}
iframe {
    width: 100vw;
    height: calc(100vh - 55px);
    box-sizing: border-box;
}
.model {
    width: 500px;
    height: 380px;
    max-width: 100%;
    background: #fff;
    border-radius: 10px;
    margin: 0 auto;
    margin-top: calc(30vh - 100px);
    text-align: center;
    padding: 20px;
    box-sizing: border-box;

    .title {
        font-size: 23px;
        margin-bottom: 20px;
    }

    .operations {
        color: #777;
        font-size: 13px;
        margin-top: 15px;
        cursor: pointer;
        user-select: none;
    }

    textarea,
    .faildResults {
        width: 100%;
        height: 260px;
        border-radius: 10px;
        border: 1px solid #ddd;
        font-family: Consolas, monospace;
        padding: 10px;
        box-sizing: border-box;
        display: block;
    }
    .faildResults {
        overflow-y: scroll;
        img {
            max-width: 100%;
            border: 1px solid #ddd;
            border-radius: 5px;
            display: block;
            margin-bottom: 5px;
        }
    }
}

.model-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
}
</style>
