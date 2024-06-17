<template>
    <div :class="$style.hypCard">
        <el-card v-if="(item?.game_channel_sdks?.length || 0) > 0" class="title-card" header="SDK（渠道服专用）">
            <a
                v-for="sdk in item?.game_channel_sdks"
                :key="sdk.channel_sdk_pkg.url"
                class="d-link"
                :href="sdk.channel_sdk_pkg.url"
                target="_blank"
                rel="noreferrer"
            >
                <div class="icon">
                    <fa-icon icon="house-laptop"></fa-icon>
                </div>
                <div class="center">
                    <div class="name">{{ sdk.version }}.zip</div>
                    <div class="meta">
                        <span> <fa-icon icon="file-zipper" /> {{ formatSize(Number(sdk.channel_sdk_pkg.size)) }}</span>
                        <span> <fa-icon icon="database" /> {{ formatSize(Number(sdk.channel_sdk_pkg.size)) }}</span>
                        <span> <fa-icon icon="hashtag" /> {{ sdk.channel_sdk_pkg.md5 }} </span>
                    </div>
                </div>
                <div class="right">
                    <fa-icon icon="angle-right"></fa-icon>
                </div>
            </a>
        </el-card>
        <template v-for="game in item?.game_packages" :key="game.game.id">
            <template v-for="m in major_types" :key="m">
                <div v-if="game[m] && game[m].major">
                    <el-card
                        class="title-card"
                        :header="`${m === 'main' ? '最新版本' : '预下载'}：${game[m].major?.version}`"
                    >
                        <a
                            v-if="game[m].major?.game_pkgs.length === 1"
                            class="d-link"
                            :href="game[m].major?.game_pkgs[0].url"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <div class="icon">
                                <fa-icon icon="box-open"></fa-icon>
                            </div>
                            <div class="center">
                                <div class="name">{{ basename(game[m].major?.game_pkgs[0].url || '') }}</div>
                                <div class="meta">
                                    <span>
                                        <fa-icon icon="file-zipper" />
                                        {{ formatSize(Number(game[m].major?.game_pkgs[0].size)) }}
                                    </span>
                                    <span>
                                        <fa-icon icon="database" />
                                        {{ formatSize(Number(game[m].major?.game_pkgs[0].decompressed_size)) }}
                                    </span>
                                    <span> <fa-icon icon="hashtag" /> {{ game[m].major?.game_pkgs[0].md5 }} </span>
                                </div>
                            </div>
                            <div class="right">
                                <fa-icon icon="angle-right"></fa-icon>
                            </div>
                        </a>
                        <div v-else class="d-seg">
                            <div class="d-text">
                                <div class="icon">
                                    <fa-icon icon="code-merge"></fa-icon>
                                </div>
                                <div class="center">
                                    <div class="name">分卷包</div>
                                    <div class="meta">
                                        <span>
                                            <fa-icon icon="file-zipper" /> 共
                                            {{
                                                formatSize(
                                                    game[m].major?.game_pkgs.reduce((a, b) => a + Number(b.size), 0) ||
                                                        0,
                                                )
                                            }}
                                        </span>
                                        <span>
                                            <fa-icon icon="database" /> 共
                                            {{
                                                formatSize(
                                                    game[m].major?.game_pkgs.reduce(
                                                        (a, b) => a + Number(b.decompressed_size),
                                                        0,
                                                    ) || 0,
                                                )
                                            }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="seg-list">
                                <a
                                    v-for="i in game[m].major?.game_pkgs"
                                    :key="i.url"
                                    :href="i.url"
                                    target="_blank"
                                    rel="noreferrer"
                                    class="d-link d-small"
                                >
                                    <div class="icon">
                                        <fa-icon icon="box-open"></fa-icon>
                                    </div>
                                    <div class="center">
                                        <div class="meta meta-slim">
                                            <span class="seg-name">{{ basename(i.url) }}</span>
                                            <span style="width: 250px"> <fa-icon icon="hashtag" /> {{ i.md5 }} </span>
                                            <span>
                                                <fa-icon icon="file-zipper" /> {{ formatSize(Number(i.size)) }}
                                            </span>
                                            <span>
                                                <fa-icon icon="database" />
                                                {{ formatSize(Number(i.decompressed_size)) }}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="right">
                                        <fa-icon icon="angle-right"></fa-icon>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <el-divider v-if="game[m].major?.audio_pkgs && (game[m].major?.audio_pkgs?.length || 0) > 0"
                            >语音包</el-divider
                        >
                        <a
                            v-for="i in game[m].major?.audio_pkgs"
                            :key="i.md5"
                            class="d-link list-link"
                            :href="i.url"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <div class="icon">
                                <fa-icon icon="file-audio"></fa-icon>
                            </div>
                            <div class="center">
                                <div class="name">{{ basename(i.url) }}</div>
                                <div class="meta">
                                    <span> <fa-icon icon="file-zipper" /> {{ formatSize(Number(i.size)) }}</span>
                                    <span>
                                        <fa-icon icon="database" /> {{ formatSize(Number(i.decompressed_size)) }}</span
                                    >
                                    <span> <fa-icon icon="hashtag" /> {{ i.md5 }} </span>
                                </div>
                            </div>
                            <div class="right">
                                <fa-icon icon="angle-right"></fa-icon>
                            </div>
                        </a>
                    </el-card>
                    <el-card v-for="z in game[m].patches" :key="z.version" class="title-card" header="增量包">
                        <a
                            v-for="i in z.game_pkgs"
                            :key="i.url"
                            class="d-link"
                            :href="i.url"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <div class="icon">
                                <fa-icon icon="calendar-plus"></fa-icon>
                            </div>
                            <div class="center">
                                <div class="name">{{ basename(i.url) }}</div>
                                <div class="meta">
                                    <span> <fa-icon icon="file-zipper" /> {{ formatSize(Number(i.size)) }}</span>
                                    <span>
                                        <fa-icon icon="database" /> {{ formatSize(Number(i.decompressed_size)) }}</span
                                    >
                                    <span> <fa-icon icon="hashtag" /> {{ i.md5 }} </span>
                                </div>
                            </div>
                            <div class="right">
                                <fa-icon icon="angle-right"></fa-icon>
                            </div>
                        </a>
                        <el-divider v-if="z.audio_pkgs.length > 0">语音包</el-divider>
                        <a
                            v-for="i in z.audio_pkgs"
                            :key="i.url"
                            class="d-link list-link"
                            :href="i.url"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <div class="icon">
                                <fa-icon icon="file-audio"></fa-icon>
                            </div>
                            <div class="center">
                                <div class="name">{{ basename(i.url) }}</div>
                                <div class="meta">
                                    <span> <fa-icon icon="file-zipper" /> {{ formatSize(Number(i.size)) }}</span>
                                    <span>
                                        <fa-icon icon="database" /> {{ formatSize(Number(i.decompressed_size)) }}</span
                                    >
                                    <span> <fa-icon icon="hashtag" /> {{ i.md5 }} </span>
                                </div>
                            </div>
                            <div class="right">
                                <fa-icon icon="angle-right"></fa-icon>
                            </div>
                        </a>
                    </el-card>
                </div>
            </template>
        </template>
    </div>
</template>

<script lang="ts">
import '@/styles/actions.scss'
import { defineComponent } from 'vue'
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
import { HYPGameItem } from '@/typings/hyp'
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
export default defineComponent({
    name: 'HYPCard',
    props: {
        item: Object as () => HYPGameItem,
    },
    setup() {
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
        const major_types = ['pre_download', 'main'] as const
        return {
            basename,
            formatSize,
            major_types,
        }
    },
})
</script>
<style lang="scss" module>
.hyp-card {
    :global(.dark) & {
        --el-bg-color: var(--el-bg-color-overlay);
    }
    :global {
        .title-card {
            margin: 20px;
        }
        .d-link,
        .d-text {
            display: block;
            text-decoration: none;
            border-radius: 5px;
            color: var(--c-text);
            box-sizing: border-box;
            position: relative;
            display: flex;
            align-items: center;
            transition: all 0.3s;

            .icon {
                font-size: 27px;
                height: 100%;
                float: left;
                line-height: 53px;
                width: 53px;
                text-align: center;
            }

            .right {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                opacity: 0.8;
                line-height: 53px;
                padding-right: 15px;
            }

            .meta {
                opacity: 0.7;
                font-size: 12px;
                span {
                    margin-right: 10px;
                    min-width: 80px;
                    display: inline-block;
                }
            }
            &.d-small {
                height: 35px;
                margin-top: 12px;
                .icon,
                .right {
                    font-size: 16px;
                    line-height: 33px;
                }
            }
        }
        .d-link {
            border: 1px solid var(--c-border);
            height: 55px;
            &:hover {
                color: #0079cc;
                border-color: #0079cc;
            }
            &.list-link {
                margin-bottom: 15px;
            }
        }
    }
}
:global(.m) .hyp-card {
    :global {
        .title-card {
            margin: 20px 0;
            .name {
                max-width: 60vw;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
    }
}
</style>
