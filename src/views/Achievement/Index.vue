<template>
    <Layout>
        <template #title>
            <div class="teleport-title">
                <span style="font-family: genshin">椰羊 · 成就</span>
            </div>
        </template>
        <template #actions>
            <div class="actions">
                <el-button v-show="!showScanner" class="import-button" size="default" plain @click="openImport">
                    <fa-icon icon="arrow-up-from-bracket" /> 导入
                </el-button>
                <div v-show="!showScanner" class="dropdown">
                    <el-dropdown class="header-plain-dropdown" split-button @click="doExport">
                        导出
                        <template #dropdown>
                            <el-dropdown-menu class="el-dropdown-menu--small">
                                <el-dropdown-item disabled class="export-title"> Paimon.moe </el-dropdown-item>
                                <el-dropdown-item @click="doExport('Mona')">代码</el-dropdown-item>
                                <el-dropdown-item divided disabled class="export-title"> Seelie.me </el-dropdown-item>
                                <el-dropdown-item @click="doExport('Mingyulab')">代码</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
                <el-button
                    size="default"
                    type="primary"
                    :plain="!showScanner"
                    style="margin-left: 10px"
                    @click="showScanner = !showScanner"
                >
                    <fa-icon icon="crosshairs" /> {{ showScanner ? '退出' : '' }}识别
                </el-button>
            </div>
        </template>
        <div v-if="showScanner" :class="$style.scannerArea">
            <iframe class="scanner-frame" :src="frameSrc"></iframe>
            <div class="scanner-back">
                <div class="scanner-box">
                    <div class="scanner-title">成就识别</div>
                </div>
            </div>
        </div>
        <el-empty description="施工中" />
    </Layout>
</template>

<script lang="ts">
import '@/styles/actions.scss'
import { ref, defineComponent } from 'vue'
import { faCrosshairs, faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { useRouter } from 'vue-router'
library.add(faCrosshairs, faArrowUpFromBracket)
export default defineComponent({
    name: 'ArtifactIndex',
    components: {},
    setup() {
        const selectedIds = ref<string[]>([])
        const showScanner = ref(false)
        const router = useRouter()
        const frameSrc = router.resolve({ name: 'frames.achievement.scan' }).href
        return {
            showScanner,
            selectedIds,
            frameSrc,
        }
    },
})
</script>
<style lang="scss" module>
.scanner-area {
    position: absolute;
    top: 50px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    overflow: hidden;
    :global {
        .scanner-frame {
            width: 100%;
            height: 100%;
            border: 0;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 2;
        }
        .scanner-back {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            .scanner-box {
                max-width: 100%;
                width: 600px;
                height: 650px;
                background: #fff;
                border-radius: 5px;
                margin: 0 auto;
                margin-top: calc(10vh - 60px);
                .scanner-title {
                    height: 40px;
                    line-height: 40px;
                    font-size: 20px;
                    padding-left: 20px;
                    padding-top: 10px;
                }
            }
        }
    }
}
:global(.pc) .scanner-area {
    left: 80px;
}
:global(.m) .scanner-area {
    bottom: 50px;
    :global {
        .scanner-box {
            margin-top: 0;
            height: 100%;
            border-radius: 0;
        }
    }
}
</style>
