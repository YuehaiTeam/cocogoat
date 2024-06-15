<template>
    <section :class="$style.userManager">
        <div class="topbar"></div>
        <el-table
            ref="datatable"
            highlight-current-row
            :data="allUsers"
            class="account-table"
            @current-change="handleCurrentChange"
        >
            <el-table-column prop="id">
                <template #header>
                    <span class="desc">点击头像切换用户</span>
                </template>
                <template #default="scope">
                    <img class="table-avatar" :src="characterIcon(scope.row.avatar)" />
                    <div class="user-name">{{ scope.row.name }}</div>
                    <div class="user-id">{{ scope.row.id }}</div>
                </template>
            </el-table-column>
            <el-table-column width="120px">
                <template #header>
                    <el-button class="add-button" type="primary" plain style="float: right" @click="addUser">
                        <fa-icon icon="plus" />
                        &nbsp; 添加
                    </el-button>
                </template>
                <template #default="scope">
                    <div style="text-align: right">
                        <el-button style="width: 35px" @click.prevent.stop="editUser(scope.row)">
                            <fa-icon icon="pen-to-square" />
                        </el-button>
                        <el-button
                            v-if="allUsers.length > 1"
                            type="danger"
                            style="width: 35px; margin-left: 2px"
                            plain
                            @click.prevent.stop="delUser(scope.row)"
                        >
                            <fa-icon icon="trash-can" />
                        </el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <el-drawer
            v-model="edit.show"
            class="edit-drawer"
            :size="320"
            :title="`${edit.edit ? '编辑' : '添加'}账号`"
            :append-to-body="false"
            :z-index="900"
            destroy-on-close
        >
            <el-form label-position="left" label-width="auto">
                <el-form-item label="UID">
                    <el-input v-model="edit.id" placeholder="100000...." size="large"></el-input>
                </el-form-item>
                <el-form-item label="名称">
                    <el-input v-model="edit.name" placeholder="爷真可爱" size="large"></el-input>
                </el-form-item>
                <el-form-item label="头像">
                    <el-select v-model="edit.avatar" size="large" filterable :class="$style.avatarSel">
                        <template #prefix>
                            <div :class="$style.avatarSelPrefix">
                                <img :src="characterIcon(edit.avatar)" />
                            </div>
                        </template>
                        <el-option
                            v-for="i in characterAmos"
                            :key="i.key"
                            :value="i.key"
                            :label="i18n.amos[i.name]"
                            :class="$style.userSelectorItem"
                        >
                            <img :src="characterIcon(i.key)" />
                            <span class="sel-uname">{{ i18n.amos[i.name] }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <el-button type="primary" size="large" style="width: 100%" @click="saveForm">保存</el-button>
        </el-drawer>
    </section>
</template>

<script lang="ts">
import { allUsers, createEmptyStore, currentUser, reloadAllUsers } from '@/store'
import { i18n } from '@/i18n'
import { ref, Ref, watch, defineComponent } from 'vue'
import { ElMessageBox, ElTable } from 'element-plus'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { del, get, set } from '@/store/impl'
import { characterIcon } from '@/assets/mihoyoImages/characterIcon'
import characterAmos from '@/generated/amos-data/amos/characters'
library.add(faPlus, faPenToSquare, faTrashCan)
type Unpacked<T> = T extends (infer U)[] ? U : T
export default defineComponent({
    setup() {
        const datatable = ref(null) as Ref<null | typeof ElTable>
        watch([datatable, currentUser], () => {
            datatable.value?.setCurrentRow(allUsers.value.find((e) => e.id === currentUser.value))
        })
        const handleCurrentChange = (e: Unpacked<typeof allUsers.value>) => {
            if (edit.value.show) return
            if (e && e.id && e.id !== currentUser.value) {
                currentUser.value = e.id
            }
        }
        const edit = ref({
            show: false,
            edit: '',
            id: '',
            name: '',
            avatar: 'PlayerGirl',
        })
        function addUser() {
            edit.value = {
                show: true,
                edit: '',
                id: '',
                name: '',
                avatar: 'PlayerGirl',
            }
        }
        function editUser(user: Unpacked<typeof allUsers.value>) {
            edit.value = {
                show: true,
                edit: user.id,
                id: user.id,
                name: user.name,
                avatar: user.avatar,
            }
        }
        function saveForm() {
            if (
                ['options', 'currentUser', 'cocogoat'].includes(edit.value.id) ||
                edit.value.id.includes('/') ||
                edit.value.id.includes('\\') ||
                edit.value.id.includes(' ')
            ) {
                ElMessageBox.alert('UID 不合适', '出错了')
                return
            }
            if (!edit.value.edit) {
                if (allUsers.value.find((e) => e.id === edit.value.id)) {
                    ElMessageBox.alert('UID 重复', '出错了')
                    return
                }
                // 新增
                const emptyStore = createEmptyStore()
                emptyStore.user.name = edit.value.name
                emptyStore.user.avatar = edit.value.avatar
                set(edit.value.id, emptyStore)
                reloadAllUsers()
                edit.value.show = false
                return
            }
            if (edit.value.edit !== edit.value.id) {
                // 修改了UID
                if (allUsers.value.find((e) => e.id === edit.value.id)) {
                    ElMessageBox.alert('UID 重复', '出错了')
                    return
                }
                const val = get(edit.value.edit)
                del(edit.value.edit)
                set(edit.value.id, val)
            }
            const val = get(edit.value.id)
            val.user.name = edit.value.name
            val.user.avatar = edit.value.avatar
            set(edit.value.id, val)
            reloadAllUsers()
            if (currentUser.value === edit.value.edit) {
                currentUser.value = edit.value.id
            }
            edit.value.show = false
        }
        async function delUser(user: Unpacked<typeof allUsers.value>) {
            try {
                await ElMessageBox.confirm('真的要删除吗？', '提示')
            } catch (e) {
                return
            }
            if (user.id === currentUser.value) {
                currentUser.value = allUsers.value[0].id
            }
            del(user.id)
            reloadAllUsers()
        }
        return {
            i18n,
            allUsers,
            currentUser,
            characterIcon,
            datatable,
            handleCurrentChange,
            addUser,
            editUser,
            delUser,
            edit,
            saveForm,
            characterAmos,
        }
    },
})
</script>

<style lang="scss" module>
.user-selector-item {
    height: 45px;
    line-height: 40px;
    vertical-align: middle;
    :global {
        img {
            height: 38px;
            width: 38px;
            border-radius: 100%;
            display: inline-block;
            vertical-align: middle;
            border: 1px solid #ddd;
        }
        .sel-uname {
            vertical-align: middle;
            padding-left: 10px;
            padding-top: 1px;
            display: inline-block;
        }
    }
}
.user-manager {
    padding: 0 20px;
    :global {
        .edit-drawer {
            padding-top: 50px;
        }
        .desc {
            font-size: 13px;
            color: #555;
            display: inline-block;
            font-weight: normal;
        }

        .account-table {
            .table-avatar {
                width: 40px;
                height: 40px;
                border-radius: 5px;
                border: 1px solid #eee;
                background: #fff;
                float: left;
                margin-right: 10px;
            }
            .user-name {
                display: block;
                font-size: 15px;
                color: var(--c-text);
            }

            .user-id {
                display: block;
                font-size: 12px;
                color: var(--c-text-sub);
                margin-top: -2px;
                font-family: Consolas, monospace;
            }
        }
    }
}
.avatar-sel {
    height: 71px;
    overflow: hidden;
    .avatar-sel-prefix {
        border-radius: 100%;
        margin: 5px;
        margin-left: -6px;
        overflow: hidden;
        box-shadow: 0 0 0 1px var(--el-select-border-color-hover) inset;
        img {
            width: 45px;
            height: 45px;
            display: block;
        }
    }
}
</style>
