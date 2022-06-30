const path = require('path')
const giData = path.resolve(__dirname, '../.cache/GenshinData')
const output = path.resolve(__dirname, '../src/plugins/amos')
const amosSources = require('cocogoat-amos/dist/utils/source')
const amosTextmap = require('cocogoat-amos/dist/utils/textMap')
amosSources.writeFileHook = (file, data) => {
    if (file.endsWith('.json')) {
        let type = 'any'
        let importTxt = ''
        if (file.includes('achievements' + path.sep + 'index')) {
            importTxt = `import {AchievementCategory} from 'cocogoat-amos/dist/achievement/typing';`
            type = 'AchievementCategory[]'
        }
        if (file.includes('achievements' + path.sep + 'partial')) {
            importTxt = `import {IPartialAchievementList} from 'cocogoat-amos/dist/achievement-partial/typing';`
            type = 'IPartialAchievementList'
        }
        if (file.includes('characters' + path.sep + 'index')) {
            importTxt = `import {Character} from 'cocogoat-amos/dist/character/typing';`
            type = 'Character[]'
        }
        if (file.includes('artifact' + path.sep + 'index')) {
            importTxt = `import {IArtifactSet} from 'cocogoat-amos/dist/artifact/typing';`
            type = 'IArtifactSet[]'
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
const amosMain = require('cocogoat-amos/dist/bin')
amosMain(['node', 'amos', '-l', 'CHS', 'EN'])
