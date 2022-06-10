import { ref, computed } from 'vue'
import { apibase } from './apibase'

export const formatSize = (size: number) => {
    if (size < 1024) {
        return size + 'B'
    } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(0) + 'KB'
    } else if (size < 1024 * 1024 * 1024) {
        return (size / 1024 / 1024).toFixed(1) + 'MB'
    } else {
        return (size / 1024 / 1024 / 1024).toFixed(2) + 'GB'
    }
}

export default class DlUpdate {
    name = ref('')
    url = ref('')
    md5 = ref('')
    size = ref(0)
    version = ref('')
    ready: Promise<this>
    constructor(name: string) {
        this.ready = this.updator(name).then(async (url) => {
            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                this.name.value = data.name
                this.url.value = data.url
                this.md5.value = data.md5
                this.size.value = data.size
                this.version.value = data.version
            } else {
                throw new Error(`${res.status} ${res.statusText}`)
            }
            return this
        })
    }
    updator(name: string) {
        return apibase(`/upgrade/${name}.json`)
    }
    formattedSize = computed(() => formatSize(this.size.value))
}
