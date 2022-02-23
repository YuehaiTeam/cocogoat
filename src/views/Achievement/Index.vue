<template>
    <Layout full-height style="background: #eee">
        <template #title>
            <div class="teleport-title">
                <span style="font-family: genshin">椰羊 · 成就</span>
            </div>
        </template>
        <template #actions>
            <div class="actions">
                <el-button
                    v-show="!showScanner"
                    class="import-button"
                    type="danger"
                    size="default"
                    plain
                    @click="doClear"
                >
                    <fa-icon icon="trash-can" />
                    清空
                </el-button>
                <div v-show="!showScanner" class="dropdown">
                    <el-dropdown class="header-plain-dropdown" split-button @click="doExport('')">
                        导出
                        <template #dropdown>
                            <el-dropdown-menu class="el-dropdown-menu--small">
                                <el-dropdown-item disabled class="export-title"> Paimon.moe </el-dropdown-item>
                                <el-dropdown-item @click="doExport('paimon')">代码</el-dropdown-item>
                                <el-dropdown-item divided disabled class="export-title"> Seelie.me </el-dropdown-item>
                                <el-dropdown-item @click="doExport('seelie')">代码</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
                <el-button
                    size="default"
                    type="primary"
                    :plain="!showScanner"
                    style="margin-left: 10px"
                    @click="showScanner = !showScanner"
                >
                    <fa-icon icon="crosshairs" /> {{ showScanner ? '退出' : '' }}识别
                </el-button>
            </div>
        </template>
        <div v-if="showScanner" :class="$style.scannerArea">
            <iframe ref="scannerFrame" class="scanner-frame" :src="frameSrc"></iframe>
            <div class="scanner-back">
                <div class="scanner-box">
                    <div class="scanner-title">成就识别</div>
                </div>
            </div>
        </div>
        <el-dialog
            v-model="exportData.show"
            :title="exportData.title"
            :custom-class="$style.exportDialog"
            destroy-on-close
        >
            <el-input type="textarea" :model-value="exportData.content"></el-input>
        </el-dialog>
        <el-dialog
            v-model="scannerResult.show"
            title="扫描结束"
            :custom-class="$style.scannerResultDialog"
            destroy-on-close
        >
            以下为失败列表，您可以自行检查后添加。
            <div class="faildResults">
                <img v-for="(image, index) in scannerResult.faildImages" :key="index" :src="image" />
            </div>
        </el-dialog>
        <section :class="$style.achievementView">
            <div class="progress">
                <div
                    class="progress-in"
                    :style="{
                        width:
                            ((achievementFinCount[currentCat.originalId || 0] || 0) / currentCat.achievements.length) *
                                100 +
                            '%',
                    }"
                ></div>
            </div>
            <achievement-sidebar :achievementCat="achievementCat" :achievementFinCount="achievementFinCount" />
            <article>
                <DynamicScroller
                    :items="currentAch"
                    :min-item-size="80"
                    :custom-scrollbar="CustomElScrollVue"
                    class="scroller"
                >
                    <template v-slot="{ item: i, active }">
                        <DynamicScrollerItem :item="i" :active="active" :size-dependencies="[i.preStage, i.postStage]">
                            <achievement-item
                                :i="i"
                                :fin="achievementFin[i.id]"
                                :preFin="achievementFin[i.preStage]"
                                @check="updateFinished(i.id)"
                                @input-date="achievementFin[i.id].date = $event"
                                @input-status="achievementFin[i.id].status = $event"
                            />
                        </DynamicScrollerItem>
                    </template>
                    <template #after>
                        <div class="page-after">
                            <el-divider>
                                <icon-cocogoat />
                            </el-divider>
                        </div>
                    </template>
                </DynamicScroller>
            </article>
        </section>
    </Layout>
</template>

<script lang="ts">
import '@/styles/actions.scss'
import { useRoute, useRouter } from 'vue-router'
import { ref, defineComponent, computed, watch } from 'vue'

