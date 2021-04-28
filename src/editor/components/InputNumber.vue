<template>
    <input type="text"
           class="input-number"
           :value="value"
           @input="onInput"
           @blur="onBlur"
    >
</template>

<script lang="ts">
    import InputNumber from './InputNumber'

    export default InputNumber;
</script>

<style lang="scss" scoped>
    .input-number {
        text-align: right;
    }
</style>
