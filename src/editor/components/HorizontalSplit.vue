<template>
    <div class="horizontal-split"
         @mousedown="onMouseDown"
         :class="{fixed}"
    ></div>
</template>

<script lang="ts">
    import HorizontalSplit from './HorizontalSplit'

    export default HorizontalSplit;
</script>

<style lang="scss" scoped>
    .horizontal-split {
        width: 3px;
        height: 100%;
        box-sizing: border-box;
        padding: 0 1px;
        cursor: ew-resize;

        &.fixed {
            cursor: default;
        }

        &:before {
            content: '';
            display: block;
            width: 100%;
            height: 100%;
            background-color: #444;
        }
    }
</style>
