import { defineStore } from 'pinia'
const bus = defineStore('bus', {
    state: () => ({
        isMobile: false,
    }),
})
export default bus
export const $cocogoat = window.$cocogoat || { route: process.env.VUE_APP_ROUTER_HASH === 'true' ? 'hash' : 'history' }
