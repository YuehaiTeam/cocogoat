<template>
    <el-tooltip :content="buildDesc" raw-content>#{{ buildTime }}</el-tooltip>
</template>
<script lang="ts">
import dayjs from 'dayjs'
export default {
    setup() {
        const build = dayjs(Number(process.env.VUE_APP_TIMESTAMP))
        const gitsha = process.env.VUE_APP_GIT_SHA
        const gitmsg = (process.env.VUE_APP_GIT_MSG || '') as string
        return {
            buildTime: process.env.VUE_APP_BUILD,
            buildDesc: `#${gitsha} - ${build.format('YYYY-MM-DD HH:mm:ss')}<br>${gitmsg.replace(/\n/g, '<br>')}`,
        }
    },
}
</script>
