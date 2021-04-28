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
                        <img src="../../assets/editor/animate/tools/center.png" alt="">
                    </div>

                    <div class="sep"></div>

                    <div class="tool"
                         title="Snap to Pixel"
                         :class="{active: snapToPixel}"
                         @click="snapToPixel = !snapToPixel"
                    >
                        <img src="../../assets/editor/animate/tools/magnet.png" alt="">
                    </div>

                    <div class="tool"
                         title="Lighten Unselected Bones"
                         :class="{active: lightenUnselectedBones}"
                         @click="lightenUnselectedBones = !lightenUnselectedBones, render()"
                    >
                        <img src="../../assets/editor/animate/tools/lighten-unselected-bones.png" alt="">
                    </div>

                    <div class="tool"
                         title="Display Bones"
                         :class="{active: displayBones}"
                         @click="displayBones = !displayBones, render()"
                    >
                        <img src="../../assets/editor/animate/tools/bones-visible.png" alt="">
                    </div>

                    <div class="tool"
                         title="Display Images"
                         :class="{active: displayImages}"
                         @click="displayImages = !displayImages, render()"
                    >
                        <img src="../../assets/editor/animate/tools/images-visible.png" alt="">
                    </div>
                </div>
            </div>

            <div class="left-wrapper">
                <div class="top-wrapper"
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

                    <div class="bone-transform"
                         v-if="currentBone && currentBone.id >= 0 && currentAnimation"
                         @mousedown.stop
                         @mouseup.stop
                    >
                        <div class="name">{{currentFrameBoneTransformInfo.name}}</div>
                        <span>X: </span>
                        <input type="text" readonly :value="currentFrameBoneTransformInfo.translateX">
                        <span>Y: </span>
                        <input type="text" readonly :value="currentFrameBoneTransformInfo.translateY">
                        <span>R°: </span>
                        <input type="text" readonly :value="currentFrameBoneTransformInfo.rotate">
                    </div>
                </div>

                <vertical-split fixed/>

                <div class="bottom-wrapper">
                    <div class="timeline"
                         v-if="currentAnimation"
                         tabindex="0"
                         @keydown="onTimelineKeydown"
                    >
                        <div class="control">
                            <button title="Add Keyframe"
                                    @click="addKeyframe"
                            >
                                <img src="../../assets/editor/animate/timeline/keyframe.png" alt="">
                            </button>
                            <button title="Delete Keyframe"
                                    @click="deleteKeyframe"
                            >
                                <img src="../../assets/editor/animate/timeline/delete.png" alt="">
                            </button>
                            <button title="Move Left"
                                    @click="frameMoveLeft"
                            >
                                <img src="../../assets/editor/animate/timeline/move-left.png" alt="">
                            </button>
                            <button title="Move Right"
                                    @click="frameMoveRight"
                            >
                                <img src="../../assets/editor/animate/timeline/move-right.png" alt="">
                            </button>

                            <div class="sep"></div>

                            <button title="First Frame" @click="firstFrame">
                                <img src="../../assets/editor/animate/timeline/first.png" alt="">
                            </button>
                            <button title="Prev Frame" @click="prevFrame">
                                <img src="../../assets/editor/animate/timeline/prev.png" alt="">
                            </button>
                            <button title="Play" @click="play" v-if="!playing">
                                <img src="../../assets/editor/animate/timeline/play.png" alt="">
                            </button>
                            <button title="Stop" @click="stop" v-if="playing">
                                <img src="../../assets/editor/animate/timeline/stop.png" alt="">
                            </button>
                            <button title="Next Frame" @click="nextFrame">
                                <img src="../../assets/editor/animate/timeline/next.png" alt="">
                            </button>
                            <button title="Last Frame" @click="lastFrame">
                                <img src="../../assets/editor/animate/timeline/last.png" alt="">
                            </button>
                            <button title="Loop" :class="{active: currentAnimation.loop}"
                                    @click="toggleAnimationLoop"
                            >
                                <img src="../../assets/editor/animate/timeline/loop.png" alt="">
                            </button>

                            <div class="sep"></div>

                            <img src="../../assets/editor/animate/timeline/zoom.png" alt="">
                            <number-range v-model="timelineStep" :min="1" :max="10" style="width: 90px;"/>

                            <div class="sep"></div>

                            <div style="margin: 0 4px;">FPS:</div>
                            <input-number :value="currentAnimation.fps"
                                          @input="setAnimationFps"
                                          :min="1"
                                          :max="60"
                                          style="width: 2em; text-align: center; margin-right: 8px;"/>

                            <img src="../../assets/editor/animate/timeline/frame-duration.png" alt=""
                                 title="Frame Duration"
                            >
                            <div title="Frame Duration">{{timelineFrameDuration}}</div>

                            <img src="../../assets/editor/animate/timeline/duration.png" alt=""
                                 title="Duration"
                            >
                            <div style="margin-right: 8px;" title="Duration">{{timelineDuration}}</div>
                        </div>

                        <animation-timeline :timeline="currentAnimation.timeline"
                                            :step="timelineStep"
                                            :position.sync="timelinePosition"
                                            :current.sync="timelineCurrent"
                                            @move="moveKeyframe"
                                            ref="timeline"
                        />
                    </div>
                </div>
            </div>

            <horizontal-split :size.sync="rightWrapperSize" :min-size="200" :max-size="540"/>

            <div class="right-wrapper"
                 :style="{width: rightWrapperSize + 'px'}"
            >
                <div class="bones-wrapper">
                    <bone-tree :bones="projectState.bones"
                               :selected="currentBone"
                               :layers="projectState.layers"
                               :layerIdMap="projectState.layerIdMap"
                               @select="selectBone"
                               @setVisibility="setBoneVisibility"
                               @setBoneVisibility="setBoneBoneVisibility"
                               @setImageVisibility="setBoneImageVisibility"
                               ref="boneTree"
                               readonly
                    />
                </div>

                <vertical-split :size.sync="animationsWrapperSize" :min-size="100" :max-size="400" reverse/>

                <div class="animations-wrapper"
                     :style="{height: animationsWrapperSize + 'px'}"
                >
                    <div class="buttons">
                        <span>Animation</span>
                        <div style="flex: 1 1"></div>
                        <button title="Add" @click="addAnimation">
                            <img src="../../assets/editor/animate/animation/add.png" alt="">
                        </button>
                        <button title="Delete" @click="deleteAnimation">
                            <img src="../../assets/editor/animate/animation/delete.png" alt="">
                        </button>
                    </div>
                    <div class="animations">
                        <animations-list :animations="projectState.animations"
                                         :selected="currentAnimation"
                                         @select="selectAnimation"
                                         @move="moveAnimation"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import WorkspaceAnimate from './WorkspaceAnimate'

    export default WorkspaceAnimate;
