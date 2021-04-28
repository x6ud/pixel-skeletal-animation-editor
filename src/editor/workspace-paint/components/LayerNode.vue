<template>
    <div class="layer-wrapper">
        <div class="layer"
             :class="{selected: layer === selected || showDropFolderIndicator, 'indicator-1': showDragIndicator1, 'indicator-2': showDragIndicator2}"
             @click="selectLayer"
             @mousedown="onDragStart"
             @mouseover="onMouseOver"
             @mousemove="onMouseMove"
             ref="layer"
        >
            <div class="visibility"
                 :class="{visible: layer.visible}"
                 @click="toggleVisibility"
            ></div>

            <div class="padding" :style="{'padding-right': deep * 16 + 'px'}"></div>

            <div class="icon"
                 :class="{expanded: layer.expanded, folder: !!layer.children}"
                 @click="layer.expanded = !layer.expanded"
            >
            </div>

            <div class="properties">
                <div class="state">{{layer.opacity | percent}}</div>
                <div class="name">
                    <div class="text"
                         v-if="!showInput"
                         @dblclick="onNameDbClick"
                    >
                        {{layer.name}}
                    </div>
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
        </div>

        <div class="children"
             v-if="layer.children && layer.children.length"
             :style="{display: layer.expanded ? 'block' : 'none'}"
        >
            <layer-tree :layers="layer.children"
                        :deep="deep + 1"
                        :root="root"
                        :selected="selected"
                        ref="layerTree"
            />
        </div>
    </div>
</template>

<script lang="ts">
    import LayerNode from './LayerNode'

    export default LayerNode;
</script>

<style lang="scss" scoped>
    .layer-wrapper {
        width: 100%;
        user-select: none;

        &:not(:last-child) {
            border-bottom: solid 1px #444;
        }

        .layer {
            display: flex;
            position: relative;
            width: 100%;
            height: 36px;
            font-size: 12px;

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

            .visibility {
                width: 26px;
                height: 100%;
                border-right: solid 1px #444;
                background: url("../../../assets/editor/paint/layer/invisible.png") center center no-repeat;

                &.visible {
                    background: url("../../../assets/editor/paint/layer/visible.png") center center no-repeat;
                }
            }

            .padding {
                flex: 0 0;
            }

            .icon {
                width: 26px;
                height: 100%;
                border-right: solid 1px #444;
                background: url("../../../assets/editor/paint/layer/layer.png") center center no-repeat;

                &.folder {
                    background: url("../../../assets/editor/paint/layer/folder-closed.png") center center no-repeat;

                    &.expanded {
                        background: url("../../../assets/editor/paint/layer/folder-opened.png") center center no-repeat;
                    }
                }
            }

            .properties {
                flex: 1 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                min-width: 0;

                .state {
                    flex: 1 1;
                    display: flex;
                    align-items: flex-end;
                    width: 100%;
                    min-height: 0;
                    padding: 0 8px;
                    box-sizing: border-box;
                }

                .name {
                    flex: 1 1;
                    min-height: 0;

                    .text {
                        width: 100%;
                        height: 100%;
                        padding: 0 8px;
                        min-width: 60px;
                        box-sizing: border-box;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                    }

                    input {
                        width: 100%;
                        height: 100%;
                        padding: 0 8px;
                        box-sizing: border-box;
                        font-size: 12px;
                    }
                }
            }
        }

        .children {
            border-top: solid 1px #444;
        }
    }
</style>
