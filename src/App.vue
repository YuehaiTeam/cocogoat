<template>
    <router-view />
    <scriptx src="https://static.geetest.com/v4/gt4.js"></scriptx>
</template>
<script>
import '@/style/theme.scss'
import '@/style/theme.element.scss'
export default {}
</script>
<style lang="scss">
html,
body,
#toki {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overscroll-behavior: none;
}
html,
body {
    overflow-x: hidden;
}
@font-face {
    font-family: genshin;
    src: url(./assets/genshin.woff) format('woff');
}
.el-message-box {
    max-width: 90%;
}
.feedback-notification .el-notification__content {
    font-size: 12px;
}
</style>
