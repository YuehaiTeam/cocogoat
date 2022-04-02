import { fromIMat, getCV, ICVMat, cvTranslateError } from '../cv'
import { Mat } from '../opencv'
let imageCache: Mat | null

export async function diffCached(image: ICVMat | false): Promise<number> {
    const cv = await getCV()
    try {
        if (image === false) {
            try {
                imageCache?.delete()
            } catch (e) {}
            imageCache = null
            return -1
        }
        if (!imageCache) {
            imageCache = fromIMat(cv, image)
            cv.cvtColor(imageCache, imageCache, cv.COLOR_RGBA2GRAY, 0)
            return -1
        }
        const sub = fromIMat(cv, image)
        cv.cvtColor(sub, sub, cv.COLOR_RGBA2GRAY, 0)
        cv.absdiff(imageCache, sub, sub)
        cv.threshold(sub, sub, 130, 255, cv.THRESH_BINARY)
        const res = cv.countNonZero(sub)
        sub.delete()
        imageCache = fromIMat(cv, image)
        cv.cvtColor(imageCache, imageCache, cv.COLOR_RGBA2GRAY, 0)
        return res
    } catch (e) {
        throw cvTranslateError(cv, e)
    }
}

export async function diffCachedA(image: ICVMat | false): Promise<number> {
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
    cv.adaptiveThreshold(sub, sub, 255, cv.ADAPTIVE_THRESH_GUASS_C, cv.THRESH_BINARY, 3, 4)
    const res = cv.countNonZero(sub)
    sub.delete()
    return res
}
