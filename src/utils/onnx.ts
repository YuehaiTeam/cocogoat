import { InferenceSession } from 'onnxruntime-web/dist/ort.wasm-core.min.js'
export async function createInference(model: string, webgl = false) {
    console.log(`[onnx] using ${webgl ? 'webgl' : 'wasm'} backend`)
    if (webgl) {
        const ortGl = await import('onnxruntime-web/dist/ort.webgl.min.js')
        const _endsWith = String.prototype.endsWith
        if (!String.prototype.endsWith.toString().includes('ort')) {
            // eslint-disable-next-line no-extend-native
            String.prototype.endsWith = function (this: string, e) {
                if (e === '.ort') return true
                return _endsWith.call(this, e)
            }
        }
        const ins = await ortGl.InferenceSession.create(model, { executionProviders: ['webgl'] })
        if (String.prototype.endsWith.toString().includes('ort')) {
            // eslint-disable-next-line no-extend-native
            String.prototype.endsWith = _endsWith
        }
        return ins
    }
    return await InferenceSession.create(model)
}
