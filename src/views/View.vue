<template>
    <div :class="{ [$style.fullHeight]: fullHeight, [$style.layout]: true }">
        <header :class="$style.componentHeader">
            <div :class="$style.appTitle"><slot name="title" /></div>
            <div v-if="!$root.isMobile" :class="$style.appActions"><slot name="actions" /></div>
            <el-popover v-else-if="$slots.actions" placement="bottom" width="auto" trigger="click">
                <template #reference>
                    <el-button :class="$style.btnActions" plain>
                        <svg viewBox="0 0 1024 1024">
                            <path
                                d="M737.984 537.344h-189.013333a12.672 12.672 0 0 0-12.650667 12.672v188.949333A179.349333 179.349333 0 0 0 714.666667 917.333333c111.936 0 202.666667-90.730667 202.666666-202.624a179.370667 179.370667 0 0 0-179.349333-177.344m-263.936-0.042666c-0.362667 0-0.704 0-1.066667 0.042666h-169.984A196.330667 196.330667 0 0 0 106.666667 732.650667a184.682667 184.682667 0 0 0 184.682666 184.661333h1.002667a194.325333 194.325333 0 0 0 194.325333-194.304v-174.016a12.672 12.672 0 0 0-12.629333-11.712M309.333333 106.709333C197.418667 106.666667 106.666667 197.397333 106.666667 309.290667a177.344 177.344 0 0 0 177.344 177.344h189.226666a12.672 12.672 0 0 0 12.672-12.672v-189.973334c0-97.664-78.933333-176.917333-176.576-177.344m434.730667 0a207.701333 207.701333 0 0 0-206.72 207.744v158.336a12.693333 12.693333 0 0 0 11.648 13.909334h162.645333A205.696 205.696 0 0 0 917.333333 279.957333 173.248 173.248 0 0 0 744.064 106.666667M422.677333 601.344v121.685333a131.264 131.264 0 0 1-38.421333 92.373334c-24.576 24.448-57.216 37.952-92.906667 37.952C224.789333 853.333333 170.666667 799.210667 170.666667 732.970667c0.384-72.618667 59.733333-131.669333 132.330666-131.669334h119.68m315.306667 0c62.890667 0 114.645333 51.157333 115.349333 113.365334 0 76.437333-62.208 138.666667-138.304 138.666666-62.890667-0.362667-114.368-51.84-114.709333-114.368v-137.664h137.664m6.229333-430.634666A108.501333 108.501333 0 0 1 821.333333 202.666667a108.778667 108.778667 0 0 1 32 77.568 142.634667 142.634667 0 0 1-41.258666 100.650666 142.613333 142.613333 0 0 1-100.437334 41.749334h-110.293333v-108.266667c0-78.805333 64.064-143.274667 142.869333-143.701333M309.184 170.666667a113.557333 113.557333 0 0 1 112.725333 113.322666v138.666667h-137.898666A113.493333 113.493333 0 0 1 170.666667 309.333333 138.794667 138.794667 0 0 1 309.184 170.666667"
                            ></path>
                        </svg>
                    </el-button>
                </template>
                <slot name="actions" />
            </el-popover>
        </header>
        <main :class="$style.componentMain">
            <slot />
        </main>
    </div>
</template>
<script>
export default {
    props: {
        fullHeight: {
            type: Boolean,
            default: false,
        },
    },
}
</script>
<style lang="scss" module>
.component-header {
    height: 50px;
    width: 100%;
    max-width: 100vw;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
    .app-title {
        padding-left: 100px;
        line-height: 50px;
        font-size: 20px;
        user-select: none;
        cursor: default;
    }
}
.full-height {
    height: 100vh;
    .component-main {
        height: 100%;
        box-sizing: border-box;
    }
}
.layout {
    min-height: 100vh;
    padding-top: 50px;
    padding-left: 80px;
    box-sizing: border-box;
    .component-main {
        height: 100%;
        box-sizing: border-box;
    }
}
:global(.m) {
    .layout {
        box-sizing: border-box;
        padding-bottom: 55px;
        padding-left: 0;
    }
    .app-title {
        padding-left: 60px;
    }

    .btn-actions {
        border-radius: 5px;
        width: 35px;
        height: 35px;
        text-align: center;
        padding: 0;
        border-color: #0079cc;
        color: #0079cc;
        position: absolute;
        right: 10px;
        top: 8px;
        &:hover {
            background: #0079cc;
            color: #fff;
        }
        svg {
            width: 23px;
            height: 23px;
            fill: currentColor;
        }
    }
}
:global(.pc) {
    .app-actions {
        height: 100%;
        position: absolute;
        top: 0;
        right: 150px;
        line-height: 48px;
        vertical-align: middle;
    }
}
</style>
