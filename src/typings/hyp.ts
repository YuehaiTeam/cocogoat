export interface HYPGame {
    biz: string
    biz_extra: string
    display: {
        background: {
            link: string
            url: string
        }
        icon: {
            hover_url: string
            link: string
            url: string
        }
        language: string
        logo: {
            link: string
            url: string
        }
        name: string
        subtitle: string
        thumbnail: {
            link: string
            url: string
        }
        title: string
    }
    display_status: string
    id: string
    reservation?: {
        link: string
    }
}

export interface HYPType {
    game_channel_sdks: Array<{
        channel_sdk_pkg: {
            decompressed_size: string
            md5: string
            size: string
            url: string
        }
        game: {
            biz: string
            biz_extra: string
            id: string
        }
        pkg_version_file_name: string
        version: string
    }>
    game_packages: Array<{
        game: {
            biz: string
            biz_extra: string
            id: string
        }
        main: {
            major: {
                audio_pkgs: Array<{
                    decompressed_size: string
                    language: string
                    md5: string
                    size: string
                    url: string
                }>
                game_pkgs: Array<{
                    decompressed_size: string
                    md5: string
                    size: string
                    url: string
                }>
                res_list_url: string
                version: string
            }
            patches: Array<{
                audio_pkgs: Array<{
                    decompressed_size: string
                    language: string
                    md5: string
                    size: string
                    url: string
                }>
                game_pkgs: Array<{
                    decompressed_size: string
                    md5: string
                    size: string
                    url: string
                }>
                res_list_url: string
                version: string
            }>
        }
        pre_download: {
            major?: {
                audio_pkgs: Array<{
                    decompressed_size: string
                    language: string
                    md5: string
                    size: string
                    url: string
                }>
                game_pkgs: Array<{
                    decompressed_size: string
                    md5: string
                    size: string
                    url: string
                }>
                res_list_url: string
                version: string
            }
            patches: Array<{
                audio_pkgs: Array<{
                    decompressed_size: string
                    language: string
                    md5: string
                    size: string
                    url: string
                }>
                game_pkgs: Array<{
                    decompressed_size: string
                    md5: string
                    size: string
                    url: string
                }>
                res_list_url: string
                version: string
            }>
        }
    }>
    games: HYPGame[]
    last_modified: string
}

export interface HYPGameItem extends HYPGame {
    game_channel_sdks: HYPType['game_channel_sdks']
    game_packages: HYPType['game_packages']
    biz_short: string
    biz_region: string
}
