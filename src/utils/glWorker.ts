if (!globalThis.document) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.document = {}
}
if (!globalThis.document.createElement) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.document.createElement = (el: string) => {
        if (el === 'canvas') {
            return new OffscreenCanvas(1, 1)
        }
        throw new Error(`unsupported element ${el}`)
    }
}

export {}
