<template>
    <popup-window title="New"
                  modal
                  closable
                  ref="window"
                  @close="onClose"
    >
        <div class="form">
            <div class="form-elem">
                <div class="label">Title:</div>
                <div class="input">
                    <input type="text" v-model="name" maxlength="100"/>
                </div>
            </div>
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
        </div>
        <div class="note">
            <div class="label">
                Note:
            </div>
            <div class="content">
                This tool is design for small pixel style sprites.
                Creating a large size project may make the program run slowly.
            </div>
        </div>
        <template slot="buttons">
            <button @click="onOk">Ok</button>
        </template>
    </popup-window>
</template>

<script lang="ts">
    import CreateNewProjectWindow from './CreateNewProjectWindow'

    export default CreateNewProjectWindow;
</script>

<style lang="scss" scoped>
    .form {
        display: table;

        .form-elem {
            display: table-row;

            & > * {
                display: table-cell;
            }

            .label {
                text-align: right;
                padding: 4px 12px 4px 8px;
            }

            .input {
                padding: 4px 0;

                input {
                    height: 24px;
                    line-height: 24px;
                    padding: 0 8px;

                    &.input-number {
                        width: 90px;
                    }
                }
            }
        }
    }

    .note {
        display: flex;
        align-items: flex-start;
        margin-top: 8px;
        padding: 0 9px;
        width: 320px;
        box-sizing: border-box;
        font-size: 12px;
        opacity: .75;

        .label {
            margin-right: .5em;
        }

        .content {
            flex: 1 1;
        }
    }
</style>
