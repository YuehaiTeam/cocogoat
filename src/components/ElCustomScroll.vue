<template>
    <ElScrollbar v-bind="$attrs" @scroll="$emit('custom-scroll', $event)">
        <slot />
    </ElScrollbar>
</template>

<script>
export default {
    inheritAttrs: false,
    emits: ['custom-scroll'],
    setup() {
        return {
            getCustomScrollEl(el) {
                return el.querySelector('.el-scrollbar__wrap') || el
            },
        }
    },
}
</script>
