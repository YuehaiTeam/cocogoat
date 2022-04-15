const fsex = require('fs-extra')
const path = require('path')

const GENERATED_PATH = path.join(__dirname, '..', 'src', 'plugins', 'genshin-data', 'src', 'data')
const MIN_PATH = path.join(__dirname, '..', 'src', 'plugins', 'genshin-data', 'data')

const langs = ['chinese-simplified', 'english']
const only = ['artifacts']

async function combineData() {
    const promises = []
    for (const lang of langs) {
        promises.push(
            (async () => {
                const folders = await fsex.readdir(path.join(GENERATED_PATH, lang))
                await fsex.ensureDir(path.join(MIN_PATH, lang))
                for (const folder of folders) {
                    if (!only.includes(folder)) continue
                    if (!(await fsex.pathExists(path.join(GENERATED_PATH, lang, folder)))) continue
                    let data = []
                    const files = await fsex.readdir(`${GENERATED_PATH}/${lang}/${folder}`)
                    files.forEach((filename) => {
                        if (!filename.endsWith('.json')) return
                        let jsondata = require(path.join(GENERATED_PATH, lang, folder, filename))
                        if (folder === 'characters') {
                            jsondata = {
                                id: jsondata.id,
                                name: jsondata.name,
                                title: jsondata.title,
                                element: jsondata.element,
                                rarity: jsondata.rarity,
                            }

                            if (jsondata.id === 'traveler_anemo') {
                                data.push({
                                    id: 'traveler',
                                    name: jsondata.name.split(' ')[0],
                                    title: '',
                                    element: '',
                                    rarity: 5,
                                })
                                return
                            } else if (jsondata.id.includes('traveler')) {
                                return
                            }
                        }
                        if (folder === 'achievements') {
                            processAchievement(jsondata)
                        }
                        data.push(jsondata)
                    })
                    const newFilePath = path.join(MIN_PATH, lang, `${folder}.json`)
                    await fsex.writeJSON(newFilePath, data)
                    console.log(lang, `${folder}.json`)
                }
            })(),
        )
    }
    await Promise.all(promises)
}
const deprecated = {
    81006: 85000,
    81007: 85001,
    81008: 85002,
    81009: 85003,
    81011: 85004,
    81012: 85005,
    81013: 85006,
}
const depids = Object.keys(deprecated).map((e) => Number(e))
function processAchievement(jsondata) {
    jsondata.achievements = jsondata.achievements.filter(
        (e) => ![84027, 82011, 82016, 82018, 84517, 84521, ...depids].includes(e.id),
    )
    jsondata.totalReward = 0
    jsondata.achievements.forEach((e) => {
        e.postStage = jsondata.achievements.find((p) => p.preStage === e.id)?.id
        jsondata.totalReward += e.reward || 0
    })
}
combineData()
