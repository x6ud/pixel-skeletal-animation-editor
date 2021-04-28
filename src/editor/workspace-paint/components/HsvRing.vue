<template>
    <div class="color-ring" :style="hueRingStyle">
        <div class="hue-ring"
             :style="hueRingStyle"
        >
            <canvas ref="canvasHueRing"
                    :width="ringSize"
                    :height="ringSize"
                    @mousedown.self="onHueRingMouseDown"
            ></canvas>
        </div>
        <div class="hue-ring-handler" :style="hueRingHandlerStyle"></div>
        <div class="sv-rect-wrapper"
             :style="svRectWrapperStyle"
        >
            <div class="sv-rect" :style="svRectStyle">
                <canvas ref="canvasSvRect"
                        :width="rectSize"
                        :height="rectSize"
                        @mousedown.self="onSvRectMouseDown"
                ></canvas>

                <div class="sv-rect-handler" :style="svRectHandlerStyle"></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import HsvRing from './HsvRing'

    export default HsvRing
</script>

<style lang="scss" scoped>
    .color-ring {
        position: relative;
        user-select: none;

        .hue-ring {
            position: absolute;
            z-index: 1;
            left: 0;
            top: 0;
            border-radius: 100%;
            overflow: hidden;
        }

        .hue-ring-handler {
            position: absolute;
            z-index: 10;
            top: 0;
            left: 50%;
            width: 1px;
            pointer-events: none;

            &:before {
                content: '';
                display: block;
                width: 3px;
                margin: -1px -2px;
                height: 14px;
                border: solid 1px #fff;
            }
        }

        .sv-rect-wrapper {
            position: absolute;
            z-index: 2;
            background-color: #333;
            border-radius: 100%;

            .sv-rect {
                position: relative;

                canvas {
                    position: absolute;
                    left: 0;
                    top: 0;
                    z-index: 1;
                }

                .sv-rect-handler {
                    position: absolute;
                    z-index: 10;

                    &:before {
                        content: '';
                        display: block;
                        width: 5px;
                        height: 5px;
                        margin: -3px 0 0 -3px;
                        border: solid 1px #000;
                        box-shadow: inset 0 0 0 1px #fff;
                        pointer-events: none;
                    }
                }
            }
        }
    }
</style>
