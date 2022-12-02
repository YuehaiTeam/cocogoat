import { IArtifactType } from '@/generated/amos-data/amos/artifacts/typing'
export enum IStatType {
    static = 'static',
    percent = 'percent',
}

export enum IStatType {
    'hp',
    'atk',
    'def',
    'element', // 精通
    'recharge', // 充能
    'heal',
    'crit', // 暴击率
    'crit_dmg', // 暴击伤害
    'physical_dmg',
    'anemo_dmg',
    'geo_dmg',
    'electro_dmg',
    'hydro_dmg',
    'pyro_dmg',
    'cryo_dmg',
    'dendro_dmg',
}

// 包含数值的：hp,atk,def,精通
export const IStatTypeWithStatic = [IStatType.hp, IStatType.atk, IStatType.def, IStatType.element]

// 没有百分比的：精通
export const IStatTypeWithoutPercent = [IStatType.element]

export interface IArtifact {
    // UUID
    id: string
    // UUID
    hash: string
    //  套装
    set: number
    //  位置
    slot: IArtifactType
    //  等级
    level: number
    //  星级
    stars: number
    //  主词条
    mainstat: {
        key: string
        type: IStatType
    }
    //  副词条
    substat: {
        key: string
        type: IStatType
        value: number
    }[]
    //  锁
    locked: boolean
    //  角色
    character: string | null
}

export interface IArtifactDescItem {
    id: string
    name: string
    description: string
}

export interface IArtifactDesc {
    id: string
    name: string
    min_rarity: number
    max_rarity: number
    two_pc: string
    four_pc: string
    goblet?: IArtifactDescItem
    plume?: IArtifactDescItem
    circlet?: IArtifactDescItem
    flower?: IArtifactDescItem
    sands?: IArtifactDescItem
}
