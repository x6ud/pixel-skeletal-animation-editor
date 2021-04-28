<template>
    <div class="menu"
         :class="{display, scrollable}"
         :style="style"
         ref="dom"
         @mousedown.stop
         tabindex="0"
         @keydown="onKeyDown"
         @contextmenu.prevent
    >
        <div class="scroll">
            <slot/>
        </div>
    </div>
</template>

<script lang="ts">
    import PopupMenu from './PopupMenu'

    export default PopupMenu;
</script>

<style lang="scss" scoped>
    .menu {
        position: fixed;
        z-index: 1000;
        min-width: 130px;
        background: #666;
        border: solid 1px #444;
        color: #fff;
        font-size: 14px;
        user-select: none;
        outline: none;

        &:not(.display) {
            display: none;
        }

        &.display {
            display: block;
        }

        &.scrollable {
            .scroll {
                position: absolute;
                left: 0;
                top: 0;
                right: -8px;
                bottom: 0;
                overflow-y: scroll;
            }
        }
    }
</style>
