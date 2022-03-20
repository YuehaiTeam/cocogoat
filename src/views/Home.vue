<template>
    <Layout :class="$style.home">
        <template #title><span style="font-family: genshin">椰羊 · 首页</span></template>
        <div :class="$style.root">
            <h1 :class="$style.title">
                椰羊cocogoat
                <small>纯网页圣遗物管理·成就扫描·更多功能开发中</small>
            </h1>
            <div>
                <div :class="$style.card">
                    <div class="card-title">额外工具</div>
                    <div class="card-body">
                        <router-link :class="$style.extraOne" to="/achievement/scan-and-export?to=paimon-moe">
                            <div class="circle">
                                <img src="@/assets/images/paimon.png" />
                                <div class="svg-w">
                                    <icon-achievement />
                                </div>
                            </div>
                            <div class="text">扫描成就并导出<br />到Paimon.moe</div>
                        </router-link>
                        <router-link
                            :class="$style.extraOne"
                            style="color: #7424c5"
                            to="/achievement/scan-and-export?to=seelie"
                        >
                            <div class="circle">
                                <img style="border-color: #cb98ff" src="@/assets/images/seelie.jpg" />
                                <div class="svg-w" style="background: #cb98ff">
                                    <icon-achievement style="fill: #7424c5" />
                                </div>
                            </div>
                            <div class="text">扫描成就并导出<br />到Seelie.me</div>
                        </router-link>
                        <router-link :class="$style.extraOne" style="color: #1e1e1e" :to="{ name: 'extra.playground' }">
                            <div class="circle">
                                <div class="img" style="border-color: #1e1e1e">
                                    <fa-icon icon="terminal" />
                                </div>
                                <div class="svg-w" style="background: #1e1e1e">
                                    <icon-cocogoat style="fill: #fff" />
                                </div>
                            </div>
                            <div class="text">OpenCV.js<br />Playground</div>
                        </router-link>
                    </div>
                </div>
            </div>
            <div :class="$style.cardList">
                <a :class="$style.card" href="http://github.com/yuehaiTeam/cocogoat" target="_blank">
                    <fa-icon :icon="['fab', 'github-alt']" />
                    <h4>开源地址</h4>
                    <div>本工具已在Github以BSD-3协议完全开源，可任意修改使用</div>
                </a>
                <a :class="$style.card" href="https://github.com/YuehaiTeam/cocogoat/tree/main/docs" target="_blank">
                    <fa-icon icon="infinity" />
                    <h4>接入文档</h4>
                    <div>本工具中各类扫描器组件均提供接口，可以嵌入到任何项目中</div>
                </a>
                <a :class="$style.card" href="http://77.cocogoat.work/web/" target="_blank">
                    <fa-icon icon="folder-tree" />
                    <h4>本地使用</h4>
                    <div>如需离线使用，请点这里下载本地专用版。</div>
                </a>
                <a :class="$style.card" href="https://jq.qq.com/?_wv=1027&k=5w1TPQL4" target="_blank">
                    <fa-icon :icon="['fab', 'qq']" />
                    <h4>反馈聊天</h4>
                    <div>无论功能反馈还是聊天吹水，都可以加入反馈群( 933468075 )</div>
                </a>
            </div>
            <div :class="$style.copyright">&copy;2022 YuehaiTeam <build-info /></div>
        </div>
    </Layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faInfinity, faFolderTree, faTerminal } from '@fortawesome/free-solid-svg-icons'
import { faGithubAlt, faQq } from '@fortawesome/free-brands-svg-icons'
library.add(faGithubAlt, faQq, faInfinity, faFolderTree, faTerminal)

import IconAchievement from '@/components/Icons/achievement.vue'
import IconCocogoat from '@/components/Icons/cocogoat.vue'
import BuildInfo from '@/components/BuildInfo.vue'

export default defineComponent({
    name: 'HomeView',
    components: {
        IconAchievement,
        IconCocogoat,
        BuildInfo,
    },
})
</script>
<style lang="scss" module>
.home {
    background: #eee;
}
.root {
    padding: 20px;
}
:global(.m) {
    .root {
        padding: 20px 5px;
    }
    .title {
        padding: 0;
        text-align: center;
        small {
            display: block;
            padding: 10px 0;
        }
    }
}
.title {
    margin: 0;
    color: #0079cc;
    font-family: genshin;
    font-weight: normal;
    font-size: 40px;
    padding: 15px;
    small {
        font-family: ui-serif;
        font-size: 15px;
        color: #555;
    }
}
.card-list {
    display: flex;

    @media screen and (max-width: 768px) {
        flex-wrap: wrap;
    }
}

.card {
    flex: 1;
    margin: 10px;
    background: #fff;
    border-radius: 3px;
    padding: 15px;
    box-shadow: var(--el-box-shadow-base);
    font-size: 14px;
    position: relative;
    color: #007acc;
    transition: all 0.3s;

    @media screen and (max-width: 768px) {
        min-width: 40%;
    }
    h4 {
        margin: 0;
        font-size: 30px;
        opacity: 0.5;
        position: absolute;
        top: 18px;
        right: 15px;
        text-align: right;
        vertical-align: top;
        font-weight: 100;
    }
    svg {
        font-size: 50px;
        display: block;
        height: 50px;
        width: 50px;
    }
    & > div {
        color: #555;
        margin-top: 15px;
    }
    @media screen and (max-width: 1000px) {
        h4 {
            font-size: 20px;
        }
        svg {
            font-size: 30px;
            height: 30px;
            width: 30px;
        }
    }
    :global {
        .card-title {
            margin-top: -5px;
            font-size: 17px;
            font-weight: normal;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }
    }
}
a.card {
    cursor: pointer;
    text-decoration: none !important;
    &:hover {
        transform: translateY(-5px);
    }
}
.extra-one {
    width: 120px;
    height: 148px;
    display: inline-block;
    box-sizing: border-box;
    padding: 10px;
    text-align: center;
    border-radius: 3px;
    transition: all 0.2s;
    color: #af7400;
    margin: 10px;
    text-decoration: none !important;
    &:hover {
        background: #eee;
    }
    :global {
        .text {
            font-size: 13px;
            line-height: 13px;
            padding-top: 10px;
        }
        .circle {
            position: relative;
            width: 88px;
            height: 88px;
            margin: 0 auto;
            padding-right: 5px;
            img,
            .img {
                width: 100%;
                height: 100%;
                border-radius: 100%;
                border: 2px solid #e3c996;
                &.img {
                    display: flex;
                    align-content: center;
                    justify-content: center;
                    align-items: center;
                    padding-bottom: 5px;
                    padding-right: 5px;
                    box-sizing: border-box;
                }
                .svg-inline--fa {
                    width: 35px;
                }
            }

            .svg-w {
                position: absolute;
                bottom: -5px;
                right: -5px;
                width: 40px;
                height: 40px;
                background: #e3c996;
                border-radius: 100%;
                svg {
                    width: 35px;
                    height: 32px;
                    display: block;
                    margin: 0 auto;
                    padding-top: 4px;
                    fill: #af7400;
                }
            }
        }
    }
}
.copyright {
    color: #555;
    font-size: 12px;
    text-align: center;
    margin-top: 10px;
}
</style>
