<template>
    <div :class="$style.sidebar">
        <el-scrollbar ref="scrollbarRef" class="sidebar-scroll">
            <div class="sidebar-in">
                <template v-for="i in achievementCat" :key="i.key || i.id">
                    <router-link
                        v-if="!hideFinished || (achievementFinStat[i.id || 0]?.count || 0) < i.achievements.length"
                        :to="{
                            params: {
                                cat: i.key,
                            },
                        }"
                        :active-class="i.key === DEFAULTCAT ? '' : 'router-link-active'"
                        :exact-active-class="i.key === DEFAULTCAT ? 'router-link-active' : ''"
                    >
                        <div>
                            {{ i.key === ALLCAT ? '所有' : amos[i.name] }}
                        </div>
                        <small>
                            <b>
                                <img :src="img('yuanshi')" alt="原石" />
                                {{
                                    i.key === ALLCAT
                                        ? totalFin?.reward || 0
                                        : achievementFinStat[i.id || 0]?.reward || 0
                                }}/{{ i.totalReward }}
                            </b>
                            <span>
                                {{
                                    i.key === ALLCAT ? totalFin?.count || 0 : achievementFinStat[i.id || 0]?.count || 0
                                }}/{{ i.achievements.length }} ({{
                                    Math.floor(
                                        ((i.key === ALLCAT
                                            ? totalFin?.count || 0
                                            : achievementFinStat[i.id || 0]?.count || 0) /
                                            i.achievements.length) *
                                            100,
                                    )
                                }}%)
                            </span>
                        </small>
                    </router-link>
                </template>
            </div>
        </el-scrollbar>
        <div v-if="isMobile" class="lr">
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
import img from '@/assets/images'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
library.add(faAngleLeft, faAngleRight)

import bus from '@/bus'
import { i18n } from '@/i18n'
import { ref, toRef, defineComponent } from 'vue'
import type { ElScrollbar } from 'element-plus'
export default defineComponent({
    props: ['achievementCat', 'achievementFinStat', 'hideFinished', 'totalFin'],
    setup() {
        const DEFAULTCAT = 'wonders-of-the-world'
        const ALLCAT = 'all'

        const scrollbarRef = ref<InstanceType<typeof ElScrollbar> | null>(null)
        const move = (dir: number) => {
            if (!scrollbarRef.value) return
            const delta = 50
            const move = delta * dir
            const div = scrollbarRef.value.wrapRef
            if (!div) return
            const newScrollLeft = div.scrollLeft + move
            scrollbarRef.value.setScrollLeft(Math.max(0, newScrollLeft))
        }
        return {
            img,
            move,
            scrollbarRef,
            isMobile: toRef(bus(), 'isMobile'),
            amos: toRef(i18n, 'amos'),
            DEFAULTCAT,
            ALLCAT,
        }
    },
})
</script>

<style lang="scss" module>
:global(.pc) .sidebar {
    background: var(--c-white);
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
            color: var(--c-text-mid);
            border-right: 2px solid var(--c-background);
            font-size: 14px;
            transition: all 0.2s;

            small {
                font-weight: bold;
                b {
                    padding: 0 3px;
                    border-radius: 4px;
                    display: inline-block;
                    font-weight: normal;
                    margin-right: 2px;
                    img {
                        width: 15px;
                        height: 15px;
                        float: left;
                    }
                }
            }
            &.router-link-active {
                color: var(--c-theme);
                border-color: var(--c-theme);
            }
        }
    }
}
:global(.m) .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 70px;
    background: var(--c-white);
    z-index: 50;
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
            height: 70px;
            border-bottom: 2px solid var(--c-white);
            display: inline-flex;
            box-sizing: border-box;
            width: auto;
            font-size: 13px;
            vertical-align: top;
            color: var(--c-text-sub);
            text-decoration: none;
            transition: all 0.2s;
            text-align: center;
            white-space: normal;
            padding: 10px;
            position: relative;
            justify-content: center;
            align-items: center;
            padding: 0 20px;
            padding-bottom: 30px;
            small {
                position: absolute;
                bottom: 5px;
                left: 0;
                right: 0;
                display: block;
                font-weight: bold;
                b {
                    padding: 0 3px;
                    border-radius: 4px;
                    display: inline-block;
                    font-weight: normal;
                    margin-right: 2px;
                    display: block;
                    img {
                        width: 14px;
                        height: 14px;
                        vertical-align: bottom;
                    }
                }
            }
            &.router-link-active {
                color: var(--c-theme);
                border-color: var(--c-theme);
            }
        }
        .lr {
            & > div {
                position: absolute;
                top: 0;
                bottom: 0;
                width: 15px;
                color: var(--c-theme);
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
