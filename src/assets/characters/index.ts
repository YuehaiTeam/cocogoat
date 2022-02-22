const characterImages = require.context('./', true, /(.*?)\.webp$/)
const characterImagesMap = {} as Record<string, string>
characterImages.keys().forEach((key) => {
    const name = key.replace(/^\.\/(.*?)\.webp$/, '$1')
    characterImagesMap[name] = characterImages(key)
})
export default characterImagesMap
