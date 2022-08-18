import { underlineToCamelW } from '@/utils/caseConvert'

const list = [
    'Albedo',
    'Aloy',
    'Ambor',
    'Ayaka',
    'Ayato',
    'Barbara',
    'Beidou',
    'Bennett',
    'Chongyun',
    'Diluc',
    'Diona',
    'Eula',
    'Feiyan',
    'Fischl',
    'Ganyu',
    'Gorou',
    'Hutao',
    'Itto',
    'Kaeya',
    'Kazuha',
    'Keqing',
    'Klee',
    'Kokomi',
    'Lisa',
    'Mona',
    'Ningguang',
    'Noel',
    'Paimon',
    'Qin',
    'Qiqi',
    'Razor',
    'Rosaria',
    'Sara',
    'Sayu',
    'Shenhe',
    'Shougun',
    'Sucrose',
    'Tartaglia',
    'Tohma',
    'Venti',
    'Xiangling',
    'Xiao',
    'Xingqiu',
    'Xinyan',
    'Yae',
    'Yoimiya',
    'Yunjin',
    'Zhongli',
    'PlayerGirl',
    'PlayerBoy',
    'Shinobu',
    'Yelan',
]
const mapping = {
    traveler: 'PlayerGirl',
    raiden_shogun: 'Shougun',
    yanfei: 'Feiyan',
    amber: 'Ambor',
    noelle: 'Noel',
    jean: 'Qin',
    thoma: 'Tohma',
    yae_miko: 'Yae',
    kamisato_ayato: 'Ayato',
} as Record<string, string>
export const template =
    'https://upload-bbs.mihoyo.com/game_record/genshin/character_icon/UI_AvatarIcon_#.png?x-oss-process=image/crop,w_200,h_200,y_5,g_north'
export const characterIcon = (name: string) => {
    let n = ''
    if (mapping[name]) n = mapping[name]
    else if (list.includes(underlineToCamelW(name))) n = underlineToCamelW(name)
    else if (list.includes(underlineToCamelW(name.replace('_', '')))) n = underlineToCamelW(name.replace('_', ''))
    else if (list.includes(underlineToCamelW(name.split('_')[1]))) n = underlineToCamelW(name.split('_')[1])
    if (n === '') {
        n = name
    }
    return template.replace('#', n)
}
