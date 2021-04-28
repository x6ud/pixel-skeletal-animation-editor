<template>
    <popup-window title="Canvas Size"
                  modal
                  closable
                  ref="window"
                  @close="onClose"
    >
        <div class="form">
            <div class="form-elem">
                <div class="label">Width:</div>
                <div class="input">
                    <input-number v-model="width" :min="1"/>
                    <span>px</span>
                </div>
            </div>
            <div class="form-elem">
                <div class="label">Height:</div>
                <div class="input">
                    <input-number v-model="height" :min="1"/>
                    <span>px</span>
                </div>
            </div>
            <div class="form-elem">
                <div class="label">Align:</div>
                <div class="input">
                    <table>
                        <tr>
                            <td>
                                <div class="cell tl"
                                     :class="{active: align === 'top-left'}"
                                     @click="align = 'top-left'"
                                ></div>
                            </td>
                            <td>
                                <div class="cell t"
                                     :class="{active: align === 'top'}"
                                     @click="align = 'top'"
                                ></div>
                            </td>
                            <td>
                                <div class="cell tr"
                                     :class="{active: align === 'top-right'}"
                                     @click="align = 'top-right'"
                                ></div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div class="cell l"
                                     :class="{active: align === 'left'}"
                                     @click="align = 'left'"
                                ></div>
                            </td>
                            <td>
                                <div class="cell c"
                                     :class="{active: align === 'center'}"
                                     @click="align = 'center'"
                                ></div>
                            </td>
                            <td>
                                <div class="cell r"
                                     :class="{active: align === 'right'}"
                                     @click="align = 'right'"
                                ></div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div class="cell bl"
                                     :class="{active: align === 'bottom-left'}"
                                     @click="align = 'bottom-left'"
                                ></div>
                            </td>
                            <td>
                                <div class="cell b"
                                     :class="{active: align === 'bottom'}"
                                     @click="align = 'bottom'"
                                ></div>
                            </td>
                            <td>
                                <div class="cell br"
                                     :class="{active: align === 'bottom-right'}"
                                     @click="align = 'bottom-right'"
                                ></div>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        <template slot="buttons">
            <button @click="onOk">Ok</button>
        </template>
    </popup-window>
</template>

<script lang="ts">
    import ResizeCanvasWindow from './ResizeCanvasWindow'

    export default ResizeCanvasWindow;
</script>

<style lang="scss" scoped>
    .form {
        display: table;

        .form-elem {
            display: table-row;

            & > * {
                display: table-cell;
                vertical-align: top;
            }

            .label {
                text-align: right;
                padding: 4px 12px 4px 8px;
                line-height: 24px;
            }

            .input {
                padding: 4px 0;

                input {
                    width: 90px;
                    height: 24px;
                    line-height: 24px;
                    text-align: right;
                    padding: 0 8px;
                }

                table {
                    border-spacing: 0;
                }

                .cell {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 26px;
                    height: 26px;
                    color: #fff;
                    transition: background-color .3s;

                    &:hover {
                        background-color: #555;
                    }

                    &:active, &.active {
                        background-color: #444;
                    }

                    &:before {
                        content: '';
                        display: block;
                        width: 12px;
                        height: 12px;
                        border: solid 2px transparent;
                    }

                    &.tl:before {
                        border-top-color: #fff;
                        border-left-color: #fff;
                    }

                    &.t:before {
                        border-top-color: #fff;
                    }

                    &.tr:before {
                        border-top-color: #fff;
                        border-right-color: #fff;
                    }

                    &.l:before {
                        border-left-color: #fff;
                    }

                    &.r:before {
                        border-right-color: #fff;
                    }

                    &.bl:before {
                        border-bottom-color: #fff;
                        border-left-color: #fff;
                    }

                    &.b:before {
                        border-bottom-color: #fff;
                    }

                    &.br:before {
                        border-bottom-color: #fff;
                        border-right-color: #fff;
                    }

                    &.c:before {
                        border-color: #fff;
                    }
                }
            }
        }
    }
</style>
