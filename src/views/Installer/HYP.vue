<template>
    <Layout full-height>
        <template #title>
            <div class="teleport-title">PC 端更新包列表</div>
        </template>
        <template #actions>
            <router-link :to="{ name: 'installer.legacy' }">
                <el-button type="info" plain>返回旧版启动器</el-button>
            </router-link>
        </template>
        <div v-elloading="loading" :class="$style.page">
            <el-scrollbar>
                <el-tabs
                    :model-value="($route.query.type || 'hk4e_cn').toString()"
                    @update:model-value="
                        $router.replace({ query: { type: $event === 'hk4e_cn' ? undefined : $event } })
                    "
                >
                    <el-tab-pane v-for="i in computedData" :key="i.biz_extra" :name="i.biz_extra">
                        <template #label>
                            <span :class="$style.bizName">
                                {{ i.display.name }}
                                <el-tag v-if="i.biz_region === 'global'" size="small" type="primary">国际</el-tag>
                                <el-tag v-else-if="i.biz_region === 'bili'" size="small" class="el-tag--pink">
                                    BiliBili
                                </el-tag>
                            </span>
                        </template>
                        <div style="margin: 0 20px">
                            <el-alert v-if="hypResult?.last_modified" type="info" :show-icon="false" :closable="false">
                                数据更新于 {{ dayjs(hypResult.last_modified).format('YYYY-MM-DD HH:mm:ss') }}
                            </el-alert>
                        </div>
                        <HYPCard v-if="i.game_packages?.length > 0" :item="i" />
                        <el-empty v-else description="暂无更新包" />
                    </el-tab-pane>
                </el-tabs>
                <div v-if="!loading"></div>
            </el-scrollbar>
        </div>
    </Layout>
</template>

<script lang="ts">
import '@/styles/actions.scss'
import { ref, onMounted, defineComponent, computed } from 'vue'
import {
    faBoxOpen,
    faFileAudio,
    faAngleRight,
    faHashtag,
    faDatabase,
    faFileZipper,
    faCalendarPlus,
    faHouseLaptop,
    faCodeMerge,
} from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { ElNotification } from 'element-plus'
import dayjs from 'dayjs'
library.add(
    faBoxOpen,
    faAngleRight,
    faFileAudio,
    faHashtag,
    faCodeMerge,
    faDatabase,
    faFileZipper,
    faCalendarPlus,
    faHouseLaptop,
)
import { vLoading } from 'element-plus/es/components/loading/src/directive'
import 'element-plus/theme-chalk/el-loading.css'
import 'element-plus/theme-chalk/el-notification.css'
import { urls } from './urls'
import { apibase } from '@/utils/apibase'
import { HYPGameItem, HYPType } from '@/typings/hyp'
import HYPCard from './HYPCard.vue'
export default defineComponent({
    name: 'InstallerHyp',
    directives: {
        elloading: vLoading,
    },
    components: {
        HYPCard,
    },
    setup() {
        const loading = ref(true)
        const hypResult = ref<HYPType | null>(null)
        const load = async () => {
            loading.value = true
            return fetch(await apibase('/v2/hyp/packages'))
                .then((res) => {
                    return res.json()
                })
                .then((res) => {
                    loading.value = false
                    hypResult.value = res
                })
                .catch((err) => {
                    ElNotification.error({
                        title: '出错了',
                        message: err.message,
                    })
                })
        }
        onMounted(load)
        const basename = (path: string) => {
            const pathArr = path.split('/')
            return pathArr[pathArr.length - 1]
        }
        const formatSize = (size: number) => {
            if (size < 1024) {
                return `${size}B`
            } else if (size < 1024 * 1024) {
                return `${(size / 1024).toFixed(2)}KB`
            } else if (size < 1024 * 1024 * 1024) {
                return `${(size / 1024 / 1024).toFixed(2)}MB`
            } else {
                return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`
            }
        }
        const sortBy = ['hk4e', 'hkrpg', 'bh3', 'nap']
        const computedData = computed(() => {
            return hypResult.value?.games
                .map((i) => {
                    return {
                        ...i,
                        game_packages: hypResult.value?.game_packages.filter((j) => j.game.id === i.id),
                        game_channel_sdks: hypResult.value?.game_channel_sdks.filter((j) => j.game.id === i.id),
                        biz_short: i.biz_extra.split('_')[0],
                        biz_region: i.biz_extra.split('_')[1],
                    } as HYPGameItem
                })
                .sort((a, b) => {
                    const biz_first_a = a.biz_extra.split('_')[0]
                    const biz_first_b = b.biz_extra.split('_')[0]
                    return sortBy.indexOf(biz_first_a) - sortBy.indexOf(biz_first_b)
                })
        })
        return {
            loading,
            basename,
            formatSize,
            urls,
            hypResult,
            computedData,
            dayjs,
        }
    },
})
</script>
<style lang="scss" module>
.page {
    height: 100%;
    background: var(--c-background);
    :global {
        .el-tabs__nav-scroll {
            padding: 0 20px;
        }
    }
}
.bizName {
    display: flex;
    align-items: center;
    gap: 6px;
    :global {
        .el-tag--small {
            height: 16px;
            padding: 0 3px;
        }
        .el-tag--pink {
            --el-tag-border-color: #fb7299;
            --el-tag-text-color: #fb7299;
        }
    }

    :global(.dark) & {
        :global {
            .el-tag--pink {
                opacity: 0.7;
            }
        }
    }
}
</style>
