import { Character } from '@yuehaiteam/amos/dist/character/typing'
import { IArtifactSet, IArtifactType } from '@yuehaiteam/amos/dist/artifact/typing'
export let artifactNames: { str: string; obj: { id: number; type: IArtifactType } }[] = []
export let artifactParams: { str: string; obj: string }[] = []
export let artifactCharacters: { str: string; obj: string }[] = []
export function initMap({
    map,
    params,
    characters,
    amos,
}: {
    map: IArtifactSet[]
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
        for (const i of e.contains) {
            artifactNames.push({
                str: amos[e.name],
                obj: { id: i.setId, type: i.type },
            })
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
