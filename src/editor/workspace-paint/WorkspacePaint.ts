import Vue from 'vue'

import Color from '../../utils/Color'
import {MouseButton} from '../../utils/MouseButton'
import TextureCache from '../../utils/TextureCache'

import {Workspace} from '../Workspace'
import Project from '../project/Project'
import Layer from '../project/Layer'
import LayerFolder from '../project/LayerFolder'
import History from '../History'

import vueKeepScrollPosition from '../components/vue-keep-scroll-position'
import PopupMenu from '../components/PopupMenu.vue'
import PopupMenuClass from '../components/PopupMenu'
import MenuItem from '../components/MenuItem.vue'
import HorizontalSplit from '../components/HorizontalSplit.vue'
import VerticalSplit from '../components/VerticalSplit.vue'

import HsvRing from './components/HsvRing.vue'
import ColorValues from './components/ColorValues.vue'
import OpacityRange from './components/OpacityRange.vue'
import LayerTree from './components/LayerTree.vue'

import ResizeCanvasWindow from './dialogs/ResizeCanvasWindow.vue'
import ResizeCanvasWindowClass from './dialogs/ResizeCanvasWindow'

import Tool from './tools/Tool'
import Pen from './tools/Pen'
import Eraser from './tools/Eraser'
import Bucket from './tools/Bucket'
import ColorPicker from './tools/ColorPicker'
import Move from './tools/Move'

import render from './render'


Vue.use(vueKeepScrollPosition);

const CANVAS_WRAPPER_PADDING_X = 200;
const CANVAS_WRAPPER_PADDING_Y = 200;
const MAX_ZOOM = 24;
const MAX_PREVIEW_ZOOM = 4;
const MAX_LAYER_FOLDER_DEEP = 25;

const project = Project.instance();
const history = History.instance();

