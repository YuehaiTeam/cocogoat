import * as ort from 'onnxruntime-web/dist/ort.wasm-core.min.js'
import ocrString from '@/plugins/yas/yas.txt?raw&dictcompress'

import resources from '@/resources'

import { ICVMat } from '@/utils/cv'

const ocrMap: string[] = ocrString.trim().split('')

ort.env.wasm.wasmPaths = resources
// disable MultiThreading
ort.env.wasm.numThreads = 1

let session: ort.InferenceSession | null = null

export function transform(data: Uint8Array) {
    return Float32Array.from(data.map((x) => x / 255))
}

export async function init() {
    session = await ort.InferenceSession.create(resources['yas.ort'])
    return session
}

export async function recognize(data: ICVMat) {
    if (!session) await init()
    if (session) {
        if (data.rows !== 32 || data.cols !== 384) {
            throw new Error('Wrong mat size')
        }
        const tensor = new ort.Tensor(transform(data.data), [1, 1, 32, 384])
        const feeds = { [session.inputNames[0]]: tensor }
        const results = await session.run(feeds)
        const output = results[session.outputNames[0]].data as Float32Array
        const predict_shape = results[session.outputNames[0]].dims
        let count = 0
        let score = 0
        const str_res = []
        let last_word = ''
        for (let n = 0; n < predict_shape[0]; n++) {
            const slice = output.slice(n * predict_shape[2], (n + 1) * predict_shape[2])
            const max_value = Math.max(...slice)
            const argmax_idx = slice.indexOf(max_value)
            const word = ocrMap[argmax_idx]
            if (argmax_idx > 0 && last_word !== word) {
                score += 1 + max_value
                count += 1
                str_res.push(word)
            }
            last_word = word
        }
        return {
            text: str_res.join(''),
            confidence: parseFloat(((score / count) * 100).toFixed(2)),
        }
    } else {
        throw new Error('init faild')
    }
}
