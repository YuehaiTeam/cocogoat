const fsex = require('fs-extra')
const path = require('path')

const GENERATED_PATH = path.join(__dirname, '..', 'src', 'plugins', 'genshin-data', 'src', 'data')
const MIN_PATH = path.join(__dirname, '..', 'src', 'plugins', 'genshin-data', 'data')

async function combineData() {
    const languages = await fsex.readdir(GENERATED_PATH)
    const promises = []
    for (const lang of languages) {
        promises.push(
            (async () => {
                const folders = await fsex.readdir(path.join(GENERATED_PATH, lang))
                await fsex.ensureDir(path.join(MIN_PATH, lang))
                for (const folder of folders) {
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

combineData()
