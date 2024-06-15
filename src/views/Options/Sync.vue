<template>
    <section :class="$style.syncManager">
        <h4>云同步</h4>
        <div class="desc">
            在这里可以将您的账号与云同步。
            <br />
            如出现同步失败，一般是本地数据和云端数据出现了冲突，您可以选择：
            <li>在下方点击手动同步，强制覆盖云端数据</li>
            <li>在下方点击清除本地数据，页面刷新后会自动从云端同步</li>
        </div>
        <el-table ref="datatable" :data="syncProviders" class="account-table">
            <el-table-column prop="id">
                <template #header>
                    <el-button @click="forceSyncAll(true)">手动同步</el-button>
                </template>
                <template #default="scope">
                    <component
                        :is="scope.row.provider.component"
                        v-if="scope.row.provider.component"
                        :provider="scope.row.provider"
                    />
                    <div v-else>
                        {{ JSON.stringify(scope.row) }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column width="120px">
                <template #header>
                    <el-button
                        class="add-button"
                        type="primary"
                        plain
                        style="float: right"
                        @click="
                            $router.replace({
                                params: {
                                    app: 'cocogoat',
                                },
                            })
                        "
                    >
                        <fa-icon icon="plus" />
                        &nbsp; 添加
                    </el-button>
                </template>
                <template #default="scope">
                    <div style="text-align: right">
                        <el-button
                            type="danger"
                            style="width: 35px; margin-left: 2px"
                            plain
                            @click="delprovider(scope.row)"
                        >
                            <fa-icon icon="trash-can" />
                        </el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <br />
        <div v-if="syncStatus.errors.length > 0" class="failds">
            <h4>同步状态</h4>
            <br />
            <el-table :data="syncStatus.errors" class="error-table">
                <el-table-column prop="provider" label="同步服务"></el-table-column>
                <el-table-column prop="provider" label="错误类型">
                    <template #default="scope">
                        {{ errtype[scope.row.code] || '其他错误' }}
                    </template>
                </el-table-column>
                <el-table-column prop="provider" label="详细信息">
                    <template #default="scope">
                        {{ scope.row.message }}
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <h4>本地导出</h4>
        <div class="desc">
            导出的本地文件为 zip 格式，因此只需通过删除其中不想要的文件即可实现部分导入。<br />导入还没做好。
            <p>
                <el-button type="primary" plain :loading="exportLoading" @click="exportData">导出数据</el-button>
                <el-button plain disabled>导入数据</el-button>
                <el-button plain type="danger" @click="clearData">清除数据</el-button>
            </p>
        </div>

        <el-drawer
            :model-value="addType !== ''"
            class="add-drawer"
            title="添加同步账号"
            :size="320"
            :append-to-body="false"
            :z-index="900"
            destroy-on-close
            :close-on-press-escape="false"
            :close-on-click-modal="false"
            @close="
                $router.replace({
                    params: {},
                })
            "
        >
            <div class="add-form">
                <el-select
                    :model-value="addType"
                    size="large"
                    style="width: 100%"
                    @update:model-value="
                        $router.replace({
                            params: {
                                app: $event,
                            },
                        })
                    "
                >
                    <el-option
                        v-for="i in providerInstallerList"
                        :key="i.class"
                        :value="i.class"
                        :label="i.name"
                    ></el-option>
                </el-select>
                <el-divider></el-divider>
                <component :is="addComp" @submit="addSave($event as any)" />
            </div>
        </el-drawer>
    </section>
</template>

<script lang="ts">
import { forceSyncAll, initSync, IProviderItem, syncProviders, syncStatus } from '@/store/sync'
import { ref, computed, defineComponent, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { list, get, del } from '@/store/impl'
import { last } from '@/store/impl/localStorage'
import dayjs from 'dayjs'
import { ElMessageBox } from 'element-plus'
import { disableAutoSave } from '@/store'
import providerInstallerList from '@/store/syncInstaller'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons'
library.add(faPlus, faPenToSquare, faTrashCan)
export default defineComponent({
    setup() {
        const delprovider = (row: IProviderItem) => {
            syncProviders.value.splice(syncProviders.value.indexOf(row), 1)
            localStorage.removeItem('cocogoat.sync.v1.' + row.id)
        }
        const route = useRoute()
        const router = useRouter()
        const addType = computed(() => {
            return (route.params.app || '').toString()
        })
        const addComp = computed(() => {
            return providerInstallerList.find((i) => i.class === addType.value)?.component
        })
        const addSave = ({ key, data }: { key: string; data: unknown }) => {
            const ckey = key
                ? `${addType.value}_${key}`
                : new Date().getTime().toString(16).split('').reverse().join('').substring(0, 8)
            localStorage.setItem(
                'cocogoat.sync.v1.' + ckey,
                JSON.stringify({
                    class: addType.value,
                    data,
                }),
            )
            router.replace({
                params: {
                    app: '',
                },
            })
            initSync().then(() => forceSyncAll(false))
        }
        const exportLoading = ref(false)
        const exportData = async () => {
            exportLoading.value = true
            const Jszip = (await import('jszip')).default
            const zip = new Jszip()
            const keys = list().concat(['options', 'currentUser'])
            keys.forEach((key) => {
                const value = get(key)
                const lastModified = last(key).toISOString()
                zip.file(key + '.json', JSON.stringify({ value, lastModified }, null, 4))
            })
            const blob = await zip.generateAsync({ type: 'blob' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `cocogoat-export-${dayjs().format('YYMMDDHHmm')}.zip`
            a.click()
            exportLoading.value = false
        }
        const clearData = async () => {
            try {
                await ElMessageBox.confirm(
                    '真的要清除本地数据吗？云端数据将依然保留，如需清理云端数据请通过删除账号方式操作。',
                    '提示',
                )
            } catch (e) {
                return
            }
            disableAutoSave.value = true
            await nextTick()
            const keys = list().concat(['options', 'currentUser'])
            keys.forEach((key) => {
                del(key, false)
            })
            location.reload()
        }
        const errtype = {
            conflict: '同步冲突',
            offline: '网络错误',
            auth: '登录失效',
            disabled: '暂停服务',
        } as Record<string, string>
        return {
            syncProviders,
            syncStatus,
            providerInstallerList,
            delprovider,
            addType,
            addSave,
            addComp,
            forceSyncAll,
            clearData,
            exportData,
            exportLoading,
            errtype,
        }
    },
})
</script>

<style lang="scss" module>
.sync-manager {
    padding: 0 20px;
    :global {
        h4 {
            margin: 10px 0;
        }
        .add-drawer {
            padding-top: 50px;
            .add-form {
                margin-top: -20px;
            }
        }
        .desc {
            color: var(--c-text-mid);
            padding: 10px;
            margin-bottom: 10px;
            font-size: 14px;
            b {
                color: darkred;
            }
        }
    }
}
</style>
