<template>
    <div class="vertical-split"
         @mousedown="onMouseDown"
         :class="{fixed}"
    ></div>
</template>

<script lang="ts">
    import VerticalSplit from './VerticalSplit'

    export default VerticalSplit;
</script>

<style lang="scss" scoped>
    .vertical-split {
        width: 100%;
        height: 3px;
        box-sizing: border-box;
        padding: 1px 0;
        cursor: ns-resize;

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
