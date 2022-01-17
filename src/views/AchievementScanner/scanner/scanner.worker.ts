import { Remote, wrap } from 'comlink'
import type { W } from './scanner.worker.expose'
export default function getWorker() {
    const worker = new Worker(new URL('./scanner.worker.expose.ts', import.meta.url))
    return wrap(worker) as Remote<typeof W>
}
