<script lang="ts">
import { i18n } from '@/i18n'
import { defineComponent, computed, ref } from 'vue'
import { store, allUsers, currentUser } from '@/store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'vue-router'
library.add(faAngleDown)
export default defineComponent({
    props: {
        hideMore: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        function getAvatar(avatar: string) {
            try {
                const a = i18n.value.characterAvatar[avatar]
                if (!a) throw new Error()
                return a
            } catch (e) {
                return i18n.value.characterAvatar['traveler']
            }
        }
        const router = useRouter()
        const avatar = computed(() => getAvatar(store.value.user.avatar))
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
            }
        }
        const menuState = ref(false)
        return {
            store,
            avatar,
            onSelect,
            allUsers,
            getAvatar,
            currentUser,
            menuState,
        }
    },
})
</script>

<template>
    <section :class="$style.userSelector">
        <el-dropdown :show-timeout="0" :hide-timeout="50" @command="onSelect" @visible-change="menuState = $event">
            <div :class="[$style.userInfo, $style.currentUser, menuState ? 'open' : '']">
                <img :src="avatar" />
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
                            <img :src="getAvatar(i.avatar)" />
                            <span class="user-text">
                                <span class="user-name">{{ i.name }}</span>
                                <span class="user-id">{{ i.id }}</span>
                            </span>
                        </div>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="!hideMore" divided :command="['more']">账号管理</el-dropdown-item>
                    <el-dropdown-item v-if="!hideMore" divided :command="['cloud']">
                        <div :class="$style.userInfo">
                            <span class="user-text" style="padding-left: 0">
                                <span class="user-name">云同步</span>
                                <span class="user-id">开发中...</span>
                            </span>
                        </div>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </section>
</template>

<style lang="scss" module>
.userSelector {
    height: 100%;
    width: 100%;
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
