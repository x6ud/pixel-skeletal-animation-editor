<template>
    <div class="properties">
        <div class="label">Color Picker</div>
        <div class="options">
            <label>
                <input type="checkbox" :checked="tool.referAllVisibleLayers" @change="setReferAllVisibleLayers">
                Refer All Visible Layers
            </label>
        </div>
    </div>
</template>

<script lang="ts">
    import ColorPickerProperties from './ColorPickerProperties'

    export default ColorPickerProperties;
</script>

<style lang="scss" scoped>
    .properties {
        .label {
            font-size: 12px;
            margin-bottom: 8px;
        }

        .options {
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
    }
</style>
