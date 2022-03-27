import { defineStore } from 'pinia'
const bus = defineStore('bus', {
    state: () => ({
        isMobile: false,
    }),
})
export default bus
