<template>
    <div class="animation"
         :class="{selected: animation === selected, 'indicator-1': showDragIndicator1, 'indicator-2': showDragIndicator2}"
         @click="select"
         ref="animation"
         @mousedown="onDragStart"
         @mouseover="onMouseOver"
         @mousemove="onMouseMove"
    >
        <div class="icon"></div>
        <div class="name">
            <div class="text" v-if="!showInput" @dblclick="onNameDbClick">{{animation.name}}</div>
            <input type="text"
                   v-model="inputValue"
                   v-if="showInput"
                   @focusout="onInputLostFocus"
                   @keydown="onInputKeyDown"
                   ref="input"
                   maxlength="100"
            >
        </div>
    </div>
</template>

<script lang="ts">
    import AnimationsListItem from './AnimationsListItem'

    export default AnimationsListItem;
</script>

<style lang="scss" scoped>
    .animation {
        display: flex;
        align-items: center;
        height: 32px;
        line-height: 32px;
        padding: 0 8px;
        position: relative;

        &.indicator-1:before,
        &.indicator-2:before {
            content: '';
            display: block;
            position: absolute;
            z-index: 1;
            left: 0;
            right: 0;
            height: 2px;
            background: darkred;
            pointer-events: none;
        }

        &.indicator-1:before {
            top: 0;
        }

        &.indicator-2:before {
            bottom: 0;
        }

        &:hover {
            background-color: #444;
        }

        &.selected {
            background-color: #666;
        }

        .icon {
            width: 24px;
            height: 24px;
            background: url("../../../assets/editor/animate/animation/animation.png") center center no-repeat;
            margin: 0 4px 0 0;
        }

        .name {
            flex: 1 1;
            min-width: 0;

            .text {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            input {
                width: 100%;
                height: 24px;
            }
        }
    }
</style>
