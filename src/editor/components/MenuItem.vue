<template>
    <div class="menu-item"
         ref="dom"
         @mouseover.stop="onMouseOver"
         :class="{'has-child': hasChild, active: subMenuDisplay, disabled, sep, popup}"
         @click="onClick"
    >
        <template v-if="!sep">
            <span class="name">{{name}}</span>
            <slot/>
        </template>
    </div>
</template>

<script lang="ts">
    import MenuItem from './MenuItem'

    export default MenuItem;
</script>

<style lang="scss" scoped>
    .menu-item {
        position: relative;
        padding: 4px 20px;
        transition: background-color .3s;
        white-space: nowrap;

        &:hover,
        &.active {
            background-color: #777;
        }

        &.disabled {
            background: transparent !important;
            opacity: .5;
        }

        &.sep {
            height: 1px;
            background: #fff !important;
            padding: 0 !important;
            margin: 2px 0;
            opacity: .1;
        }

        &.has-child:after {
            content: '';
            display: block;
            position: absolute;
            z-index: 1;
            top: 50%;
            right: 6px;
            border-top: solid 3px transparent;
            border-bottom: solid 3px transparent;
            border-left: solid 4px #fff;
        }

        &.popup {
            .name:after {
                content: '…';
            }
        }
    }
</style>
