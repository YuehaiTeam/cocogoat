<template>
    <el-dropdown class="header-plain-dropdown" split-button @click="doExport('')">
        导出
        <template #dropdown>
            <el-dropdown-menu class="el-dropdown-menu--small">
                <el-dropdown-item class="export-title" @click="doExport('cocogoat.v2')"> 椰羊JSON </el-dropdown-item>
                <el-dropdown-item class="export-title" @click="doExport('share')"> 分享链接 </el-dropdown-item>
                <el-dropdown-item class="export-title" @click="doExport('cocogoat')"> 椰羊JSON(旧) </el-dropdown-item>
                <el-dropdown-item divided @click="doExport('snapgenshin')"> Snap Genshin </el-dropdown-item>
                <el-dropdown-item @click="doExport('paimon')"> Paimon.moe </el-dropdown-item>
                <el-dropdown-item @click="doExport('seelie')"> Seelie.me </el-dropdown-item>
                <el-dropdown-item divided class="export-title" @click="doExport('uiaf')"> UIAF JSON </el-dropdown-item>
                <el-dropdown-item divided class="export-title" @click="doExport('excel')"> Excel文件 </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>

    <el-dialog
        v-model="exportData.show"
        :title="exportData.title"
        :custom-class="$style.exportDialog"
        append-to-body
        destroy-on-close
    >
        <el-input type="textarea" :model-value="exportData.content"></el-input>
    </el-dialog>
</template>
<script lang="ts">
import { useExportAchievements } from './useExport'
import { defineComponent } from 'vue'
export default defineComponent({
    setup() {
        return {
            ...useExportAchievements(),
        }
    },
})
</script>
<style lang="scss" module>
.export-dialog {
    width: 500px !important;
    max-width: 90%;
    textarea {
        font-size: 12px;
        height: 350px;
        font-family: Consolas, monospace;
    }
}
</style>
