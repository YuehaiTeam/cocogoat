<template>
    <div>
        <Loader v-if="(load = false)" @done="load = true" />
    </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import Loader from '../Common/Loader.vue'

export default defineComponent({
    components: {
        Loader,
    },
    setup() {
        const load = ref(false)
        return {
            load,
        }
    },
})
</script>

<style lang="scss" scoped></style>
