<template>
    <router-view v-if="done" />
    <Loader v-else />
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import Loader from './Common/Loader.vue'
export default defineComponent({
    components: {
        Loader,
    },
    setup() {
        return {
            done: ref(false),
        }
    },
})
</script>
