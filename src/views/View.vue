<template>
    <div :class="{ [$style.fullHeight]: fullHeight, [$style.layout]: true }">
        <header :class="$style.componentHeader">
            <div :class="$style.appTitle"><slot name="title" /></div>
            <div
                v-if="$slots.actions"
                :class="[$style.boxActions, actionsOpen ? $style.open : '', width > 0 ? $style.loaded : '']"
                :style="
                    isMobile
                        ? {
                              transform: `translateX(${actionsOpen ? 0 : (width || 300) + 21}px)`,
                          }
                        : {}
                "
            >
                <el-button
                    v-if="isMobile && $slots.actions"
                    :class="$style.btnActions"
                    plain
                    @click="actionsOpen = !actionsOpen"
                >
                    <fa-icon icon="angle-left" />
                </el-button>
                <div ref="actionsEl" :class="$style.appActions"><slot name="actions" /></div>
            </div>
        </header>
        <main :class="$style.componentMain">
            <slot />
        </main>
    </div>
</template>
<script lang="ts">
import bus from '@/bus'
import { defineComponent, ref, toRef } from 'vue'
import { useElementSize } from '@vueuse/core'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'
library.add(faAngleLeft)
export default defineComponent({
    props: {
        fullHeight: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const actionsOpen = ref(false)
        const actionsEl = ref(null as HTMLElement | null)
        const { width } = useElementSize(actionsEl)
        return {
            actionsOpen,
            actionsEl,
            width,
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
    position: fixed;
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
    }
    .app-title {
        padding-left: 60px;
    }
    .box-actions {
        position: fixed;
        right: 0;
        bottom: 70px;
        left: 15px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        &.loaded {
            transition: all 0.4s;
        }
        &.open {
            .btn-actions :global(.svg-inline--fa) {
                transform: rotateY(180deg);
            }
        }
    }
    .app-actions {
        background: #fff;
        border: 1px solid #409eff;
        border-right: 0;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        padding: 10px;
        :global(.a-line) {
            display: flex;
            justify-content: center;
            & > * {
                flex-grow: 1;
            }
        }
    }
    .btn-actions {
        border-radius: 5px;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: 0;
        width: 40px;
        height: 40px;
        text-align: center;
        padding: 0;
        padding-left: 1px;
        border-color: #409eff;
        color: #fff;
        background: #409eff;
        svg {
            width: 23px;
            height: 23px;
            fill: currentColor;
        }
        :global(.svg-inline--fa) {
            transition: all 0.5s;
        }
    }
}
:global(.pc) {
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
