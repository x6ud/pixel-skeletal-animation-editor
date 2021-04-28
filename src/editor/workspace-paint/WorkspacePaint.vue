<template>
    <div class="workspace">
        <div class="main">
            <!-- ================ Tools ================ -->
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
                    <div class="tool" @click="onMenuButtonClick">
                        <img src="../../assets/editor/paint/tools/cog.png" alt="">
                    </div>
                    <popup-menu ref="menu">
                        <menu-item name="Resize Canvas" popup @click="resizeCanvas"/>
                        <menu-item sep/>
                        <menu-item name="Rotate">
                            <popup-menu>
                                <menu-item name="180°" @click="rotate180"/>
                                <menu-item name="90° CW" @click="rotate90cw"/>
                                <menu-item name="90° CCW" @click="rotate90ccw"/>
                            </popup-menu>
                        </menu-item>
                        <menu-item name="Flip">
                            <popup-menu>
                                <menu-item name="Flip Horizontal" @click="flipHorizontal"/>
                                <menu-item name="Flip Vertical" @click="flipVertical"/>
                            </popup-menu>
                        </menu-item>
                    </popup-menu>
                </div>
            </div>

            <horizontal-split fixed/>

            <div class="properties-wrapper">
                <!-- ================ Color ================ -->
                <div style="margin-bottom: 8px;">
                    <hsv-ring v-model="currentColor"/>
                </div>
                <div style="margin-bottom: 8px;">
                    <color-values :value="currentColor"/>
                </div>
                <div style="margin-bottom: 12px;">
                    <opacity-range v-model="brushOpacity"/>
                </div>

                <!-- ================ Tool Properties ================ -->
                <div class="tool-properties">
                    <component :is="currentTool.propertiesComponent"
                               :tool="currentTool"
                               @set-properties="setCurrentToolProperties"
                    />
                </div>
            </div>

            <horizontal-split fixed/>

            <!-- ================ Canvas ================ -->
            <div class="canvas-wrapper"
                 @wheel="onCanvasWheel"
                 ref="canvasWrapper"
                 v-keep-scroll-position
            >
                <div class="canvas-inner-wrapper"
                     ref="canvasInnerWrapper"
                     :style="canvasWrapperStyle"
                     @mousedown="onCanvasMouseDown"
                     @mousemove="onCanvasMouseMove"
                     @mouseover="onCanvasMouseOver"
                     @mouseout="onCanvasMouseOut"
                >
                    <canvas :width="projectState.width * zoom"
                            :height="projectState.height * zoom"
                            ref="canvas"
                    ></canvas>
                </div>
            </div>

            <horizontal-split :size.sync="rightWrapperSize" :min-size="200" :max-size="540"/>

            <div class="right-wrapper"
                 :style="{width: rightWrapperSize + 'px'}">
                <!-- ================ Preview ================ -->
                <div class="preview-wrapper">
                    <div class="preview"
                         :style="{height: `${previewHeight}px`}"
                         ref="preview"
                         @wheel="onPreviewWheel"
                    >
                        <canvas :width="projectState.width * previewZoom"
                                :height="projectState.height * previewZoom"
                                ref="canvasPreview"
                        ></canvas>
                    </div>
                </div>

                <vertical-split :size.sync="previewHeight" :min-size="50" :max-size="300"/>

                <!-- ================ Layers ================ -->
                <div class="layers">
                    <div style="padding: 8px">
                        <opacity-range :value="currentLayer && currentLayer.opacity"
                                       @input="setLayerOpacity"
                        />
                    </div>
                    <div class="buttons">
                        <button title="New Layer" @click="newLayer">
                            <img src="../../assets/editor/paint/layer/new-layer.png" alt="">
                        </button>
                        <button title="New Folder" @click="newFolder">
                            <img src="../../assets/editor/paint/layer/new-folder.png" alt="">
                        </button>
                        <button title="Merge Down" @click="mergeDown">
                            <img src="../../assets/editor/paint/layer/merge-down.png" alt="">
                        </button>
                        <button title="Duplicate" @click="duplicateLayer">
                            <img src="../../assets/editor/paint/layer/duplicate.png" alt="">
                        </button>
                        <button title="Delete" @click="deleteLayer">
                            <img src="../../assets/editor/paint/layer/delete.png" alt="">
                        </button>
                    </div>
                    <div class="inner-wrapper">
                        <layer-tree :layers="projectState.layers"
                                    :selected="currentLayer"
                                    @setName="setLayerName"
                                    @setVisibility="setLayerVisibility"
                                    @moveLayer="moveLayer"
                                    @select="selectLayer"
                                    ref="layerTree"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- ================ popup windows ================ -->
        <resize-canvas-window ref="resizeCanvasWindow"/>
    </div>
</template>

<script lang="ts">
    import WorkspacePaint from './WorkspacePaint'

    export default WorkspacePaint;
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

            & > .properties-wrapper {
                display: flex;
                flex-direction: column;
                padding: 8px 8px 0 8px;

                & > .tool-properties {
                    flex: 1 1;
                    width: 160px;
                    min-height: 0;
                    overflow: auto;
                    user-select: none;
                }
            }

            & > .canvas-wrapper {
                flex: 1 1;
                display: flex;
                align-items: center;
                min-width: 0;
                height: 100%;
                overflow: auto;

                .canvas-inner-wrapper {
                    margin: auto;
                    padding: 200px 200px;
                }
            }

            & > .right-wrapper {
                display: flex;
                flex-direction: column;

                & > .preview-wrapper {
                    flex: 0 0;
                    padding: 0 0 4px 8px;

                    .preview {
                        width: 100%;
                        display: flex;
                        align-items: center;
                        overflow: auto;

                        canvas {
                            margin: auto;
                        }
                    }
                }

                & > .layers {
                    flex: 1 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;

                    .buttons {
                        display: flex;
                        justify-content: flex-end;
                        padding: 0 4px;
                        user-select: none;

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

                    .inner-wrapper {
                        flex: 1 1;
                        min-height: 0;
                        overflow: auto;

                        & > .layers {
                            border-top: solid 1px #444;
                            border-bottom: solid 1px #444;
                        }
                    }
                }
            }
        }
    }
</style>
