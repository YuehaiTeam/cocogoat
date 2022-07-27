import { InferenceSession, registerBackend } from 'onnxruntime-web'
export async function createInference(model: string, webgl = false) {
    console.log(`[onnx] using ${webgl ? 'webgl' : 'wasm'} backend`)
    if (webgl) {
        const ortGl = await import('onnxruntime-web/lib/backend-onnxjs.js')
        registerBackend('webgl', ortGl.onnxjsBackend, -1)
        return await InferenceSession.create(model, { executionProviders: ['webgl'] })
    }
    return await InferenceSession.create(model)
}
