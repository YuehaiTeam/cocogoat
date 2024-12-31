/// <reference types="node" />
import amosAchJson from '../src/generated/amos-data/amos/achievements/index.js'
import versionMeta_ from '../src/generated/versionMeta.json' with { type: "json" };
import fs from 'node:fs'
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = fileURLToPath(dirname(import.meta.url));
const versionMeta = versionMeta_ as Record<string, number>
const versionSet = Object.keys(versionMeta)
const newAchs = [] as number[];
amosAchJson.forEach((cat) => {
    cat.achievements.forEach(achs => {
        if (!versionSet.includes(achs.id.toString())) {
            newAchs.push(achs.id)
        }
    })
})
newAchs.sort((a, b) => a - b)
console.log("New Achievement Count:", newAchs.length)

if (!process.env.TARGET_VERSION || isNaN(Number(process.env.TARGET_VERSION))) {
    console.log("process.env.TARGET_VERSION not set, ignoring output");
} else {
    const newVersion = Number(process.env.TARGET_VERSION)
    for (const a of newAchs) {
        versionMeta[a.toString()] = newVersion
    }
    fs.writeFileSync(
        resolve(__dirname, '../src/generated/versionMeta.json'),
        JSON.stringify(versionMeta, Object.keys(versionMeta).sort(),
        4
    ));
}