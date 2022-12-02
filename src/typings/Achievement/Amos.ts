import {
    AchievementCategory as AmosAchievementCategory,
    Achievement as AmosAchievement,
} from '@/generated/amos-data/amos/achievements/typing'
export interface Achievement extends AmosAchievement {
    sub?: Achievement[]
}
export interface AchievementCategory extends AmosAchievementCategory {
    finished?: number
}
