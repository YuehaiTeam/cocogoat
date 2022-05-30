import { ref } from 'vue'
import { apibase } from './apibase'

export default class DlUpdate {
    name = ref('')
    url = ref('')
    md5 = ref('')
    size = ref('')
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
}
