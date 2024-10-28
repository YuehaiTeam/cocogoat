<template>
    <Layout full-height style="background: var(--c-background)">
        <template #title>
            <div class="teleport-title">
                <span style="font-family: genshin">
                    成就
                    <el-tooltip placement="bottom">
                        <template #content>
                            <div style="text-align: center">
                                剩余 {{ totalCount - totalFin.count }} 个成就 <br />
                                可获取 {{ totalReward - totalFin.reward }} 原石
                            </div>
                        </template>
                        <small :class="$style.totalPercent">
                            <div class="count">{{ totalFin.count }} / {{ totalCount }}</div>
                            <div class="reward">
                                {{ totalFin.reward }} / {{ totalReward }}
                                <img :src="img('yuanshi')" alt="原石" />
                            </div>
                        </small>
                    </el-tooltip>
                </span>
            </div>
        </template>
        <template #actions>
            <div class="actions">
                <div class="a-line">
                    <el-popover
                        v-model:visible="showClear"
                        width="auto"
                        trigger="click"
                        :placement="isMobile ? 'left-start' : 'bottom'"
                    >
                        <div style="text-align: center">真的要清空吗？</div>
                        <div style="text-align: center; margin: 0; margin-top: 15px">
                            <el-link style="margin-right: 15px" @click="showClear = false">取消</el-link>
                            <el-link type="danger" style="margin-right: 15px" @click="doClear(false)">清空当前</el-link>
                            <el-button size="small" type="danger" plain @click="doClear(true)">清空全部</el-button>
                        </div>
                        <template #reference>
                            <el-button v-show="!showScanner" type="danger" plain>
                                <fa-icon icon="trash-can" />
                                清空
                            </el-button>
                        </template>
                    </el-popover>
                </div>
                <div class="a-line">
                    <el-button v-show="!showScanner" class="import-button" @click="showImport = !showImport">
                        导入
                    </el-button>
                    <div v-show="!showScanner" class="dropdown">
                        <export-dropdown />
                    </div>
                </div>
                <div class="a-line">
                    <div v-if="isWindows && !showScanner" class="dropdown">
                        <el-dropdown class="header-export-dropdown" split-button @click="showScanner = !showScanner">
                            <fa-icon icon="crosshairs" /> {{ showScanner ? '退出' : '' }}识别
                            <template #dropdown>
                                <el-dropdown-menu class="el-dropdown-menu--small">
                                    <el-dropdown-item disabled>第三方工具</el-dropdown-item>
                                    <el-dropdown-item>
                                        <el-link
                                            href="https://github.com/HolographicHat/YaeAchievement"
                                            target="_blank"
                                            style="font-size: 12px"
                                            :underline="false"
                                        >
                                            YaeAchievement
                                        </el-link>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                    <el-button
                        v-else
                        size="default"
                        type="primary"
                        :plain="!showScanner"
                        @click="showScanner = !showScanner"
                    >
                        <fa-icon icon="crosshairs" /> {{ showScanner ? '退出' : '' }}识别
                    </el-button>
                </div>
            </div>
        </template>
        <scanner-dialog v-model:showScanner="showScanner" />
        <el-dialog v-model="showImport" title="导入" :class="$style.importDialog" destroy-on-close>
            <import-dialog :memo-id="autoImportId" @close="closeImport" />
        </el-dialog>
        <achievement-detail :achievement="detail" @close="detail = undefined" />
        <section :class="$style.achievementView">
            <div class="progress">
                <div
                    class="progress-in"
                    :style="{
                        width:
                            ((achievementFinStat[currentCat.id || 0]?.count || 0) / currentCat.achievements.length) *
                                100 +
                            '%',
                    }"
                ></div>
            </div>
            <achievement-sidebar
                :totalFin="totalFin"
                :achievementCat="allAchievementCat"
                :achievementFinStat="achievementFinStat"
                :hideFinished="hideFinished"
            />
            <article>
                <DynamicScroller
                    ref="scroll"
                    class="scroller"
                    :emit-update="searchTo"
                    :items="currentAch"
                    :min-item-size="80"
                    :custom-scrollbar="CustomElScrollVue"
                    @update="onScrollUpdate"
                >
                    <template #before>
                        <div class="page-before">
                            <div class="left">
                                <el-select
                                    v-model="statusVersion"
                                    class="status-version"
                                    multiple
                                    clearable
                                    collapse-tags
                                    collapse-tags-tooltip
                                    placeholder="所有版本"
                                >
                                    <el-option
                                        v-if="publishedInfo.hasUnpublishedVersion"
                                        :value="999"
                                        @click.capture.prevent.stop="clickUnpublishedVersion"
                                    >
                                        {{ publishedInfo.latestPublishedVersion === 999 ? '隐藏' : '显示' }}未发布版本
                                    </el-option>
                                    <template v-for="i in allVersions">
                                        <el-option
                                            v-if="i <= publishedInfo.latestPublishedVersion"
                                            :key="i"
                                            :value="i"
                                            :label="i === 0 ? 'BETA' : i.toFixed(1)"
                                        ></el-option>
                                    </template>
                                </el-select>
                                <el-select
                                    v-model="statusQuest"
                                    multiple
                                    clearable
                                    collapse-tags
                                    collapse-tags-tooltip
                                    class="status-quest"
                                    placeholder="所有类型"
                                >
                                    <el-option value="WQ" label="世界任务"></el-option>
                                    <el-option value="IQ" label="每日委托"></el-option>
                                    <el-option value="AQ" label="魔神任务"></el-option>
                                </el-select>
                                <div class="chk">
                                    <el-checkbox v-model="sortByStatus" label="未完成优先" size="large" />
                                </div>
                                <div class="chk">
                                    <el-checkbox v-model="hideFinished" label="隐藏已完成" size="large" />
                                </div>
                                <div v-if="!checkIfAllCat" class="chk">
                                    <el-checkbox
                                        v-model="selectAllCat"
                                        label="全选本页"
                                        size="large"
                                        @change="(checked) => checkAllCat(checked as boolean)"
                                    />
                                </div>
                            </div>
                            <div class="right" :class="{ [$style.searchToWrap]: searchTo && searchHidden && searchKw }">
                                <el-autocomplete
                                    v-if="searchTo"
                                    v-model="searchKw"
                                    clearable
                                    :fetchSuggestions="searchToList"
                                    :trigger-on-focus="false"
                                    class="search-box"
                                    placeholder="输入成就名字、描述或 ID，定位成就"
                                >
                                    <template #default="{ item }">
                                        <div :class="$style.searchToDesc">
                                            <div class="value">{{ item.value }}</div>
                                            <small class="desc">{{ item.desc }}</small>
                                        </div>
                                    </template>
                                    <template #prefix>
                                        <a
                                            class="fa-icon"
                                            title="切换到筛选"
                                            style="cursor: pointer"
                                            @click="searchTo = !searchTo"
                                        >
                                            <fa-icon icon="filter" />
                                        </a>
                                    </template>
                                </el-autocomplete>
                                <el-input
                                    v-if="!searchTo"
                                    v-model="searchKw"
                                    clearable
                                    class="search-box"
                                    placeholder="搜索成就名字、描述或 ID"
                                >
                                    <template #prefix>
                                        <a
                                            class="fa-icon"
                                            title="切换到定位"
                                            style="cursor: pointer"
                                            @click="searchTo = !searchTo"
                                        >
                                            <fa-icon icon="search" />
                                        </a>
                                    </template>
                                </el-input>
                            </div>
                        </div>
                    </template>
                    <template v-slot="{ item: i, active }">
                        <DynamicScrollerItem
                            :item="i"
                            :active="active"
                            :size-dependencies="[i.preStage, i.postStage, (achPartialAmos[i.id] || []).length]"
                        >
                            <achievement-item
                                :i="i"
                                :fin="achievementFin[i.id]"
                                :preFin="achievementFin[i.preStage]"
                                :contributed="contributed"
                                :partial="achPartialAmos[i.id] || []"
                                @check="updateFinished(i.id)"
                                @input-date="achievementFin[i.id].timestamp = $event"
                                @input-current="updateCurrent(i.id, Number($event))"
                                @input-partial="updatePartial(i.id, $event[0], $event[1])"
                                @click-title="detail = i"
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
import { ref, toRef, defineComponent, computed, watch } from 'vue'
import achevementsAmos from '@/generated/amos-data/amos/achievements/index'
import achPartialAmos from '@/generated/amos-data/amos/achievements/partial'
import { goalMap } from '@/views/Achievement/goalMap'
import img from '@/assets/images'

