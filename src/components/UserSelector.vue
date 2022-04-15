<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { store, allUsers, currentUser } from '@/store'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faAngleDown,
    faCheck,
    faXmark,
    faEllipsis,
    faExclamation,
    faArrowsRotate,
    faLaptopCode,
} from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'vue-router'
import { syncStatus, SYNCSTAT } from '@/store/sync'
import { characterIcon } from '@/assets/mihoyoImages/characterIcon'
library.add(faAngleDown, faCheck, faXmark, faEllipsis, faExclamation, faArrowsRotate, faLaptopCode)
export default defineComponent({
    props: {
        hideMore: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const router = useRouter()
        const avatar = computed(() => characterIcon(store.value.user.avatar))
        const onSelect = ([action, param]: [string, string | undefined]) => {
            switch (action) {
                case 'switch':
                    if (param && param !== currentUser.value) {
                        currentUser.value = param
                    }
                    break
                case 'more':
                    router.push('/options/user')
                    break
                case 'cloud':
                    router.push('/options/sync')
                    break
            }
        }
        const syncStatusText = {
            [SYNCSTAT.OFFLINE]: '未同步',
            [SYNCSTAT.SYNCING]: '同步中',
            [SYNCSTAT.SYNCED]: '同步成功',
            [SYNCSTAT.FAILED]: '同步失败',
            [SYNCSTAT.WAITING]: '等待同步',
            [SYNCSTAT.PARTIALLY]: '部分失败',
        }
        const syncIcon = {
            [SYNCSTAT.OFFLINE]: 'laptop-code',
            [SYNCSTAT.SYNCING]: 'arrows-rotate',
            [SYNCSTAT.SYNCED]: 'check',
            [SYNCSTAT.FAILED]: 'xmark',
            [SYNCSTAT.WAITING]: 'ellipsis',
            [SYNCSTAT.PARTIALLY]: 'exclamation',
        }
        const menuState = ref(false)
        return {
            store,
            avatar,
            onSelect,
            allUsers,
            currentUser,
            menuState,
            syncStatus,
            syncStatusText,
            syncIcon,
            characterIcon,
        }
    },
})
</script>

<template>
    <section :class="$style.userSelector">
        <el-dropdown :show-timeout="0" :hide-timeout="50" @command="onSelect" @visible-change="menuState = $event">
            <div :class="[$style.userInfo, $style.currentUser, syncStatus.status, menuState ? 'open' : '']">
                <img :src="avatar" />
                <div :class="[$style.syncIcon, syncStatus.status, 'head-sync-icon']">
                    <fa-icon :icon="syncIcon[syncStatus.status]" />
                </div>
                <span class="user-text">
                    <span class="user-name">{{ store.user.name }}</span>
                    <span class="user-id">{{ currentUser }}</span>
                </span>
                <span class="down">
                    <fa-icon icon="angle-down" />
                </span>
            </div>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item
                        v-for="i in allUsers"
                        :key="i.id"
                        :command="['switch', i.id]"
                        :class="[currentUser === i.id ? $style.selected : '']"
                    >
                        <div :class="[$style.userInfo, $style.listUser, currentUser === i.id ? 'selected' : '']">
                            <img :src="characterIcon(i.avatar)" />
                            <span class="user-text">
                                <span class="user-name">{{ i.name }}</span>
                                <span class="user-id">{{ i.id }}</span>
                            </span>
                        </div>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="!hideMore" divided :command="['more']">账号管理</el-dropdown-item>
                    <el-dropdown-item v-if="!hideMore" divided :command="['cloud']">
                        <div :class="$style.userInfo">
                            <div :class="[$style.syncIcon, syncStatus.status, 'menu-sync-icon']">
                                <fa-icon :icon="syncIcon[syncStatus.status]" />
                            </div>
                            <span class="user-text">
                                <span class="user-name">云同步</span>
                                <span class="user-id">{{ syncStatusText[syncStatus.status] }}</span>
                            </span>
                        </div>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </section>
</template>

<style lang="scss" module>
:global(.m) .current-user {
    img {
        border: 1px solid #0079cc;
        box-sizing: border-box;
        background: #fff;
    }
    &:global(.offline) img {
        border-color: #888;
    }
    &:global(.synced) img {
        border-color: #0079cc;
    }
    &:global(.failed) img {
        border-color: #c10000;
    }
    &:global(.partially) img {
        border-color: #e36900;
    }
    :global(.user-text) {
        display: none;
    }
}
.userSelector {
    height: 100%;
    width: 100%;
}

.sync-icon {
    position: absolute;
    border-radius: 100%;
    text-align: center;
    background: #bfdef2;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #227acc;
    &:global(.menu-sync-icon) {
        width: 33px;
        height: 33px;
        left: 0;
        top: 0;
        svg {
            width: 16px;
            height: 16px;
        }
    }
    &:global(.head-sync-icon) {
        bottom: 2px;
        left: 29px;
        width: 16px;
        height: 16px;
        svg {
            width: 10px;
            height: 10px;
        }
    }
    &:global(.offline) {
        color: #888;
        background: #ddd;
    }
    &:global(.synced) {
        background: #0079cc;
        color: #fff;
    }
    &:global(.failed) {
        background: #c10000;
        color: #fff;
    }
    &:global(.partially) {
        background: #e36900;
        color: #fff;
    }
}
.selected {
    background-color: var(--el-dropdown-menuItem-hover-fill);
    cursor: default;
}
.current-user {
    cursor: pointer;
    width: 140px;
    box-sizing: border-box;
    padding: 7px;
    height: 50px;
    padding-right: 0;
    &:hover,
    &:global(.open) {
        background-color: var(--el-dropdown-menuItem-hover-fill);
    }
    :global {
        .down {
            display: inline-block;
            position: absolute;
            right: 8px;
            top: 18px;
            color: #aaa;
        }
    }
}
.list-user {
    &:hover,
    &:global(.selected) {
        background-color: var(--el-dropdown-menuItem-hover-fill);
        :global {
            .user-name {
                color: var(--el-dropdown-menuItem-hover-color);
            }
            .user-id {
                color: var(--el-dropdown-menuItem-hover-color);
                opacity: 0.7;
            }
        }
    }
}
.user-info {
    transition: all 0.1s;
    position: relative;
    img {
        height: 36px;
        width: 36px;
        float: left;
        border-radius: 100%;
    }
    :global {
        .user-name {
            display: block;
            font-size: 15px;
            color: #777;
        }

        .user-id {
            display: block;
            font-size: 12px;
            color: #999;
            margin-top: 2px;
            font-family: Consolas, monospace;
        }

        .user-text {
            display: block;
            padding-left: 42px;
            padding-top: 3px;
            padding-right: 20px;
            line-height: 1;
        }
    }
}
</style>
