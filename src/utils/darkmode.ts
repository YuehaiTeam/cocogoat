import { ref, watch } from 'vue'
export const currentMode = ref('')
export const configuredMode = ref(
    localStorage.getItem('cocogoat.theme') ||
        (location.hash.includes('theme=dark') ? 'dark' : location.hash.includes('theme=light') ? 'light' : 'auto'),
)
function checkMode(cmode: string) {
    let mode = cmode
    if (mode === 'auto') {
        const darkMode = window.matchMedia('(prefers-color-scheme: dark)')
        mode = darkMode.matches ? 'dark' : 'light'
    }
    if (mode === 'dark') {
        document.body.classList.add('dark')
        currentMode.value = 'dark'
    } else {
        document.body.classList.remove('dark')
        currentMode.value = 'light'
    }
}
const darkMode = window.matchMedia('(prefers-color-scheme: dark)')
// eslint-disable-next-line vue/no-ref-object-destructure
checkMode(configuredMode.value)
darkMode.addEventListener('change', () => {
    checkMode(configuredMode.value)
})
watch(configuredMode, (cmode) => {
    if (cmode === 'auto') {
        localStorage.removeItem('cocogoat.theme')
    } else {
        localStorage.setItem('cocogoat.theme', cmode)
    }
    checkMode(cmode)
})