import {
    faCrosshairs,
    faArrowUpFromBracket,
    faCheck,
    faTrashCan,
    faEllipsis,
    faSearch,
    faFilter,
} from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
library.add(faCrosshairs, faArrowUpFromBracket, faCheck, faTrashCan, faEllipsis, faSearch, faFilter)
import IconCocogoat from '@/components/Icons/cocogoat.vue'

import { i18n } from '@/i18n'
import { store, options } from '@/store'
import { Achievement, AchievementCategory, UIAFStatus } from '@/typings/Achievement'

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import CustomElScrollVue from '@/components/ElCustomScroll.vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller/src/index'
import { useContributedAchievements } from './useContributedAchievements'

import AchievementItemComp from './AchivementItem.vue'
import AchievementSidebar from './AchievementSidebar.vue'
import AchievementDetail from './AchievementDetail.vue'
import ExportDropdown from './ExportDropdown.vue'
import ImportDialog from './ImportDialog.vue'
import ScannerDialog from './ScannerDialog.vue'
import versionMap, { allVersions, versionDateMap } from './versionMap'
import { badgeTypeMap } from './badgeMap'
import bus from '@/bus'
import { AchievementItem } from '@/typings/Achievement/Achievement'
import { debounce } from 'lodash-es'
import { AutocompleteFetchSuggestionsCallback } from 'element-plus'
import { isWindows } from '@/utils/compatibility'

