<template>
    <div :class="{ [$style.fullHeight]: fullHeight, [$style.layout]: true, [$style.open]: actionsOpen }">
        <header :class="$style.componentHeader">
            <div :class="$style.appTitle"><slot name="title" /></div>
            <div v-if="$slots.actions" :class="[$style.appActions, actionsOpen ? $style.open : '']">
                <slot name="actions" />
            </div>
            <el-button
                v-if="isMobile && $slots.actions"
                :class="[$style.btnActions, $style.boxActions, actionsOpen ? $style.open : '']"
                plain
                @click="actionsOpen = !actionsOpen"
            >
                <fa-icon icon="ellipsis-vertical" />
            </el-button>
        </header>
        <main :class="$style.componentMain">
            <slot />
        </main>
    </div>
</template>
<script lang="ts">
import bus from '@/bus'
import { defineComponent, ref, toRef } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
library.add(faEllipsisVertical)
export default defineComponent({
    props: {
        fullHeight: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const actionsOpen = ref(false)
        return {
            actionsOpen,
            isMobile: toRef(bus(), 'isMobile'),
        }
    },
})
</script>
<style lang="scss" module>
.component-header {
    height: 50px;
    width: 100%;
    max-width: 100vw;
    overflow: hidden;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
    .app-title {
        padding-left: 100px;
        line-height: 50px;
        font-size: 20px;
        user-select: none;
        cursor: default;
    }
}
.full-height {
    height: 100vh;
    .component-main {
        height: 100%;
        box-sizing: border-box;
    }
}
.layout {
    min-height: 100vh;
    padding-top: 50px;
    padding-left: 80px;
    box-sizing: border-box;
    .component-main {
        height: 100%;
        box-sizing: border-box;
    }
}
:global(.m) {
    .layout {
        box-sizing: border-box;
        padding-bottom: 55px;
        padding-left: 0;
        transition: padding 0.2s;
        &.open {
            padding-top: 100px;
        }
        .component-header {
            height: 0;
            overflow: hidden;
        }
    }
    .app-title {
        position: fixed;
        top: 0;
        left: 58px;
        z-index: 999;
        right: 0;
        padding: 0;
    }

    .app-actions {
        height: 50px;
        position: fixed;
        top: 0px;
        &.open {
            top: 50px;
        }
        right: 0;
        left: 0;
        line-height: 48px;
        vertical-align: middle;
        text-align: right;
        background-color: #fff;
        transition: all 0.2s;
        z-index: 989;
        padding: 0 15px;
        :global {
            .a-line {
                display: inline-block;
                margin-left: 10px;
            }
        }
    }
    .btn-actions {
        position: fixed;
        right: 0;
        top: 0;
        width: 45px;
        height: 50px;
        border: 0;
        transition: all 0.1s;
        z-index: 999;
        border-radius: 0;
        font-size: 20px;
        &.open {
            background-color: var(--el-color-primary-light-9);
            color: var(--c-theme);
        }
    }
}
:global(.pc) {
    .component-header {
        position: fixed;
    }
    .app-actions {
        height: 100%;
        position: absolute;
        top: 0;
        right: 150px;
        line-height: 48px;
        vertical-align: middle;
        :global {
            .a-line {
                display: inline-block;
                margin-left: 10px;
            }
        }
    }
}
</style>
