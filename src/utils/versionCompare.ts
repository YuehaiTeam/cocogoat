// format: x.x.x
export function versionCompare(a: string, b: string) {
    const aParts = a.split('.')
    const bParts = b.split('.')
    const len = Math.max(aParts.length, bParts.length)
    for (let i = 0; i < len; i++) {
        const aPart = parseInt(aParts[i], 10)
        const bPart = parseInt(bParts[i], 10)
        if (aPart === bPart) {
            continue
        }
        if (aPart === undefined) {
            return -1
        }
        if (bPart === undefined) {
            return 1
        }
        return aPart - bPart > 0 ? 1 : -1
    }
    return 0
}
