<template>
    <div class="range">
        <div class="bar"
             ref="bar"
             tabindex="0"
             @keydown="onKeyDown"
             @mousedown="onMouseDown"
        >
            <div class="inner-wrapper"></div>
            <div class="cover" :style="coverStyle"></div>
            <div class="handler" :style="handlerStyle"></div>
        </div>
        <div class="text">{{percent}}</div>
    </div>
</template>

<script lang="ts">
    import OpacityRange from './OpacityRange'

    export default OpacityRange;
</script>

<style lang="scss" scoped>
    .range {
        display: flex;
        align-items: center;
        position: relative;
        height: 10px;
        user-select: none;

        .bar {
            flex: 1 1;
            min-width: 0;
            position: relative;
            z-index: 1;
            height: 8px;
            background: url("../../../assets/editor/paint/transparent-4x4.png");
            border: solid 1px #444;
            outline: 0;

            .inner-wrapper {
                position: absolute;
                z-index: 1;
                width: 100%;
                height: 100%;
                background: linear-gradient(to right, transparent, #888);
            }

            .cover {
                position: absolute;
                z-index: 2;
                top: 0;
                bottom: 0;
                right: 0;
                background: #333;
            }

            .handler {
                position: absolute;
                z-index: 3;
                top: -3px;
                bottom: -3px;
                width: 3px;
                margin-left: -1px;
                background: #666;
            }
        }

        .text {
            font-size: 12px;
            width: 2.5em;
            margin-left: .5em;
            text-align: right;
        }
    }
</style>
