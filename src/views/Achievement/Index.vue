<template>
    <Layout full-height style="background: #eee">
        <template #title>
            <div class="teleport-title">
                <span style="font-family: genshin">
                    椰羊 · 成就 <small :class="$style.totalPercent">{{ totalFin }} / {{ totalCount }}</small>
                </span>
            </div>
        </template>
        <template #actions>
            <div class="actions">
                <el-popover v-model:visible="showClear" :width="190" placement="bottom" append-to-body>
                    <center>真的要清空吗？</center>
                    <div style="text-align: center; margin: 0; margin-top: 15px">
                        <el-link style="margin-right: 15px" @click="showClear = false">取消</el-link>
                        <el-link type="danger" style="margin-right: 15px" @click="doClear(false)">清空当前</el-link>
                        <el-button size="small" type="danger" plain @click="doClear(true)">清空全部</el-button>
                    </div>
                    <template #reference>
                        <el-button v-show="!showScanner" type="danger" plain @click="showClear = true">
                            <fa-icon icon="trash-can" />
                            清空
                        </el-button>
                    </template>
                </el-popover>
                <el-button v-show="!showScanner" class="import-button" @click="showImport = !showImport">
                    导入
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
        <el-dialog v-model="showImport" title="导入" :custom-class="$style.importDialog" destroy-on-close>
            <import-dialog @close="showImport = false" />
        </el-dialog>
        <el-dialog
            v-model="scannerResult.show"
            title="扫描结束"
            :custom-class="$style.scannerResultDialog"
            destroy-on-close
        >
            以下为失败和识别到的未完成成就列表，您可以自行检查确认后手动添加。
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
                    <template #before>
                        <div class="page-before">
                            <el-button class="status-switch" @click="sortByStatus = !sortByStatus">
                                未完成优先：{{ sortByStatus ? '开' : '关' }}
                            </el-button>
                            <el-input v-model="search" class="search-box" placeholder="搜索成就">
                                <template #suffix>
                                    <span class="fa-icon">
                                        <fa-icon icon="search" />
                                    </span>
                                </template>
                            </el-input>
                        </div>
                    </template>
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
import { ref, defineComponent, computed, watch, onMounted } from 'vue'

import {
    faCrosshairs,
    faArrowUpFromBracket,
    faCheck,
    faTrashCan,
    faEllipsis,
    faSearch,
} from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
library.add(faCrosshairs, faArrowUpFromBracket, faCheck, faTrashCan, faEllipsis, faSearch)
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
import ImportDialog from './ImportDialog.vue'
import { uniqBy } from 'lodash'

export default defineComponent({
    name: 'ArtifactIndex',
    components: {
        IconCocogoat,
        AchievementItem,
        AchievementSidebar,
        ImportDialog,
        DynamicScroller,
        DynamicScrollerItem,
    },
    setup() {
        const selectedIds = ref<string[]>([])
        const showScanner = ref(false)
        const search = ref('')
        const router = useRouter()
        const frameSrc = router.resolve({ name: 'frames.achievement.scan' }).href
        const achievementFin = ref({} as Record<number, IAchievementStore>)
        const achievementFinCount = ref({} as Record<number, number>)
        const sortByStatus = ref(true)
        const totalCount = ref(0)
        const totalFin = ref(0)
        const calcFin = () => {
            const newCount = {} as Record<number, number>
            const newFin = {} as Record<number, IAchievementStore>
            let totalFin_ = 0
            store.value.achievements.forEach((e) => {
                e.categoryId = e.categoryId || 0
                if (e.id) {
                    newFin[e.id] = e
                    newCount[e.categoryId] = newCount[e.categoryId] || 0
                    newCount[e.categoryId]++
                    totalFin_++
                }
            })
            achievementFinCount.value = newCount
            achievementFin.value = newFin
            totalCount.value =
                totalCount.value || i18n.value.achievements.reduce((a, b) => a + b.achievements.length, 0)
            totalFin.value = totalFin_
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
            let data = currentCat.value.achievements.concat([])
            if (sortByStatus.value)
                data = data.sort((a, b) => {
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
            if (search.value.trim()) {
                data = data.filter((e) => {
                    const hasThis = e.name.toLowerCase().includes(search.value.toLowerCase())
                    let hasPre = false
                    let k = e
                    while (k.preStage) {
                        const q = currentCat.value.achievements.find((i) => i.id === k.preStage)
                        k = q || k
                        if (k.name.toLowerCase().includes(search.value.toLowerCase())) {
                            hasPre = true
                            break
                        }
                    }
                    let hasPost = false
                    k = e
                    while (k.postStage) {
                        const q = currentCat.value.achievements.find((i) => i.id === k.postStage)
                        k = q || k
                        if (k.name.toLowerCase().includes(search.value.toLowerCase())) {
                            hasPost = true
                            break
                        }
                    }
                    return hasThis || hasPre || hasPost
                })
            }
            return data
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
        const showClear = ref(false)
        const doClear = async (all: boolean) => {
            if (all) {
                store.value.achievements = []
            } else {
                store.value.achievements = store.value.achievements.filter(
                    (i) => i.categoryId !== (currentCat.value.originalId || 0),
                )
            }
            showClear.value = false
        }
        const scannerFrame = ref<HTMLIFrameElement | null>(null)
        const scannerResult = ref({ show: false, faildImages: [] as string[] })
        useScannerFrame({
            scannerFrame,
            results: scannerResult,
            achievementFin,
            showScanner,
        })
        const showImport = ref(false)
        onMounted(() => {
            // dedupe
            const dedupedResult = uniqBy(store.value.achievements, (e) => e.id)
            if (dedupedResult.length !== store.value.achievements.length) {
                console.log('deduped from ' + store.value.achievements.length + ' to ' + dedupedResult.length)
                store.value.achievements = dedupedResult
            }
        })
        return {
            store,
            search,
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
            showClear,
            scannerFrame,
            scannerResult,
            CustomElScrollVue,
            ...useExportAchievements(),
            showImport,
            sortByStatus,
            totalCount,
            totalFin,
        }
    },
})
</script>
<style lang="scss" module>
.total-percent {
    color: #999;
    font-size: 14px;
    padding-left: 5px;
}
.import-dialog {
    width: 500px !important;
    max-width: 90%;
}
.export-dialog {
    width: 500px !important;
    max-width: 90%;
    textarea {
        font-size: 12px;
        height: 350px;
        font-family: Consolas, monospace;
    }
}
.scanner-result-dialog {
    width: 600px !important;
    max-width: 90%;
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
            overflow-x: hidden;
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
            .page-before {
                padding-top: 15px;
                .status-switch {
                    float: left;
                    width: 130px;
                    box-sizing: border-box;
                }

                .search-box {
                    width: calc(100% - 130px);
                    float: right;
                }
            }
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
