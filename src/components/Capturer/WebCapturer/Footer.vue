<template>
    <div :class="$style.opensource">
        椰羊 | WebCapturer | <a href="https://github.com/YuehaiTeam/cocogoat" target="_blank">GitHub</a> |
        <a href="https://github.com/YuehaiTeam/cocogoat/tree/main/docs" target="_blank">集成文档</a> |
        <build-info />
    </div>
</template>

<script>
import BuildInfo from '@/components/BuildInfo.vue'
export default {
    components: {
        BuildInfo,
    },
}
</script>

<style lang="scss" module>
.opensource {
    text-align: center;
    font-size: 13px;
    margin-top: 20px;
    a {
        color: #6395c9;
        text-decoration: none;
    }
}
</style>
