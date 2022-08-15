import {
    AchievementCategory as AmosAchievementCategory,
    Achievement as AmosAchievement,
} from 'cocogoat-amos/dist/achievement/typing'
export interface Achievement extends AmosAchievement {
    sub?: Achievement[]
}
export interface AchievementCategory extends AmosAchievementCategory {
    finished?: number
}
