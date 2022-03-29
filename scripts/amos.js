const path = require('path')
const giData = path.resolve(__dirname, '../.cache/GenshinData')
const output = path.resolve(__dirname, '../src/plugins/amos')
const amosSources = require('@yuehaiteam/amos/dist/utils/source')
const amosTextmap = require('@yuehaiteam/amos/dist/utils/textMap')
amosSources.writeFileHook = (file, data) => {
    if (file.endsWith('.json')) {
        let type = 'any'
        let importTxt = ''
        if (file.includes('achievements' + path.sep + 'index')) {
            importTxt = `import {AchievementCategory} from '@yuehaiteam/amos/dist/achievement/typing';`
            type = 'AchievementCategory[]'
        }
        if (file.includes('TextMap-')) {
            type = 'string[]'
        }
        return {
            file: file.replace('.json', '.ts'),
            data: `${importTxt}export default ${data} as ${type}`,
        }
    }
    return { file, data }
}
amosSources.setPaths(giData, output)
amosTextmap.setArrayMode(true)
require('@yuehaiteam/amos/dist/bin')
