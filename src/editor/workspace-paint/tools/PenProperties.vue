<template>
    <div class="properties">
        <div class="label">Blending Mode</div>
        <div class="modes">
            <label>
                <input type="radio" name="mode" value="0" :checked="tool.mode === 0" @change="setMode">
                Simple Ink
            </label>
            <label>
                <input type="radio" name="mode" value="1" :checked="tool.mode === 1" @change="setMode">
                Copy RGBA
            </label>
            <label>
                <input type="radio" name="mode" value="2" :checked="tool.mode === 2" @change="setMode">
                Lock Alpha
            </label>
        </div>

        <div class="label">Shape</div>
        <div class="brush-shape">
            <div class="rect"
                 :class="{active: tool.shape === 0}"
                 @click="setShape(0)"
            ></div>
            <div class="circle"
                 :class="{active: tool.shape === 1}"
                 @click="setShape(1)"
            ></div>
        </div>

        <div class="label">Size</div>
        <div class="brush-size"
             v-for="size in 24"
             :class="{active: size === tool.size, circle: tool.shape === 1}"
             @click="setSize(size)"
        >
            <div class="inner-wrapper">
                <div class="brush"
                     :style="{width: size + 'px', height: size + 'px'}"
                ></div>
            </div>
            <div class="text">{{size}}</div>
        </div>
    </div>
</template>

<script lang="ts">
    import PenProperties from './PenProperties'

    export default PenProperties;
</script>

<style lang="scss" scoped>
    .properties {
        .label {
            font-size: 12px;
            margin-bottom: 8px;
        }

        .modes {
            display: flex;
            flex-direction: column;
            margin-bottom: 8px;
            font-size: 12px;

            label {
                display: flex;
                align-items: center;

                &:not(:last-child) {
                    margin-bottom: 4px;
                }
            }
        }

        .brush-shape {
            display: flex;
            margin-bottom: 8px;

            .circle, .rect {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                transition: background-color .3s;

                &:hover {
                    background: #444;
                }

                &.active {
                    background-color: #666;
                }

                &:before {
                    content: '';
                    display: block;
                    width: 16px;
                    height: 16px;
                    background: #fff;
                }
            }

            .circle {
                &:before {
                    width: 18px;
                    height: 18px;
                    border-radius: 100%;
                }
            }
        }

        .brush-size {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            float: left;
            width: 40px;
            transition: background-color .3s;
            padding: 8px 0 4px 0;

            &:hover {
                background: #444;
            }

            &.active {
                background-color: #666;
            }

            .inner-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                overflow: hidden;

                .brush {
                    flex: 0 0 auto;
                    background: #fff;
                    max-width: 20px;
                    max-height: 20px;
                }
            }

            &.circle {
                .brush {
                    border-radius: 100%;
                }
            }

            .text {
                font-size: 8px;
                text-align: center;
            }
        }
    }
</style>
