<template>
    <div :class="$style.sidebar">
        <el-scrollbar ref="scrollbarRef" class="sidebar-scroll">
            <div class="sidebar-in">
                <router-link
                    v-for="i in achievementCat"
                    :key="i.id"
                    :to="{
                        ...$route,
                        params: {
                            cat: i.id === 'wonders_of_the_world' ? '' : i.id,
                        },
                    }"
                    :active-class="i.id === 'wonders_of_the_world' ? '' : 'router-link-active'"
                    :exact-active-class="i.id === 'wonders_of_the_world' ? 'router-link-active' : ''"
                >
                    <div>
                        {{ i.name }}
                    </div>
                    <small>
                        {{ achievementFinCount[i.originalId] || 0 }}/{{ i.achievements.length }} ({{
                            Math.round(((achievementFinCount[i.originalId] || 0) / i.achievements.length) * 100)
                        }}%)
                    </small>
                </router-link>
            </div>
        </el-scrollbar>
        <div v-if="$root.isMobile" class="lr">
            <div class="l" @click="move(-1)">
                <fa-icon icon="angle-left" />
            </div>
            <div class="r" @click="move(1)">
                <fa-icon icon="angle-right" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
library.add(faAngleLeft, faAngleRight)

import { ref } from '@vue/reactivity'
import { defineComponent } from '@vue/runtime-core'
import { ElScrollbar } from 'element-plus/lib/components'
export default defineComponent({
    props: ['achievementCat', 'achievementFinCount'],
    setup() {
        const scrollbarRef = ref<InstanceType<typeof ElScrollbar> | null>(null)
        const move = (dir: number) => {
            if (!scrollbarRef.value) return
            const delta = 50
            const move = delta * dir
            const div = scrollbarRef.value.wrap$
            if (!div) return
            const newScrollLeft = div.scrollLeft + move
            scrollbarRef.value.setScrollLeft(Math.max(0, newScrollLeft))
        }
        return {
            move,
            scrollbarRef,
        }
    },
})
</script>

<style lang="scss" module>
:global(.pc) .sidebar {
    background: #fff;
    box-shadow: 2px 0px 12px 0 rgb(0 0 0 / 10%);
    width: 235px;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    overflow: overlay;
    box-sizing: border-box;
    :global {
        .sidebar-in {
            padding-right: 15px;
        }
        a {
            display: block;
            padding: 12px;
            padding-left: 5px;
            padding-right: 20px;
            text-decoration: none;
            text-align: right;
            color: #666;
            border-right: 2px solid #eee;
            font-size: 14px;
            transition: all 0.2s;
            &.router-link-active {
                color: #409eff;
                border-color: #409eff;
            }
        }
    }
}
:global(.m) .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: #fff;
    z-index: 990;
    box-shadow: 0 2px 16px -8px rgb(0 0 0 / 10%);
    :global {
        .sidebar-scroll {
            position: absolute;
            left: 15px;
            right: 15px;
            top: 0;
            bottom: 0;
        }
        .sidebar-in {
            white-space: nowrap;
            width: auto;
        }
        a {
            height: 60px;
            border-bottom: 2px solid #fff;
            display: inline-flex;
            box-sizing: border-box;
            width: auto;
            font-size: 13px;
            vertical-align: top;
            color: #666;
            text-decoration: none;
            transition: all 0.2s;
            text-align: center;
            white-space: normal;
            padding: 10px;
            position: relative;
            justify-content: center;
            align-items: center;
            padding: 0 20px;
            padding-bottom: 15px;
            small {
                position: absolute;
                bottom: 5px;
                left: 0;
                right: 0;
                display: block;
            }
            &.router-link-active {
                color: #409eff;
                border-color: #409eff;
            }
        }
        .lr {
            & > div {
                position: absolute;
                top: 0;
                bottom: 0;
                width: 15px;
                color: #409eff;
                line-height: 60px;
                text-align: center;
                cursor: pointer;
                user-select: none;
            }
            .l {
                left: 0;
            }
            .r {
                right: 0;
            }
        }
    }
}
</style>
