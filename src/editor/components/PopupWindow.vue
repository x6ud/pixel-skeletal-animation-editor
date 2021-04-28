<template>
    <div class="popup-window-mask"
         :class="{modal, visible}"
    >
        <div class="window"
             :style="windowStyle"
             ref="window"
        >
            <div class="window-title"
                 @mousedown="onWindowTitleMouseDown"
            >
                <div class="title">{{title}}</div>
                <button class="btn-close"
                        v-if="closable"
                        @mousedown.stop
                        @click="onBtnCloseClick"
                ></button>
            </div>
            <div class="window-body">
                <slot/>
            </div>
            <div class="window-buttons">
                <slot name="buttons"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import PopupWindow from './PopupWindow'

    export default PopupWindow;
</script>

<style lang="scss" scoped>
    .popup-window-mask {
        display: none;

        &.visible {
            display: block;
        }

        &.modal {
            position: fixed;
            z-index: 2000;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
        }

        & > .window {
            position: fixed;
            display: flex;
            flex-direction: column;
            background: #666;
            border: solid 1px #444;
            font-size: 14px;
            color: #fff;
            user-select: none;

            & > .window-title {
                display: flex;
                align-items: center;
                background: #444;
                padding: 4px 4px 4px 12px;

                .title {
                    flex: 1 1;
                }

                .btn-close {
                    width: 24px;
                    height: 24px;
                    line-height: 24px;
                    padding: 0;
                    margin: 0 0 0 4px;
                    border: none;
                    background: transparent;
                    color: #fff;
                    outline: none;
                    transition: background-color .3s;

                    &:before {
                        content: '×';
                        font-size: 20px;
                    }

                    &:hover {
                        background-color: #555;
                    }

                    &:active {
                        background-color: #333;
                    }
                }
            }

            & > .window-body {
                padding: 6px 12px;
                min-width: 320px;
                box-sizing: border-box;
            }

            & > .window-buttons {
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 6px 12px 12px 12px;

                & /deep/ button {
                    box-sizing: border-box;
                    padding: 4px 12px;
                    border: none;
                    background: #444;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                    transition: background-color .3s;

                    &:not(:last-child) {
                        margin-right: 8px;
                    }

                    &:hover {
                        background-color: #555;
                    }

                    &:active {
                        background-color: #222;
                    }
                }
            }
        }
    }
</style>
