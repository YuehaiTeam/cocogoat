<template>
    <Layout full-height>
        <template #title>
            <span style="font-family: genshin">椰羊 · </span> 扫描成就并导出到{{
                to === 'seelie' ? 'Seelie' : 'Paimon.moe'
            }}
        </template>
        <template #actions>
            <el-tooltip content="扫描完成之后也还可以切换哦">
                <el-button
                    class="switch"
                    type="primary"
                    plain
                    @click="
                        $router.replace({
                            ...$route,
                            query: {
                                ...$route.query,
                                to: to === 'seelie' ? 'paimon-moe' : 'seelie',
                            },
                        })
                    "
                >
                    切换到{{ to === 'seelie' ? 'Paimon.moe' : 'Seelie' }}
                </el-button>
            </el-tooltip>
        </template>
        <iframe ref="contentFrame" :class="$style.fr" :src="frameUrl" frameborder="0"></iframe>
        <div v-if="finished" :class="$style.modelBackdrop">
            <div class="model">
                <div class="title">扫描完成</div>
                <div v-if="showFaildImages" class="faildResults">
                    <img v-for="(image, index) in faildResults" :key="index" :src="image" />
                </div>
                <textarea v-else :value="to === 'seelie' ? exportToSeelie : exportToPaiminMoe"></textarea>
                <div class="operations">
                    <span v-if="faildResults.length > 0" @click="showFaildImages = !showFaildImages">{{
                        showFaildImages ? '返回导出结果' : '查看失败项'
                    }}</span>
                    <a v-if="faildResults.length > 0"> | </a>
                    <span
                        class="switch"
                        @click="
                            $router.replace({
                                ...$route,
                                query: {
                                    ...$route.query,
                                    to: to === 'seelie' ? 'paimon-moe' : 'seelie',
                                },
                            })
                        "
                        >切换到{{ to === 'seelie' ? 'Paimon.moe' : 'Seelie' }}</span
                    >
                    <a> | </a>
                    <span class="reset" @click="reset">重新开始</span>
                </div>
            </div>
        </div>
    </Layout>
</template>

<script lang="ts">
import { ref, computed, defineComponent, watch } from 'vue'
import type { IAScannerData, IAScannerFaild } from './scanner/scanner'
import { useRoute } from 'vue-router'
import _achievementMap from '@genshin-data/chinese-simplified/achievements.json'
import { getUrl } from '@/router'

export default defineComponent({
    setup() {
        const frameUrl = getUrl('frames.achievement.scan')
        const showFaildImages = ref(false)
        const finished = ref(false)
        const results = ref([] as (IAScannerData | IAScannerFaild)[])
        const faildResults = computed(() => results.value.filter((item) => !item.success).map((e) => e.images?.main))
        const contentFrame = ref<HTMLIFrameElement | null>(null)

        const route = useRoute()
        const to = computed(() => {
            return route.query.to === 'seelie' ? 'seelie' : 'paimon-moe'
        })
        watch(contentFrame, (v) => {
            if (!v) return
            window.addEventListener('message', (ev: MessageEvent) => {
                const { app, event, data } = ev.data
                if (app !== 'cocogoat.scanner.achievement') return
                console.log(event, data)
                if (event === 'ready') {
                    finished.value = false
                    return
                }
                if (event === 'result') {
                    const { result } = data
                    for (const e of result as IAScannerData[]) {
                        if (!e.success) continue
                        if (e.achievement.preStage && e.achievement.preStage > 0) {
                            const cat = _achievementMap.find((x) => (x.originalId || 0) === e.achievement.categoryId)
                            if (cat) {
                                let preStage = cat.achievements.find((x) => x.id === e.achievement.preStage)
                                if (preStage) {
                                    const p = {
                                        ...e,
                                        success: true,
                                        date: '后续已完成',
                                    }
                                    result.push({
                                        ...p,
                                        achievement: {
                                            ...preStage,
                                            categoryId: e.achievement.categoryId,
                                        },
                                    })
                                }
                            }
                        }
                    }
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
        const exportToSeelie = computed(() => {
            const exportArray = results.value
                .filter((e) => e.success && (e as IAScannerData).date)
                .map((e) => {
                    const g = e as IAScannerData
                    const a = g.achievement
                    return [a.id, (g.status + ' ' + g.date).trim()]
                })
            return `/* 
* 复制此处所有内容，
* 在Seelie.me页面按F12打开调试器，
* 选择控制台(Console)
* 粘贴并回车执行完成导入
*/
const z = ${JSON.stringify(exportArray)};
const a = localStorage.account || 'main'
const b = JSON.parse(localStorage.getItem(\`\${a}-achievements\`)||'{}')
z.forEach(c=>{b[c[0]]={done:true,notes:c[1]}})
localStorage.setItem(\`\${a}-achievements\`,JSON.stringify(b))
localStorage.last_update = (new Date()).toISOString()
location.href='/achievements'`
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
            exportToSeelie,
            contentFrame,
            reset,
            faildResults,
            showFaildImages,
            to,
            frameUrl,
        }
    },
})
</script>

<style lang="scss" module>
.fr {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}

.model-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    :global {
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
    }
}
</style>
