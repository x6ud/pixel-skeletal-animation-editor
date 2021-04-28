<template>
    <popup-window title="Canvas Background"
                  modal
                  closable
                  ref="window"
                  @close="onClose"
    >
        <div class="options">
            <div class="option"
                 v-for="(option, index) in colors"
                 :class="{active: index === selection}"
                 @click="selection = index"
            >
                <div class="box">
                    <div class="row">
                        <div class="color" :style="{background: option.color1}"></div>
                        <div class="color" :style="{background: option.color2}"></div>
                    </div>
                    <div class="row">
                        <div class="color" :style="{background: option.color2}"></div>
                        <div class="color" :style="{background: option.color1}"></div>
                    </div>
                </div>
            </div>
        </div>

        <template slot="buttons">
            <button @click="onOk">Ok</button>
        </template>
    </popup-window>
</template>

<script lang="ts">
    import CanvasBackgroundWindow from './CanvasBackgroundWindow'

    export default CanvasBackgroundWindow;
</script>

<style lang="scss" scoped>
    .options {
        display: flex;

        .option {
            padding: 12px;
            transition: background-color .3s;

            &:not(:last-child) {
                margin-right: 12px;
            }

            &:hover {
                background-color: #555;
            }

            &:active, &.active {
                background-color: #444;
            }

            .box {
                display: flex;
                flex-direction: column;
                width: 64px;
                height: 64px;
                border: solid 1px #000;

                .row {
                    display: flex;
                    height: 32px;

                    .color {
                        width: 32px;
                        height: 32px;
                    }
                }
            }
        }
    }
</style>
