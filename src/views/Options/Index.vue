<template>
    <Layout :class="$style.options">
        <template #title><span style="font-family: genshin">设置</span></template>
        <el-tabs :model-value="$route.name" @update:model-value="$router.replace({ name: $event })">
            <el-tab-pane name="options.basic" label="基本设置"></el-tab-pane>
            <el-tab-pane name="options.user" label="账号管理"></el-tab-pane>
            <el-tab-pane name="options.sync" label="数据与云同步"></el-tab-pane>
            <el-tab-pane name="options.env" label="环境检测"></el-tab-pane>
        </el-tabs>
        <router-view />
    </Layout>
</template>

<script>
export default {
    setup() {
        return {}
    },
}
</script>

<style lang="scss" module>
.options {
    background: var(--c-background);
    :global {
        .el-tabs__nav-scroll {
            padding: 0 20px;
        }
    }
}
</style>
