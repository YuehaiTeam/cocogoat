import { hasSimd } from './WasmFeatureCheck'

// 检查getDisplayMedia
export const hasGetDisplayMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)
// 检查PictureInPicture
export const hasPictureInPicture = !!document.pictureInPictureEnabled
// Safari
export const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
// Android
export const isAndroid = /android/i.test(navigator.userAgent)
// iOS
export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
// SIMD
export const hasSIMD = hasSimd()
// 本地
export const isLocal = process.env.VUE_APP_LOCALRES === 'true'
// 识别器需要getDisplayMedia和PictureInPicture，且不是Safari、Android、iOS，如是本地则需要SIMD
export const scannerCompatible =
    hasGetDisplayMedia && hasPictureInPicture && !isSafari && !isAndroid && !isIOS && (isLocal ? hasSIMD : true)
