<template>
    <div class="dropdown-wrapper"
         @mousedown.stop
    >
        <div class="trigger"
             ref="trigger"
             @mousedown="showDropdown"
        >
            <slot name="trigger"/>
        </div>
        <div class="drop"
             v-if="displayDrop"
             ref="drop"
             :style="dropStyle"
        >
            <slot name="dropdown"/>
        </div>
    </div>
</template>

<script lang="ts">
    import BaseDropdown from './BaseDropdown'

    export default BaseDropdown;
</script>

<style lang="scss" scoped>
    .dropdown-wrapper {
        display: inline-block;

        & > .trigger {
            display: inline-block;
            width: 100%;
        }

        & > .drop {
            position: fixed;
            z-index: 1000;
            overflow: auto;
            background-color: #555;
            border: solid 1px #444;
        }
    }
</style>
