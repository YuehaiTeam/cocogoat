<template>
    <el-dropdown class="header-plain-dropdown" split-button @click="doExport('')">
        导出
        <template #dropdown>
            <el-dropdown-menu class="el-dropdown-menu--small">
                <el-dropdown-item @click="doExport('share')"> 分享链接 </el-dropdown-item>
                <el-dropdown-item @click="doExport('cocogoat.v2')"> 椰羊 JSON </el-dropdown-item>
                <el-dropdown-item @click="doExport('cocogoat')"> 椰羊 JSON（旧） </el-dropdown-item>
                <el-dropdown-item @click="doExport('excel')"> Excel 文件 </el-dropdown-item>
                <el-dropdown-item divided @click="doExport('uiaf')"> UIAF 1.1 JSON </el-dropdown-item>
                <el-dropdown-item @click="doExport('uiaf10')"> UIAF 1.0 JSON </el-dropdown-item>
                <el-dropdown-item divided @click="doExport('snapgenshin')"> Snap Genshin </el-dropdown-item>
                <el-dropdown-item @click="doExport('snaphutao')"> Snap Hutao </el-dropdown-item>
                <el-dropdown-item @click="doExport('xunkong')"> 寻空 </el-dropdown-item>
                <el-dropdown-item @click="doExport('qyinter')"> 原魔工具箱 </el-dropdown-item>
                <el-dropdown-item @click="doExport('paimon')"> Paimon.moe </el-dropdown-item>
                <el-dropdown-item @click="doExport('seelie')"> SEELIE.me </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>

    <el-dialog
        v-model="exportData.show"
        :title="exportData.title"
        :class="$style.exportDialog"
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
