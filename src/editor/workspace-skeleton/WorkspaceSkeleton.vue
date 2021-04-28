<template>
    <div class="workspace">
        <div class="main">
            <div class="tools">
                <div class="scroll">
                    <div class="tool"
                         v-for="tool in tools"
                         :class="[tool.id, (tool.id === currentTool.id ? 'active' : null)]"
                         :title="tool.name"
                         @click="currentTool = tool"
                    >
                        <img :src="tool.icon" alt="">
                    </div>

                    <div class="sep"></div>

                    <div class="tool" title="Center View" @click="centerView">
                        <img src="../../assets/editor/skeleton/tools/center.png" alt="">
                    </div>

                    <div class="sep"></div>

                    <div class="tool"
                         title="Snap to Pixel"
                         :class="{active: snapToPixel}"
                         @click="snapToPixel = !snapToPixel"
                    >
                        <img src="../../assets/editor/skeleton/tools/magnet.png" alt="">
                    </div>

                    <div class="tool"
                         title="Lighten Unselected Bones"
                         :class="{active: lightenUnselectedBones}"
                         @click="lightenUnselectedBones = !lightenUnselectedBones, render()"
                    >
                        <img src="../../assets/editor/skeleton/tools/lighten-unselected-bones.png" alt="">
                    </div>

                    <div class="tool"
                         title="Lighten Unselected Images"
                         :class="{active: lightenUnselectedImages}"
                         @click="lightenUnselectedImages = !lightenUnselectedImages, render()"
                    >
                        <img src="../../assets/editor/skeleton/tools/lighten-unselected-images.png" alt="">
                    </div>

                    <div class="tool"
                         title="Display Bones"
                         :class="{active: displayBones}"
                         @click="displayBones = !displayBones, render()"
                    >
                        <img src="../../assets/editor/skeleton/tools/bones-visible.png" alt="">
                    </div>

                    <div class="tool"
                         title="Display Images"
                         :class="{active: displayImages}"
                         @click="displayImages = !displayImages, render()"
                    >
                        <img src="../../assets/editor/skeleton/tools/images-visible.png" alt="">
                    </div>
                </div>
            </div>

            <div class="canvas-wrapper"
                 ref="canvasWrapper"
                 @wheel.stop="onCanvasMouseWheel"
                 @mousedown="onCanvasMouseDown"
                 @mousemove="onCanvasMouseMove"
                 @mouseup="onCanvasMouseUp"
                 @mouseover="onCanvasMouseOver"
                 @mouseleave="onCanvasMouseLeave"
                 :style="canvasCursorStyle"
            >
                <canvas ref="canvas"
                        :width="canvasWidth"
                        :height="canvasHeight"
                />
            </div>

            <horizontal-split :size.sync="rightWrapperSize" :min-size="200" :max-size="540"/>

            <div class="right-wrapper"
                 :style="{width: rightWrapperSize + 'px'}">
                <div class="bones">
                    <div class="buttons">
                        <label title="Auto set bone name when selecting image">
                            <input type="checkbox" v-model="autoNaming">
                            <span>Auto Naming</span>
                        </label>
                        <div style="flex: 1 1"></div>
                        <button title="New Child Bone" @click="newChildBone">
                            <img src="../../assets/editor/skeleton/bone/add-child-bone.png" alt="">
                        </button>
                        <button title="New Neighboring Bone" @click="newNeighboringBone">
                            <img src="../../assets/editor/skeleton/bone/add-neighboring-bone.png" alt="">
                        </button>
                        <button title="Delete Bone" @click="deleteBone">
                            <img src="../../assets/editor/skeleton/bone/delete.png" alt="">
                        </button>
                    </div>
                    <div class="inner-wrapper">
                        <bone-tree :bones="projectState.bones"
                                   :selected="currentBone"
                                   :layers="projectState.layers"
                                   :layerIdMap="projectState.layerIdMap"
                                   @setName="setBoneName"
                                   @select="selectBone"
                                   @move="moveBone"
                                   @setLayerId="setBoneLayerId"
                                   @setVisibility="setBoneVisibility"
                                   @setBoneVisibility="setBoneBoneVisibility"
                                   @setImageVisibility="setBoneImageVisibility"
                                   ref="boneTree"
                        />
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script lang="ts">
    import WorkspaceSkeleton from './WorkspaceSkeleton'

    export default WorkspaceSkeleton;
</script>

<style lang="scss" scoped>
    .workspace {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;

        & > .main {
            flex: 1 1;
            display: flex;
            width: 100%;
            min-height: 0;
            box-sizing: border-box;

            & > .tools {
                width: 40px;
                height: 100%;
                overflow: hidden;
                position: relative;

                & > .scroll {
                    display: flex;
                    flex-direction: column;
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: -8px;
                    overflow-y: scroll;
                    padding: 4px;

                    .tool {
                        width: 32px;
                        height: 32px;
                        transition: background-color .3s;
                        margin-bottom: 4px;
                        user-select: none;

                        &:hover {
                            background-color: #444;
                        }

                        &.active,
                        &:active {
                            background-color: #666;
                        }
                    }

                    .sep {
                        width: 32px;
                        height: 1px;
                        background: #444;
                        margin: 8px 0;
                    }
                }
            }

            & > .canvas-wrapper {
                flex: 1 1;
                min-width: 0;
                height: 100%;
                overflow: hidden;
            }

            & > .right-wrapper {
                display: flex;
                flex-direction: column;

                & > .bones {
                    flex: 1 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;

                    & > .buttons {
                        display: flex;
                        justify-content: flex-end;
                        padding: 4px;
                        user-select: none;

                        label {
                            display: inline-flex;
                            align-items: center;
                            font-size: 8px;
                        }

                        button {
                            width: 24px;
                            height: 24px;
                            padding: 0;
                            margin: 0 0 0 4px;
                            background: transparent;
                            border: none;
                            outline: none;
                            opacity: .65;
                            transition: opacity .3s, background-color .3s;

                            &:hover {
                                opacity: 1;
                                background-color: #222;
                            }

                            &:active {
                                opacity: .65;
                            }
                        }
                    }

                    & > .inner-wrapper {
                        flex: 1 1;
                        min-height: 0;
                        overflow: auto;
                    }
                }
            }
        }
    }
</style>