export default class WorkspacePaint extends Vue.extend({
    components: {
        PopupMenu,
        MenuItem,
        HorizontalSplit,
        VerticalSplit,

        HsvRing,
        ColorValues,
        OpacityRange,
        LayerTree,
        ResizeCanvasWindow
    },
    data() {
        const tools: Tool[] = [
            new Pen,
            new Eraser,
            new Bucket,
            new ColorPicker,
            new Move
        ];
        return {
            tools,
            rightWrapperSize: 200 as number,
            previewHeight: 120 as number,
            zoom: 4 as number,
            previewZoom: 1 as number,
            projectState: Project.instance().state,
            currentTool: tools[0] as Tool,
            currentColor: Color.BLACK as Color,
            brushOpacity: 100 as number,
            currentLayer: undefined as Layer | LayerFolder | undefined,
            canvasMouseDown: false as boolean,
            canvasMouseDownButton: 0 as number,
            canvasMouseOver: false as boolean,
            canvasMouseX: 0 as number,
            canvasMouseY: 0 as number,
            drawing: false as boolean
        };
    },
    computed: {
        canvasWrapperStyle() {
            const style = {} as { [style: string]: string };
            if (
                this.currentLayer && this.currentLayer.visible
                && (this.currentLayer instanceof Layer || this.currentTool.canBeUsedOnFolder)
            ) {
                style.cursor = this.currentTool.cursor;
            }
            style.width = this.projectState.width * this.zoom + 'px';
            style.height = this.projectState.height * this.zoom + 'px';
            return style;
        }
    },
    watch: {
        'projectState.timestamp'() {
            this.init();
        },
        'projectState.backgroundColor': {
            deep: true,
            handler() {
                this.render();
            }
        }
    },
    mounted() {
        (this as WorkspacePaint).ctx = (<HTMLCanvasElement>this.$refs.canvas).getContext('2d') as CanvasRenderingContext2D;
        (this as WorkspacePaint).ctxPreview = (<HTMLCanvasElement>this.$refs.canvasPreview).getContext('2d') as CanvasRenderingContext2D;

        this.init();
    },
    activated() {
        this.render();
    },
    methods: {
        init() {
            this.$nextTick(() => {
                this.currentLayer = project.getFirstLayer();
                this.scrollCanvasToCenter();
                this.scrollPreviewToCenter();
                (this as WorkspacePaint).editingLayerTextureCache.expired();
                this.render();
            });
        },
        setCurrentToolProperties(properties: { [property: string]: any }) {
            Object.assign(this.currentTool, properties);
        },
        onMenuButtonClick(e: MouseEvent) {
            (this.$refs.menu as PopupMenuClass).show(e.target as HTMLElement);
        },
        setCurrentColor(color: Color) {
            this.currentColor = color;
        },
        // ================ history ================
        applyLayerDataModification(layer: Layer, data: Uint8Array) {
            const oldData = project.getLayerImageDataCopy(layer);
            const layerId = layer.id;
            history.applyAndRecord(
                Workspace.PAINT,
                () => {
                    project.setLayerImageData(project.getLayer(layerId), data.slice());
                    this.render();
                },
                () => {
                    project.setLayerImageData(project.getLayer(layerId), oldData.slice());
                    this.render();
                }
            );
        },
        applyLayerDataModifications(modifications: { [id: number]: Uint8Array }) {
            const oldData: { [id: number]: Uint8Array } = {};
            Object.keys(modifications).forEach(id => {
                oldData[Number(id)] = project.getLayerImageDataCopy(project.getLayer(Number(id)));
            });
            history.applyAndRecord(
                Workspace.PAINT,
                () => {
                    Object.keys(modifications).forEach(id => {
                        project.setLayerImageData(project.getLayer(Number(id)), modifications[Number(id)].slice());
                    });
                    this.render();
                },
                () => {
                    Object.keys(oldData).forEach(id => {
                        project.setLayerImageData(project.getLayer(Number(id)), oldData[Number(id)].slice());
                    });
                    this.render();
                }
            );
        },
        // ================ menus ================
        async resizeCanvas() {
            const properties = await (this.$refs.resizeCanvasWindow as ResizeCanvasWindowClass).show();
            if (!properties) {
                return;
            }
            const oldWidth = this.projectState.width;
            const oldHeight = this.projectState.height;
            const oldData = project.getImageDataCopies();
            history.applyAndRecord(
                Workspace.PAINT,
                () => {
                    project.resizeCanvas(properties.width, properties.height, properties.align);
                    this.$nextTick(() => this.render());
                },
                () => {
                    project.setImageData(oldData);
                    project.state.width = oldWidth;
                    project.state.height = oldHeight;
                    this.$nextTick(() => this.render());
                }
            );
        },
        rotate180() {
            history.applyAndRecord(
                Workspace.PAINT,
                () => {
                    project.rotate180();
                    this.render();
                },
                () => {
                    project.rotate180();
                    this.render();
                }
            );
        },
        rotate90cw() {
            history.applyAndRecord(
                Workspace.PAINT,
                () => {
                    project.rotate90cw();
                    this.$nextTick(() => this.render());
                },
                () => {
                    project.rotate90ccw();
                    this.$nextTick(() => this.render());

                }
            );
        },
        rotate90ccw() {
            history.applyAndRecord(
                Workspace.PAINT,
                () => {
                    project.rotate90ccw();
                    this.$nextTick(() => this.render());
                },
                () => {
                    project.rotate90cw();
                    this.$nextTick(() => this.render());
                }
            );
        },
        flipHorizontal() {
            history.applyAndRecord(
                Workspace.PAINT,
                () => {
                    project.flipHorizontal();
                    this.render();
                },
                () => {
                    project.flipHorizontal();
                    this.render();

                }
            );
        },
        flipVertical() {
            history.applyAndRecord(
                Workspace.PAINT,
                () => {
                    project.flipVertical();
                    this.render();
                },
                () => {
                    project.flipVertical();
                    this.render();

                }
            );
        },
        // ================ layer ================
        expandFolder(folder: LayerFolder) {
            folder.expanded = true;
        },
        setLayerName(layer: Layer | LayerFolder, name: string) {
            const oldName = layer.name;
            if (oldName === name) {
                return;
            }
            const id = layer.id;
            history.applyAndRecord(
                Workspace.PAINT,
                () => {
                    project.setLayerName(project.getLayer(id), name);
                },
                () => {
                    project.setLayerName(project.getLayer(id), oldName);
                }
            );
        },
        setLayerVisibility(layer: Layer | LayerFolder, visible: boolean) {
            const oldState = layer.visible;
            const id = layer.id;
            if (oldState === visible) {
                return;
            }
            history.applyAndRecord(
                Workspace.PAINT,
                () => {
                    project.setLayerVisibility(project.getLayer(id), visible);
                    this.render();
                },
                () => {
                    project.setLayerVisibility(project.getLayer(id), oldState);
                    this.render();
                }
            );
        },
        setLayerOpacity(opacity: number) {
            if (this.currentLayer) {
                const layerId = this.currentLayer.id;
                const oldOpacity = this.currentLayer.opacity;
                if (opacity === oldOpacity) {
                    return;
                }
                history.applyAndRecord(
                    Workspace.PAINT,
                    () => {
                        project.setLayerOpacity(project.getLayer(layerId), opacity);
                        this.render();
                    },
                    () => {
                        project.setLayerOpacity(project.getLayer(layerId), oldOpacity);
                        this.render();
                    },
                    'setLayerOpacity#' + layerId
                );
            }
        },
        moveLayer(layer: Layer | LayerFolder, position: 'before' | 'after', target: Layer | LayerFolder) {
            const layerId = layer.id;
            const targetId = target.id;
            const restoreInfo = project.getLayerPositionRestoreInfo(layer);
            history.applyAndRecord(
                Workspace.PAINT,
                () => {
                    this.currentLayer = project.moveLayer(
                        project.getLayer(layerId),
                        position,
                        project.getLayer(targetId)
                    );
                    this.render();
                },
                () => {
                    this.currentLayer = project.restoreLayerPosition(restoreInfo);
                    this.render();
                }
            );
        },
        selectLayer(layer: Layer | LayerFolder) {
            this.currentLayer = layer;
        },
        newLayer() {
            if (this.currentLayer instanceof LayerFolder) {
                this.expandFolder(this.currentLayer)
            }
            const layer = this.currentLayer = project.addLayer(this.currentLayer);
            const restoreInfo = project.getLayerRestoreInfo(layer);
            history.record(
                Workspace.PAINT,
                () => {
                    const layer = this.currentLayer = project.restoreLayer(restoreInfo);
                    this.render();
                    this.$nextTick(() => layer.parent && this.expandFolder(layer.parent));
                },
                () => {
                    this.currentLayer = project.deleteLayer(project.getLayer(restoreInfo.id));
                    this.render();
                }
            );
        },
        newFolder() {
            let node = this.currentLayer;
            let deep = 0;
            while (node) {
                node = node.parent;
                deep += 1;
            }
            if (deep >= MAX_LAYER_FOLDER_DEEP) {
                return;
            }

            if (this.currentLayer instanceof LayerFolder) {
                this.expandFolder(this.currentLayer)
            }
            const folder = this.currentLayer = project.addFolder(this.currentLayer);
            this.expandFolder(folder);

            const restoreInfo = project.getLayerRestoreInfo(folder);
            history.record(
                Workspace.PAINT,
                () => {
                    const layer = this.currentLayer = project.restoreLayer(restoreInfo);
                    this.render();
                    this.$nextTick(() => layer.parent && this.expandFolder(layer.parent));
                },
                () => {
                    this.currentLayer = project.deleteLayer(project.getLayer(restoreInfo.id));
                    this.render();
                }
            );
        },
        deleteLayer() {
            if (this.currentLayer) {
                const restoreInfo = project.getLayerRestoreInfo(this.currentLayer);
                history.applyAndRecord(
                    Workspace.PAINT,
                    () => {
                        this.currentLayer = project.deleteLayer(project.getLayer(restoreInfo.id));
                        this.render();
                    },
                    () => {
                        const layer = this.currentLayer = project.restoreLayer(restoreInfo);
                        this.render();
                        this.$nextTick(() => layer.parent && this.expandFolder(layer.parent));
                    }
                );
            }
        },
        mergeDown() {
            if (!(this.currentLayer instanceof Layer)) {
                return;
            }
            const srcLayer = this.currentLayer;
            const dstLayer = project.getBottomLayer(srcLayer);
            if (!(dstLayer instanceof Layer)) {
                return;
            }

            const srcRestoreInfo = project.getLayerRestoreInfo(srcLayer);
            const dstOldImageData = project.getLayerImageData(dstLayer).slice();
            const srcId = srcLayer.id;
            const dstId = dstLayer.id;

            history.applyAndRecord(
                Workspace.PAINT,
                () => {
                    this.currentLayer = project.mergeDownLayerImageData(
                        project.getLayer(srcId),
                        project.getLayer(dstId)
                    );
                    project.deleteLayer(project.getLayer(srcId));
                    this.render();
                },
                () => {
                    this.currentLayer = project.restoreLayer(srcRestoreInfo);
                    project.setLayerImageData(project.getLayer(dstId), dstOldImageData.slice());
                    this.render();
                }
            );
        },
        duplicateLayer() {
            if (!this.currentLayer) {
                return;
            }
            const layer = this.currentLayer = project.duplicateLayer(this.currentLayer);
            const restoreInfo = project.getLayerRestoreInfo(layer);
            history.record(
                Workspace.PAINT,
                () => {
                    this.currentLayer = project.restoreLayer(restoreInfo);
                    this.render();
                },
                () => {
                    this.currentLayer = project.deleteLayer(project.getLayer(restoreInfo.id));
                    this.render();
                }
            );
        },
        // ================ draw ================
        onCanvasMouseDown(e: MouseEvent) {
            e.preventDefault();
            if (e.button !== MouseButton.LEFT && e.button !== MouseButton.RIGHT) {
                return;
            }
            if (!this.currentLayer || !this.currentLayer.visible) {
                return;
            }
            if (this.currentLayer instanceof LayerFolder && !this.currentTool.canBeUsedOnFolder) {
                return;
            }
            if (this.canvasMouseDown && this.canvasMouseDownButton !== e.button) {
                this.onCanvasMouseUp(e);
                return;
            }
            const offset = e.target !== this.$refs.canvas;
            const x = Math.floor((e.offsetX - (offset ? CANVAS_WRAPPER_PADDING_X : 0)) / this.zoom);
            const y = Math.floor((e.offsetY - (offset ? CANVAS_WRAPPER_PADDING_Y : 0)) / this.zoom);
            this.canvasMouseDownButton = e.button;
            this.canvasMouseDown = true;
            this.drawing = true;
            document.body.addEventListener('mouseup', this.onCanvasMouseUp);
            this.currentTool.onMouseDown(this as WorkspacePaint, e.button, x, y);
            this.onCanvasMouseMove(e);
        },
        onCanvasMouseMove(e: MouseEvent) {
            e.preventDefault();
            const offset = e.target !== this.$refs.canvas;
            const x = this.canvasMouseX = Math.floor((e.offsetX - (offset ? CANVAS_WRAPPER_PADDING_X : 0)) / this.zoom);
            const y = this.canvasMouseY = Math.floor((e.offsetY - (offset ? CANVAS_WRAPPER_PADDING_Y : 0)) / this.zoom);
            do {
                if (!this.canvasMouseDown) {
                    break;
                }
                if (!this.currentLayer || !this.currentLayer.visible) {
                    break;
                }
                this.currentTool.onMouseMove(this as WorkspacePaint, x, y);
            } while (false);
            this.render();
        },
        onCanvasMouseUp(e: MouseEvent) {
            do {
                document.body.removeEventListener('mouseup', this.onCanvasMouseUp);
                if (!this.canvasMouseDown) {
                    break;
                }
                this.canvasMouseDown = false;
                this.drawing = false;
                if (!this.currentLayer || !this.currentLayer.visible) {
                    break;
                }
                if (this.canvasMouseDownButton !== e.button && this.currentTool.cancelable) {
                    this.currentTool.cancel(this as WorkspacePaint);
                    project.shouldReRender = true;
                } else {
                    this.currentTool.onMouseUp(this as WorkspacePaint, e.button);
                }
            } while (false);
            (this as WorkspacePaint).editingLayerTextureCache.expired();
            this.render();
        },
        onCanvasMouseOver() {
            this.canvasMouseOver = true;
            this.render();
        },
        onCanvasMouseOut() {
            this.canvasMouseOver = false;
            this.render();
        },
        // ================ canvas ================
        render() {
            render(this as WorkspacePaint);
        },
        scrollCanvasToCenter() {
            const canvasWrapper = this.$refs.canvasWrapper as HTMLElement;
            const canvasInnerWrapper = this.$refs.canvasInnerWrapper as HTMLElement;
            const wrapperRect = canvasWrapper.getBoundingClientRect();
            const rect = canvasInnerWrapper.getBoundingClientRect();
            canvasWrapper.scrollLeft = Math.max(0, (rect.width - wrapperRect.width) / 2);
            canvasWrapper.scrollTop = Math.max(0, (rect.height - wrapperRect.height) / 2);
        },
        onCanvasWheel(e: WheelEvent) {
            e.preventDefault();
            const canvasWrapper = this.$refs.canvasWrapper as HTMLElement;
            const canvasInnerWrapper = this.$refs.canvasInnerWrapper as HTMLElement;
            const wrapperRect = canvasWrapper.getBoundingClientRect();
            const rect0 = canvasInnerWrapper.getBoundingClientRect();

            const scrollX = canvasWrapper.scrollLeft;
            const scrollY = canvasWrapper.scrollTop;
            const scrollScaleX = (scrollX + wrapperRect.width / 2) / rect0.width;
            const scrollScaleY = (scrollY + wrapperRect.height / 2) / rect0.height;

            this.zoom = Math.max(1, Math.min(MAX_ZOOM, this.zoom - e.deltaY / 100));

            this.$nextTick(() => {
                const rect1 = canvasInnerWrapper.getBoundingClientRect();
                canvasWrapper.scrollLeft = scrollScaleX * rect1.width - wrapperRect.width / 2;
                canvasWrapper.scrollTop = scrollScaleY * rect1.height - wrapperRect.height / 2;

                this.render();
            });
        },
        scrollPreviewToCenter() {
            const preview = this.$refs.preview as HTMLElement;
            const wrapperRect = preview.getBoundingClientRect();
            const width = this.projectState.width * this.previewZoom;
            const height = this.projectState.height * this.previewZoom;
            preview.scrollLeft = Math.max(0, (width - wrapperRect.width) / 2);
            preview.scrollTop = Math.max(0, (height - wrapperRect.height) / 2);
        },
        onPreviewWheel(e: WheelEvent) {
            e.preventDefault();
            const preview = this.$refs.preview as HTMLElement;
            const wrapperRect = preview.getBoundingClientRect();
            const previewCanvas = this.$refs.canvasPreview as HTMLElement;
            const rect0 = previewCanvas.getBoundingClientRect();

            const scrollX = preview.scrollLeft;
            const scrollY = preview.scrollTop;
            const scrollScaleX = (scrollX + wrapperRect.width / 2) / rect0.width;
            const scrollScaleY = (scrollY + wrapperRect.height / 2) / rect0.height;

            this.previewZoom = Math.max(1, Math.min(MAX_PREVIEW_ZOOM, this.previewZoom - e.deltaY / 100));

            this.$nextTick(() => {
                const rect1 = previewCanvas.getBoundingClientRect();
                preview.scrollLeft = scrollScaleX * rect1.width - wrapperRect.width / 2;
                preview.scrollTop = scrollScaleY * rect1.height - wrapperRect.height / 2;
                this.render();
            });
        }
    }
}) {
    project: Project = project;
    /**
     * Context 2D of main canvas.
     */
    ctx: CanvasRenderingContext2D = undefined as any;
    /**
     * Context 2D of preview canvas.
     */
    ctxPreview: CanvasRenderingContext2D = undefined as any;
    /**
     * Texture for current layer's brush tool editing result.
     */
    editingLayerTextureCache: TextureCache = new TextureCache(project.renderer);
    /**
     * Premultiplied-alpha layers render result.
     */
    renderResult?: Uint8Array;
}
