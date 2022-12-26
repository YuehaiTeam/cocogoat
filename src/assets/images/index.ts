import img_1 from '@/assets/images/yuanshi.png'
import img_2 from '@/assets/openscreenshare.png'
export const imageAlias = {
    [img_1]:
        'https://upload-bbs.mihoyo.com/upload/2022/12/26/300350281/fb334cf8fd21e669ed6e7aa95890e2b5_2523388253479178875.png',
    [img_2]:
        'https://upload-bbs.mihoyo.com/upload/2022/12/26/300350281/aca41a90b6d80f17c9b2f1d663e49625_7075418291258186431.png',
} as Record<string, string>
export const imageType = {
    yuanshi: img_1,
    openscreenshare: img_2,
} as Record<string, string>
export default (image: string) => {
    const _image = imageType[image] || image
    return imageAlias[_image] || _image
}