import { faCrosshairs, faArrowUpFromBracket, faCheck, faTrashCan, faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
library.add(faCrosshairs, faArrowUpFromBracket, faCheck, faTrashCan, faEllipsis)
import IconCocogoat from '@/components/Icons/cocogoat.vue'

import { i18n } from '@/i18n'
import { store } from '@/store'
import { Achievement, IAchievementStore } from '@/typings/Achievement'
import { ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import CustomElScrollVue from '@/components/ElCustomScroll.vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller/src/index'

import { useScannerFrame } from './scannerFrame'
import { useExportAchievements } from './useExport'

import AchievementItem from './AchivementItem.vue'
import AchievementSidebar from './AchievementSidebar.vue'

export default defineComponent({
    name: 'ArtifactIndex',
    components: {
        IconCocogoat,
        AchievementItem,
        AchievementSidebar,
        DynamicScroller,
        DynamicScrollerItem,
    },
    setup() {
        const selectedIds = ref<string[]>([])
        const showScanner = ref(false)
        const router = useRouter()
        const frameSrc = router.resolve({ name: 'frames.achievement.scan' }).href
        const achievementFin = ref({} as Record<number, IAchievementStore>)
        const achievementFinCount = ref({} as Record<number, number>)
        const calcFin = () => {
            const newCount = {} as Record<number, number>
            const newFin = {} as Record<number, IAchievementStore>
            store.value.achievements.forEach((e) => {
                e.categoryId = e.categoryId || 0
                if (e.id) {
                    newFin[e.id] = e
                    newCount[e.categoryId] = newCount[e.categoryId] || 0
                    newCount[e.categoryId]++
                }
            })
            achievementFinCount.value = newCount
            achievementFin.value = newFin
        }
        watch(store, calcFin, { deep: true, immediate: true })
        const achievementCat = computed(() => {
            const ach = i18n.value.achievements.concat([]).sort((a, b) => a.order - b.order)
            return ach
        })
        const route = useRoute()
        const currentCatId = computed(() => {
            return route.params.cat || 'wonders_of_the_world'
        })
        const currentCat = computed(() => {
            return achievementCat.value.find((i) => i.id === currentCatId.value) || achievementCat.value[0]
        })
        const currentAch = computed(() => {
            return currentCat.value.achievements.concat([]).sort((a, b) => {
                let ret = 0
                let fa = achievementFin.value[a.id]
                let fb = achievementFin.value[b.id]
                if (a.postStage) {
                    let p = a
                    while (p.postStage) {
                        const q = currentCat.value.achievements.find((e) => e.id === p.postStage)
                        p = q || p
                    }
                    fa = achievementFin.value[p.id]
                }
                if (b.postStage) {
                    let p = b
                    while (p.postStage) {
                        const q = currentCat.value.achievements.find((e) => e.id === p.postStage)
                        p = q || p
                    }
                    fb = achievementFin.value[p.id]
                }
                if (a.preStage === b.id) return 1
                if (fa && !fb) return 1
                if (!fa && fb) return -1
                return ret
            })
        })
        const updateFinished = (id: number) => {
            if (achievementFin.value[id]) {
                const ids = [id]
                let ach: Achievement | undefined
                while ((ach = currentAch.value.find((e) => e.id === ids[0])) && ach.postStage) {
                    ids.unshift(ach.postStage)
                }
                store.value.achievements = store.value.achievements.filter((i) => !ids.includes(i.id))
                return
            }
            const finishedData = {
                id,
                status: '手动勾选',
                categoryId: currentCat.value.originalId || 0,
                date: dayjs().format('YYYY/MM/DD'),
            } as IAchievementStore
            store.value.achievements.push(finishedData)
        }
        const doClear = async () => {
            try {
                await ElMessageBox.confirm('真的要清空吗？', '提示')
            } catch (e) {
                return
            }
            store.value.achievements = []
        }
        const scannerFrame = ref<HTMLIFrameElement | null>(null)
        const scannerResult = ref({ show: false, faildImages: [] as string[] })
        useScannerFrame({
            scannerFrame,
            results: scannerResult,
            achievementFin,
            showScanner,
        })
        return {
            store,
            showScanner,
            selectedIds,
            frameSrc,
            achievementCat,
            currentCatId,
            currentCat,
            achievementFin,
            achievementFinCount,
            currentAch,
            updateFinished,
            doClear,
            scannerFrame,
            scannerResult,
            CustomElScrollVue,
            ...useExportAchievements(),
        }
    },
})
</script>
<style lang="scss" module>
.export-dialog {
    width: 500px !important;
    max-width: 90%;
    textarea {
        font-size: 12px;
        height: 350px;
        font-family: Consolas, monospace;
    }
    :global {
        .faildResults {
            margin-top: 20px;
            width: 100%;
            height: 300px;
            border: 1px solid #ddd;
            padding: 10px;
            box-sizing: border-box;
            display: block;
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
.scanner-result-dialog {
    width: 600px !important;
    max-width: 90%;
}
.achievement-view {
    position: relative;
    min-height: 100%;
    :global {
        .progress {
            height: 3px;
            position: absolute;
            top: 0;
            left: 235px;
            right: 0;
            z-index: 99;
            .progress-in {
                height: 100%;
                background: #409eff;
                transition: all 0.3s;
            }
        }
        article {
            left: 235px;
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            .page-after {
                .el-divider {
                    border-color: #ccc;
                    margin: 40px 0;
                    .el-divider__text {
                        background: #eee;
                    }
                    svg {
                        fill: #aaa;
                        width: 50px;
                        height: 50px;
                        margin: -8px auto;
                        display: block;
                    }
                }
            }

            .scroller {
                height: 100%;
                padding: 0 20px;
                box-sizing: border-box;
            }
        }
    }
}
:global(.m) .achievement-view {
    :global {
        .progress {
            left: 0;
        }

        article {
            top: 55px;
            left: 0;
        }

        .scroller {
            padding: 0 5px;
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
                background: #fff;
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
