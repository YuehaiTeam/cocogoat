<template>
    <Router source="achievement" :instance="getScannerInstance" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Router from '@/components/Scanner/Router.vue'
import { getScannerInstance } from './scanner/scanner.worker'
export default defineComponent({
    components: {
        Router,
    },
    setup() {
        return {
            getScannerInstance,
        }
    },
})
</script>
