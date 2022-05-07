<template>
    <div :class="$style.bar">
        <div class="bar-in" :style="{ width: `${progress}%` }"></div>
    </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'

export default defineComponent({
    setup(props, { expose }) {
        const progress = ref(0)
        const setProgress = (value: number) => {
            progress.value = value
        }
        expose({ setProgress })
        return {
            progress,
        }
    },
})
</script>

<style lang="scss" module>
.bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: #eee;
    :global(.bar-in) {
        height: 100%;
        background: #409eff;
        transition: all 0.3s;
    }
}
</style>
