import { IArtifactDesc, IArtifactDescItem } from '@/typings/Artifact'
import { Character } from '@yuehaiteam/amos/dist/character/typing'
export let artifactNames: { str: string; obj: string[] }[] = []
export let artifactParams: { str: string; obj: string }[] = []
export let artifactCharacters: { str: string; obj: string }[] = []
export function initMap({
    map,
    params,
    characters,
    amos,
}: {
    map: IArtifactDesc[]
    params: Record<string, string>
    characters: Character[]
    amos: string[]
}) {
    artifactParams = []
    Object.keys(params).forEach((k) => {
        artifactParams.push({
            obj: k,
            str: params[k],
        })
    })
    artifactNames = []
    map.forEach((e) => {
        for (const i of ['circlet', 'goblet', 'sands', 'flower', 'plume']) {
            if (i in e) {
                artifactNames.push({
                    str: (e as unknown as Record<string, IArtifactDescItem>)[i].name,
                    obj: [e.id, i],
                })
            }
        }
    })
    artifactCharacters = []
    characters.forEach((e) => {
        artifactCharacters.push({
            obj: e.key,
            str: amos[e.name],
        })
    })
    console.log(
        'created artifact map with length=',
        artifactNames.length,
        artifactParams.length,
        artifactCharacters.length,
    )
}
