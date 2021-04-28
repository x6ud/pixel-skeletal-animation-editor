<template>
    <input type="range"
           :value="value"
           :max="max"
           :min="min"
           :step="step"
           @input="onInput"
    >
</template>

<script lang="ts">
    import NumberRange from './NumberRange'

    export default NumberRange;
</script>
