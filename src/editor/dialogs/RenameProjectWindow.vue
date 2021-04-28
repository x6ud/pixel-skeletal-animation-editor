<template>
    <popup-window title="Rename Project"
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
        </div>
        <template slot="buttons">
            <button @click="onOk">Ok</button>
        </template>
    </popup-window>
</template>

<script lang="ts">
    import RenameProjectWindow from './RenameProjectWindow'

    export default RenameProjectWindow;
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
                }
            }
        }
    }
</style>

</template>