export default defineComponent({
    name: 'AchievementIndex',
    components: {
        IconCocogoat,
        AchievementItem: AchievementItemComp,
        AchievementSidebar,
        AchievementDetail,
        ImportDialog,
        ExportDropdown,
        ScannerDialog,
        DynamicScroller,
        DynamicScrollerItem,
    },
    setup() {
        const scroll = ref(null as typeof DynamicScroller | null)
        const selectedIds = ref<string[]>([])
        const showScanner = ref(false)
        const searchKw = ref('')
        const searchTo = ref(false)
        const searchHidden = ref(false)
        const onScrollUpdate = (startIdx: number) => {
            searchHidden.value = startIdx > 1
        }
        const search = computed(() => {
            return searchTo.value ? '' : searchKw.value
        })
        watch(searchKw, () => {
            if (!searchTo.value || !scroll.value) return
            const itemIndex = currentAch.value.findIndex((i) => i18n.amos[i.name] === searchKw.value)
            if (itemIndex >= 0) {
                console.log('scrollToItem', scroll.value.scrollToItem, itemIndex)
                scroll.value.scrollToItem(itemIndex)
            }
        })
        const achievementFin = computed({
            get() {
                return store.value.achievement2
            },
            set(val) {
                store.value.achievement2 = val
            },
        })
        const achievementFinStat = computed(() => {
            return Object.keys(achievementFin.value).reduce(
                (acc, id) => {
                    const fin: AchievementItem = achievementFin.value[Number(id)]
                    const goalId = goalMap[fin.id]
                    if (fin.status > UIAFStatus.ACHIEVEMENT_UNFINISHED) {
                        acc[goalId] = acc[goalId] || { count: 0, reward: 0 }
                        acc[goalId].count++
                        acc[goalId].reward +=
                            achevementsAmos.find((e) => e.id === goalId)?.achievements.find((e) => e.id === fin.id)
                                ?.reward || 0
                    }
                    return acc
                },
                {} as Record<
                    number,
                    {
                        count: number
                        reward: number
                    }
                >,
            )
        })
        const sortByStatus = ref(true)
        const hideFinished = ref(false)
        const selectAllCat = ref(false)
        const totalFin = computed(() => {
            return Object.values(achievementFinStat.value).reduce(
                (acc, val) => {
                    acc.count += val.count
                    acc.reward += val.reward
                    return acc
                },
                { count: 0, reward: 0 },
            )
        })
        const nowDate = new Date()

        const publishedInfo = computed(() => {
            let latestPublishedVersion = 999
            let hasUnpublishedVersion = process.env.NODE_ENV !== 'production'
            for (const version of Object.keys(versionDateMap).sort((a, b) => Number(b) - Number(a))) {
                const date = versionDateMap[Number(version)]
                if (date <= nowDate) {
                    latestPublishedVersion = Number(version)
                    break
                } else {
                    hasUnpublishedVersion = true
                }
            }
            if (options.value.achievements_show_unpublished) {
                latestPublishedVersion = 999
            }
            return {
                latestPublishedVersion,
                hasUnpublishedVersion,
            }
        })
        const clickUnpublishedVersion = () => {
            options.value.achievements_show_unpublished = !options.value.achievements_show_unpublished
            if (!options.value.achievements_show_unpublished) {
                statusVersion.value = statusVersion.value.filter((v) => v <= publishedInfo.value.latestPublishedVersion)
            }
        }
        const achievementCat = computed(() => {
            const ach = achevementsAmos
                .map((e) => {
                    if (publishedInfo.value.latestPublishedVersion === 999) {
                        return e
                    } else {
                        let desReward = 0
                        const computedAch = e.achievements.filter((e) => {
                            if (versionMap[e.id] <= publishedInfo.value.latestPublishedVersion) {
                                return true
                            }
                            desReward += e.reward
                            return false
                        })
                        return {
                            ...e,
                            totalReward: e.totalReward - desReward,
                            achievements: computedAch,
                        }
                    }
                })
                .sort((a, b) => a.order - b.order)
                .filter((e) => e.achievements.length > 0)
            return ach
        })
        const allAchievementCat = computed(() => {
            const output = []
            const all = { id: -1, order: 0, key: 'all', name: -1, totalReward: 0, achievements: [] as Achievement[] }
            achievementCat.value.forEach((e) => {
                all.totalReward += e.totalReward
                all.achievements.push(...e.achievements)
            })
            output.push(all)
            output.push(...achievementCat.value)
            return output
        })
        const totalCount = computed(() => {
            return achievementCat.value.reduce((acc, e) => acc + e.achievements.length, 0)
        })

        const totalReward = computed(() => {
            return achievementCat.value.reduce((acc, cur) => {
                return acc + cur.totalReward
            }, 0)
        })
        const route = useRoute()
        const DEFAULTCAT = 'wonders-of-the-world'
        const ALLCAT = 'all'
        const currentCatId = computed(() => {
            return route.params.cat || DEFAULTCAT
        })
        const currentCat = computed(() => {
            const v: AchievementCategory =
                allAchievementCat.value.find((i) => i.key === currentCatId.value) || achievementCat.value[0]
            const q = {} as Record<number, string>
            v.achievements.forEach((e) => {
                if (e.trigger.task && e.trigger.task.length > 0) {
                    q[e.id] = e.trigger.task[0].type
                } else if (e.trigger.type && badgeTypeMap[e.trigger.type]) {
                    q[e.id] = badgeTypeMap[e.trigger.type]
                }
            })
            return {
                ...v,
                quest: q,
            }
        })
        const has = (ach: Achievement, search: string) => {
            if (ach.id.toString().includes(search)) return true
            if (i18n.amos[ach.name].toLowerCase().includes(search.toLowerCase())) return true
            if (i18n.amos[ach.desc].toLowerCase().includes(search.toLowerCase())) return true
        }
        const searchToList = (search: string, cb: AutocompleteFetchSuggestionsCallback) => {
            return cb(
                currentCat.value.achievements
                    .filter((e) => has(e, search))
                    .map((e) => ({
                        value: i18n.amos[e.name],
                        desc: i18n.amos[e.desc],
                    })),
            )
        }
        const statusVersion = ref([] as number[])
        const statusQuest = ref([] as string[])
        const isFin = (id: number) => {
            return achievementFin.value[id] && achievementFin.value[id].status > UIAFStatus.ACHIEVEMENT_UNFINISHED
        }
        const firstSort = ref([] as number[])
        watch([sortByStatus, currentCat], () => {
            firstSort.value = []
        })
        const currentAch = computed(() => {
            let data = currentCat.value.achievements.concat([])
            const reloadAllCat = () => {
                let reloadStatus = true
                for (let i = 0; i < data.length; i++) {
                    if (achievementFin.value[data[i].id]) {
                        if (achievementFin.value[data[i].id].status === UIAFStatus.ACHIEVEMENT_UNFINISHED) {
                            reloadStatus = false
                            selectAllCat.value = false
                            return
                        }
                    } else {
                        reloadStatus = false
                        selectAllCat.value = false
                        return
                    }
                }
                if (reloadStatus) {
                    selectAllCat.value = true
                }
            }
            reloadAllCat()
            if (hideFinished.value) {
                data = data.filter((i) => {
                    if (i.postStage) {
                        let p = i
                        while (p.postStage) {
                            const q = currentCat.value.achievements.find((e) => e.id === p.postStage)
                            p = q || p
                            if (!q) {
                                console.log('DATAERR: ', p.postStage)
                                break
                            }
                        }
                        return !isFin(p.id)
                    } else {
                        return !isFin(i.id)
                    }
                })
            }
            const statusQuest2 = statusQuest.value.map((e) => (e === 'MQ' ? '' : e))
            if (statusQuest2.length > 0) {
                data = data.filter((i) => statusQuest2.includes(currentCat.value.quest[i.id]))
            }
            if (statusVersion.value.length > 0) {
                data = data.filter((i) => statusVersion.value.includes(versionMap[i.id] || 0))
            }
            if (sortByStatus.value) {
                if (firstSort.value.length <= 0) {
                    data = data.sort((a, b) => {
                        const ret = 0
                        let fa = achievementFin.value[a.id] as AchievementItem | undefined
                        let fb = achievementFin.value[b.id] as AchievementItem | undefined
                        if (a.postStage) {
                            let p = a
                            while (p.postStage) {
                                const q = currentCat.value.achievements.find((e) => e.id === p.postStage)
                                p = q || p
                                if (!q) {
                                    console.log('DATAERR: ', p.postStage)
                                    break
                                }
                            }
                            fa = achievementFin.value[p.id]
                        }
                        if (b.postStage) {
                            let p = b
                            while (p.postStage) {
                                const q = currentCat.value.achievements.find((e) => e.id === p.postStage)
                                p = q || p
                                if (!q) {
                                    console.log('DATAERR: ', p.postStage)
                                    break
                                }
                            }
                            fb = achievementFin.value[p.id]
                        }
                        if (a.preStage === b.id) return 1
                        fa = fa && isFin(fa.id) ? fa : undefined
                        fb = fb && isFin(fb.id) ? fb : undefined
                        if (fa && !fb) return 1
                        if (!fa && fb) return -1
                        return ret
                    })
                    firstSort.value = data.map((e) => e.id)
                } else {
                    // sort by firstsort to avoid item disappear on click finish
                    data = data.sort((a, b) => {
                        const fa = firstSort.value.indexOf(a.id)
                        const fb = firstSort.value.indexOf(b.id)
                        return fa - fb
                    })
                }
            }
            if (search.value.trim()) {
                data = data.filter((e) => {
                    const hasThis = has(e, search.value)
                    let hasPre = false
                    let k = e
                    while (k.preStage) {
                        const q = currentCat.value.achievements.find((i) => i.id === k.preStage)
                        if (!q) {
                            console.log('DATAERR: ', k.preStage)
                            break
                        }
                        k = q || k
                        if (has(k, search.value)) {
                            hasPre = true
                            break
                        }
                    }
                    let hasPost = false
                    k = e
                    while (k.postStage) {
                        const q = currentCat.value.achievements.find((i) => i.id === k.postStage)
                        if (!q) {
                            console.log('DATAERR: ', k.preStage)
                            break
                        }
                        k = q || k
                        if (has(k, search.value)) {
                            hasPost = true
                            break
                        }
                    }
                    return hasThis || hasPre || hasPost
                })
            }
            return data
        })
        const checkIfAllCat = computed(() => currentCatId.value === DEFAULTCAT || currentCatId.value === ALLCAT)
        const checkAllCat = (checked: boolean) => {
            const data = currentCat.value.achievements.concat([])
            if (checked) {
                data.forEach((item) => {
                    store.value.achievement2[item.id] = AchievementItem.create(
                        item.id,
                        UIAFStatus.ACHIEVEMENT_POINT_TAKEN,
                    )
                })
                selectAllCat.value = true
            }
            if (!checked) {
                data.forEach((item) => {
                    store.value.achievement2[item.id].status = UIAFStatus.ACHIEVEMENT_UNFINISHED
                })
            }
        }
        const updateFinished = async (id: number) => {
            if (achievementFin.value[id]) {
                if (achievementFin.value[id].status > UIAFStatus.ACHIEVEMENT_UNFINISHED) {
                    achievementFin.value[id].status = UIAFStatus.ACHIEVEMENT_UNFINISHED
                    achievementFin.value[id].timestamp = 0
                } else {
                    achievementFin.value[id].status = UIAFStatus.ACHIEVEMENT_POINT_TAKEN
                    achievementFin.value[id].timestamp =
                        achievementFin.value[id].timestamp || Math.floor(Date.now() / 1000)
                }
            } else {
                achievementFin.value[id] = await AchievementItem.create(
                    id,
                    UIAFStatus.ACHIEVEMENT_POINT_TAKEN,
                ).finishAllPartials()
                achievementFin.value[id].current = (await achievementFin.value[id].amos).total
            }
        }
        const updateCurrent = (id: number, current: number) => {
            achievementFin.value[id].current = current || 0
            // deep into preStage and postStage
            const updateSub = (k: Achievement) => {
                if (!achievementFin.value[k.id]) {
                    achievementFin.value[k.id] = AchievementItem.create(k.id, UIAFStatus.ACHIEVEMENT_UNFINISHED)
                }
                const item = toRef(achievementFin.value, k.id)
                item.value.current = current || 0
                // eslint-disable-next-line vue/no-ref-object-destructure
                if (item.value.current >= k.total) {
                    item.value.status = UIAFStatus.ACHIEVEMENT_POINT_TAKEN
                    item.value.timestamp = Math.floor(Date.now() / 1000)
                } else {
                    item.value.status = UIAFStatus.ACHIEVEMENT_UNFINISHED
                }
            }
            let k = currentCat.value.achievements.find((i) => i.id === id) as Achievement
            updateSub(k)
            while (k.preStage) {
                const q = currentCat.value.achievements.find((i) => i.id === k.preStage)
                if (!q) {
                    console.log('DATAERR: ', k.preStage)
                    break
                }
                k = q || k
                updateSub(k)
            }
            k = currentCat.value.achievements.find((i) => i.id === id) as Achievement
            while (k.postStage) {
                const q = currentCat.value.achievements.find((i) => i.id === k.postStage)
                if (!q) {
                    console.log('DATAERR: ', k.preStage)
                    break
                }
                k = q || k
                updateSub(k)
            }
        }
        const debouncedUpdateCurrent = debounce(updateCurrent, 400)
        const updatePartial = (id: number, pid: number, state: boolean) => {
            const d = achPartialAmos[id]
            if (!d) return
            if (!achievementFin.value[id]) {
                const d = AchievementItem.create(id, UIAFStatus.ACHIEVEMENT_UNFINISHED)
                d.timestamp = 0
                achievementFin.value[id] = d
            }
            const item = achievementFin.value[id]
            if (state) {
                item.finishPartial(pid)
            } else {
                item.removePartial(pid)
            }
        }
        const showClear = ref(false)
        const doClear = async (all: boolean) => {
            if (all) {
                store.value.achievement2 = {}
            } else {
                Object.keys(achievementFin.value).forEach((e) => {
                    const goalId = goalMap[achievementFin.value[Number(e)].id]
                    if (goalId === currentCat.value.id) {
                        delete store.value.achievement2[Number(e)]
                    }
                })
            }
            showClear.value = false
        }
        const autoImportId = computed(() => (route.query.memo ? route.query.memo.toString() : ''))
        // eslint-disable-next-line vue/no-ref-object-destructure
        const showImport = ref(!!autoImportId.value)
        watch(autoImportId, (v) => {
            if (v) {
                showImport.value = true
            }
        })
        const router = useRouter()
        const closeImport = (id: string) => {
            showImport.value = false
            if (id && id === autoImportId.value) {
                router.replace({
                    ...route,
                    query: {
                        ...route.query,
                        memo: undefined,
                    },
                })
            }
        }
        const contributed = useContributedAchievements()
        const detail = ref(undefined as Achievement | undefined)
        return {
            img,
            scroll,
            options,
            store,
            searchKw,
            searchTo,
            searchHidden,
            onScrollUpdate,
            searchToList,
            showScanner,
            selectedIds,
            achievementCat,
            allAchievementCat,
            currentCatId,
            currentCat,
            achievementFin,
            achievementFinStat,
            currentAch,
            updateFinished,
            updatePartial,
            updateCurrent: debouncedUpdateCurrent,
            doClear,
            showClear,
            CustomElScrollVue,
            showImport,
            sortByStatus,
            hideFinished,
            selectAllCat,
            checkIfAllCat,
            checkAllCat,
            totalCount,
            totalFin,
            totalReward,
            contributed,
            isMobile: toRef(bus(), 'isMobile'),
            detail,
            statusQuest,
            statusVersion,
            allVersions,
            autoImportId,
            closeImport,
            achPartialAmos,
            publishedInfo,
            clickUnpublishedVersion,
            isWindows,
        }
    },
})
</script>
<style lang="scss" module>
.search-to-wrap {
    position: fixed;
    right: 20px;
    z-index: 10;
}
.search-to-desc {
    line-height: 20px;
    padding: 5px 0;
}
.total-percent {
    color: #999;
    font-size: 14px;
    padding-left: 5px;
    display: inline-block;
    line-height: 15px;
    vertical-align: middle;
    margin-top: -4px;
    :global {
        div {
            display: inline-block;
            height: 19px;
            box-sizing: border-box;
            vertical-align: middle;
            border-radius: 2px;
        }

        .count {
            border: 1px solid var(--c-theme);
            color: var(--c-theme);
            background: var(--c-white);
            margin-right: -3px;
            padding: 0 5px;
            padding-right: 7px;
            padding-top: 1px;
        }
        .reward {
            background: var(--c-theme);
            color: var(--c-white);
            padding: 2px 5px;
            font-size: 12px;
            img {
                width: 15px;
                height: 15px;
                float: left;
                padding-right: 3px;
            }
        }
    }
}
:global(.m) .total-percent {
    position: absolute;
    top: 20px;
    right: 55px;
}
.import-dialog {
    width: 500px !important;
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
                background: var(--c-theme);
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
                display: flex;
                padding-top: 15px;
                .right {
                    flex-grow: 1;
                }

                .left {
                    display: flex;
                    flex: 4;
                    .chk {
                        padding: 0 15px;
                        height: 32px;
                        .el-checkbox {
                            height: 32px;
                        }
                    }
                    .el-select {
                        min-width: 130px;
                        width: 140px;
                        max-width: 150px;
                        &.status-version {
                            min-width: 110px;
                            width: 130px;
                            max-width: 140px;
                            flex: 2;
                        }
                        flex: 3;
                        .el-tag.is-closable {
                            padding-left: 5px;
                        }
                        .el-tag__close {
                            display: none;
                        }
                    }
                    .status-switch {
                        width: 130px;
                        box-sizing: border-box;
                        flex: 1;
                    }
                    .el-select .el-select__tags > span {
                        display: flex !important;
                        width: 100%;
                        padding-left: 3px;
                    }
                    span.el-select__tags-text {
                        max-width: 100% !important;
                    }
                }

                .search-box {
                    width: 100%;
                }
            }
            .page-after {
                .select-this-page {
                    margin: 0 auto;
                    margin-top: 10px;
                    margin-bottom: -10px;
                    text-align: center;
                }
                .el-divider {
                    border-color: #ccc;
                    :global(.dark) & {
                        border-color: #333;
                    }
                    margin: 40px 0;
                    .el-divider__text {
                        background: var(--c-background);
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
        .page-before {
            flex-direction: column;
            .left {
                display: flex;
                & > * {
                    flex: 1;
                }
                .chk {
                    padding: 0 5px;
                    .el-checkbox.el-checkbox--large .el-checkbox__label {
                        font-size: 12px;
                    }
                }
            }
        }
        article {
            top: 65px;
            left: 0;
        }

        .scroller {
            padding: 0 5px;
        }
    }
}
</style>
