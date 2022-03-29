import { stringify } from 'qs'
import { IArtifact } from '@/typings/Artifact'
import murmur from 'murmurhash-js/murmurhash3_gc'
export function setArtifactHash(artifact: IArtifact) {
    const hashObj = {
        set: artifact.set.toString(),
        slot: artifact.slot.toString(),
        level: artifact.level.toString(),
        stars: artifact.stars.toString(),
        mk: artifact.mainstat.key.toString(),
        mt: artifact.mainstat.type.toString(),
    } as Record<string, string>
    for (let i = 0; i < 4; i++) {
        hashObj[`sk${i}`] = artifact.substat[i] ? artifact.substat[i].key.toString() : ''
        hashObj[`st${i}`] = artifact.substat[i] ? artifact.substat[i].type.toString() : ''
        hashObj[`sv${i}`] = artifact.substat[i] ? artifact.substat[i].value.toString() : ''
    }
    // qs sort by key
    const st = stringify(hashObj, {
        sort: (a, b) => a.localeCompare(b),
    })
    artifact.hash = murmur(st).toString(16)
    return artifact.hash
}
