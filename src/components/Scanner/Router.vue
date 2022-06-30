<template>
    <router-view v-if="done" />
    <Loader v-else :source="source" :instance="instance" @done="done = true" />
</template>

<script lang="ts">
import { ref, defineComponent, PropType } from 'vue'

import Loader from '@/components/Scanner/Loader.vue'
export default defineComponent({
    components: {
        Loader,
    },
    props: {
        source: {
            type: String,
            required: true,
        },
        instance: {
            type: Function as PropType<
                () => {
                    initPromise: Promise<unknown>
                    onProgress: (handler: (progress: number) => unknown) => void
                }
            >,
            required: true,
        },
    },
    setup() {
        return {
            done: ref(false),
        }
    },
})
</script>
