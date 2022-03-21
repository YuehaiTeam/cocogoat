import { fromIMat, getCV, ICVMat } from '../cv'
import { Mat } from '../opencv'
let imageCache: Mat | null

export async function diffCached(image: ICVMat | false): Promise<number> {
    if (image === false) {
        try {
            imageCache?.delete()
        } catch (e) {}
        imageCache = null
        return -1
    }
    const cv = await getCV()
    if (!imageCache) {
        imageCache = fromIMat(cv, image)
        cv.cvtColor(imageCache, imageCache, cv.COLOR_RGBA2GRAY, 0)
        return -1
    }
    const sub = fromIMat(cv, image)
    cv.cvtColor(sub, sub, cv.COLOR_RGBA2GRAY, 0)
    cv.absdiff(imageCache, sub, sub)
    cv.threshold(sub, sub, 150, 255, cv.THRESH_BINARY)
    const res = cv.countNonZero(sub)
    sub.delete()
    return res
}