</script>

<style lang="scss" scoped>
    .workspace {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        user-select: none;

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

            & > .left-wrapper {
                flex: 1 1;
                display: flex;
                flex-direction: column;
                min-width: 0;
                height: 100%;

                & > .top-wrapper {
                    position: relative;
                    flex: 1 1;
                    min-height: 0;

                    & > .bone-transform {
                        display: flex;
                        align-items: center;
                        position: absolute;
                        left: 30px;
                        bottom: 10px;
                        border: solid 1px #444;
                        background-color: #333;
                        padding: 4px 8px;

                        & > *:not(:last-child) {
                            margin-right: .5em;
                        }

                        input {
                            width: 3em;
                        }

                        .name {
                            position: absolute;
                            left: 0;
                            top: -22px;
                            color: #fff;
                            text-shadow: -1px 0 #000, 0 1px #000, 1px 0 #000, 0 -1px #000;
                        }
                    }
                }

                & > .bottom-wrapper {
                    flex: 0 0 auto;

                    & > .timeline {
                        display: flex;
                        flex-direction: column;
                        outline: none;
                        border-left: solid 1px #444;

                        & > .control {
                            display: flex;
                            align-items: center;
                            min-width: 0;
                            height: 24px;
                            padding: 2px 4px;
                            border-bottom: solid 1px #444;
                            font-size: 12px;
                            overflow: hidden;
                            white-space: nowrap;

                            .sep {
                                flex: 0 0 1px;
                                margin: 0 4px;
                                height: 20px;
                                background-color: #444;
                            }

                            & > img {
                                opacity: .65;
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

                                &:hover, &.active {
                                    opacity: 1;
                                    background-color: #222;
                                }

                                &:active {
                                    opacity: .65;
                                }
                            }
                        }
                    }
                }
            }

            & > .right-wrapper {
                display: flex;
                flex-direction: column;
                height: 100%;

                & > .bones-wrapper {
                    flex: 1 1;
                    min-height: 0;
                    overflow: auto;
                }

                & > .animations-wrapper {
                    display: flex;
                    flex-direction: column;

                    & > .buttons {
                        display: flex;
                        justify-content: flex-end;
                        align-items: center;
                        padding: 4px 4px 4px 8px;
                        user-select: none;
                        font-size: 8px;

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

                    & > .animations {
                        flex: 1 1;
                        min-height: 0;
                        overflow: auto;
                    }
                }
            }
        }
    }
</style>
