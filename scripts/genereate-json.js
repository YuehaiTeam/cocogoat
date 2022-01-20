const fs = require('fs-extra')
const path = require('path')

const GENERATED_PATH = path.join(__dirname, '..', 'src', 'plugins', 'genshin-data', 'src', 'data')
const MIN_PATH = path.join(__dirname, '..', 'src', 'plugins', 'genshin-data', 'data')

function combineData() {
    const languages = fs.readdirSync(GENERATED_PATH)
    for (const lang of languages) {
        const folders = fs.readdirSync(path.join(GENERATED_PATH, lang))
        let data = {}
        for (const folder of folders) {
            if (!fs.existsSync(path.join(GENERATED_PATH, lang, folder))) continue
            data[folder] = []

            fs.readdirSync(`${GENERATED_PATH}/${lang}/${folder}`).forEach((filename) => {
                if (!filename.endsWith('.json')) return
                data[folder].push(require(path.join(GENERATED_PATH, lang, folder, filename)))
            })
            const newFilePath = path.join(MIN_PATH, lang, `${folder}.json`)
            fs.ensureDirSync(path.dirname(newFilePath))
            fs.writeFileSync(newFilePath, JSON.stringify(data[folder]))
            console.log(lang, `${folder}.json`)
        }
    }
}

combineData()
const achievementCN = fs.readJsonSync(path.join(MIN_PATH, 'chinese-simplified/achievements.json'))
achievementCN.forEach((c) => {
    delete c.name
    c.achievements.forEach((a) => {
        delete a.name
        delete a.desc
        a.categoryId = c.originalId || 0
    })
})
fs.ensureDirSync(path.dirname(path.join(MIN_PATH, 'no-language/achievements.json')))
fs.writeJSONSync(path.join(MIN_PATH, 'no-language/achievements.json'), achievementCN)
