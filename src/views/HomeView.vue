<template>
    <div class="home">
        <router-link to="/achievement/scan-and-export?to=paimon-moe">成就扫描到Paimon.moe</router-link>
        <router-link to="/achievement/scan-and-export?to=seelie">成就扫描到Seelie.me</router-link>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'HomeView',
    components: {},
})
</script>
