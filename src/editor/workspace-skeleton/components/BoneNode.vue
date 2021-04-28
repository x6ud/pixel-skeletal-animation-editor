<template>
    <div class="bone-node">
        <div class="bone"
             :class="{selected: selected === bone || showDropIndicator, 'indicator-1': showDragIndicator1, 'indicator-2': showDragIndicator2}"
             ref="bone"
             @click="select"
             @mousedown="onDragStart"
             @mouseover="onMouseOver"
             @mousemove="onMouseMove"
        >
            <div class="visibility"
                 :class="{visible: bone.visible}"
                 @click.stop="toggleVisibility"
            ></div>
            <div class="padding" :style="{'padding-right': (deep * 16 + 4) + 'px'}"></div>
            <div class="expand"
                 :class="{expanded: bone.expanded, 'has-child': bone.children && bone.children.length}"
                 @click="bone.expanded = !bone.expanded"
            ></div>
            <div class="info">
                <div class="row bone">
                    <div class="icon bone"
                         v-if="bone.id >= 0"
                         :class="{visible: bone.boneVisible}"
                         @click.stop="toggleBoneVisibility"
                         title="Toggle bone visibility"
                    ></div>
                    <div class="name">
                        <div class="text"
                             @dblclick="onNameDbClick"
                             v-if="!showNameInput"
                        >
                            {{bone.name}}
                        </div>
                        <input type="text"
                               v-model="nameInputValue"
                               v-if="showNameInput"
                               @focusout="onNameInputLostFocus"
                               @keydown="onNameInputKeyDown"
                               ref="inputName"
                        >
                    </div>
                </div>

                <div class="row image" v-if="bone.id >= 0">
                    <div class="icon image"
                         :class="{visible: bone.imageVisible}"
                         @click.stop="toggleImageVisibility"
                         title="Toggle image visibility"
                    ></div>
                    <div class="name">
                        <select-layer :value="bone.layerId"
                                      :layers="layers"
                                      :layerIdMap="layerIdMap"
                                      @input="setLayerId"
                                      :readonly="readonly"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div class="children"
             v-if="bone.children && bone.children.length"
        >
            <bone-node v-for="child in bone.children"
                       :key="child.id"
                       :style="{display: bone.expanded ? 'block' : 'none'}"
                       :bone="child"
                       :deep="deep + 1"
                       :root="root"
                       :selected="selected"
                       :layers="layers"
                       :layerIdMap="layerIdMap"
                       ref="child"
                       :readonly="readonly"
            />
        </div>
    </div>
</template>

<script lang="ts">
    import BoneNode from './BoneNode'

    export default BoneNode;
</script>

<style lang="scss" scoped>
    .bone-node {
        width: 100%;
        user-select: none;

        &:not(:last-child) {
            border-bottom: solid 1px #444;
        }

        & > .bone {
            display: flex;
            align-items: center;
            position: relative;
            width: 100%;
            height: 44px;

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

            .expand {
                flex: 0 0 16px;
                height: 16px;
                line-height: 14px;
                text-align: center;
                box-sizing: border-box;
                font-size: 14px;
                margin-right: 6px;
                opacity: .75;

                &.has-child {
                    border: solid 1px #fff;
                }

                &.has-child:before {
                    content: '+';
                }

                &.has-child.expanded:before {
                    content: '-';
                }
            }

            .visibility {
                flex: 0 0 24px;
                height: 100%;
                background: url("../../../assets/editor/skeleton/bone/visible.png") center center no-repeat;
                border-right: solid 1px #444;

                &:not(.visible) {
                    background: url("../../../assets/editor/skeleton/bone/invisible.png") center center no-repeat;
                }
            }

            .info {
                flex: 1 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                height: 100%;
                box-sizing: border-box;
                padding: 2px 0 2px 4px;
                border-right: solid 1px #444;
                font-size: 12px;
                border-left: solid 1px #444;

                .row {
                    flex: 1 1;
                    display: flex;
                    align-items: center;
                    min-height: 0;

                    .icon {
                        flex: 0 0 16px;
                        width: 16px;
                        height: 16px;
                        margin-right: 4px;

                        &:not(.visible) {
                            opacity: .5;
                        }

                        &.bone {
                            background: url("../../../assets/editor/skeleton/bone/bone.png") center center no-repeat;
                        }

                        &.image {
                            background: url("../../../assets/editor/skeleton/bone/image.png") center center no-repeat;
                        }
                    }

                    .name {
                        flex: 1 1;
                        height: 16px;
                        overflow: hidden;

                        .text {
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }

                        input {
                            width: 100%;
                        }
                    }
                }
            }
        }

        & > .children {
            border-top: solid 1px #444;
        }
    }
</style>
