import Vue from 'vue'

import {Workspace} from '../Workspace'
import Project from '../project/Project'
import Bone from '../project/Bone'
import History from '../History'

import HorizontalSplit from '../components/HorizontalSplit.vue'

import BoneTree from './components/BoneTree.vue'

import Tool from './tools/Tool'
import CursorTool from './tools/CursorTool'
import BoneTool from './tools/BoneTool'

import render from './render'
import {MouseButton} from '../../utils/MouseButton'

const project = Project.instance();
const history = History.instance();

const MAX_ZOOM = 24;
const RULER_SIZE = 16;
const BONE_DISPLAY_RADIUS = 8.5;
const BONE_ENDPOINT_0_INDICATOR_DISPLAY_RADIUS = BONE_DISPLAY_RADIUS + 1;
const BONE_ENDPOINT_1_INDICATOR_DISPLAY_RADIUS = BONE_DISPLAY_RADIUS * 0.75;

export default class WorkspaceSkeleton extends Vue.extend({
    components: {
        HorizontalSplit,
        BoneTree
    },
    data() {
        const tools: Array<Tool> = [
            new CursorTool(),
            new BoneTool()
        ];
        return {
            RULER_SIZE,
            BONE_DISPLAY_RADIUS,
            BONE_ENDPOINT_0_INDICATOR_DISPLAY_RADIUS,
            BONE_ENDPOINT_1_INDICATOR_DISPLAY_RADIUS,

            tools,
            currentTool: tools[0],
            currentToolActive: false,
            snapToPixel: true,
            lightenUnselectedBones: true,
            lightenUnselectedImages: true,
            displayBones: true,
            displayImages: true,
            autoNaming: true,

            canvasWidth: 1,
            canvasHeight: 1,
            updateCanvasSizeTid: null as any,
            rightWrapperSize: 300,

            projectState: project.state,
            currentBone: undefined as Bone | undefined,
            zoom: 6,
            cameraX: 0,
            cameraY: 0,
            mouseOver: false,
            /**
             * Canvas mouse X related to camera X
             */
            mouseX: 0,
            /**
             * Canvas mouse Y related to camera Y
             */
            mouseY: 0,
            mouseLeftPressed: false,
            mouseRightPressed: false
        };
    },
    computed: {
        canvasCursorStyle() {
            const style = {} as { [style: string]: string };
            if (this.currentBone && this.currentBone.id >= 0) {
                style.cursor = this.currentTool.cursor;
            }
            return style;
        },
        showBoneEndpointIndicator(): boolean {
            return this.currentTool instanceof CursorTool;
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
        },
        currentTool() {
            this.render();
        }
    },
    mounted() {
        const canvas = this.$refs.canvas as HTMLCanvasElement;
        (this as WorkspaceSkeleton).ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        this.updateCanvasSizeTid = setInterval(this.updateCanvasSize, 1000 / 30);
        this.updateCanvasSize();

        this.init();
    },
    beforeDestroy() {
        clearInterval(this.updateCanvasSizeTid);
    },
    activated() {
        this.render();
    },
    methods: {
        init() {
            this.$nextTick(() => {
                this.currentBone = project.state.bones;
                this.centerView();
            });
        },
        centerView() {
            this.cameraX = this.projectState.width / 2;
            this.cameraY = this.projectState.height / 2;
            this.render();
        },
        // ================ canvas ================
        render() {
            render(this as WorkspaceSkeleton);
        },
        updateCanvasSize() {
            const canvasWrapper = this.$refs.canvasWrapper as HTMLElement;
            if (canvasWrapper) {
                const rect = canvasWrapper.getBoundingClientRect();
                if (rect.width && rect.height && (this.canvasWidth !== rect.width || this.canvasHeight !== rect.height)) {
                    this.canvasWidth = rect.width;
                    this.canvasHeight = rect.height;
                    this.$nextTick(() => {
                        this.render();
                    });
                }
            }
        },
        onCanvasMouseWheel(e: WheelEvent) {
            const contentWidth = this.canvasWidth - RULER_SIZE;
            const contentHeight = this.canvasHeight - RULER_SIZE;
            const oldScreenX = this.mouseX * this.zoom + contentWidth / 2 + RULER_SIZE;
            const oldScreenY = this.mouseY * this.zoom + contentHeight / 2 + RULER_SIZE;
            this.zoom = Math.max(1, Math.min(MAX_ZOOM, this.zoom - e.deltaY / 100));
            this.mouseX = (oldScreenX - RULER_SIZE - contentWidth / 2) / this.zoom;
            this.mouseY = (oldScreenY - RULER_SIZE - contentHeight / 2) / this.zoom;
            this.render();
        },
        onCanvasMouseDown(e: MouseEvent) {
            const canvasWrapper = this.$refs.canvasWrapper as HTMLElement;
            const canvasWrapperRect = canvasWrapper.getBoundingClientRect();
            const zoom = this.zoom;
            const contentWidth = this.canvasWidth - RULER_SIZE;
            const contentHeight = this.canvasHeight - RULER_SIZE;
            const mouseX = (e.clientX - canvasWrapperRect.left - RULER_SIZE - contentWidth / 2) / zoom;
            const mouseY = (e.clientY - canvasWrapperRect.top - RULER_SIZE - contentHeight / 2) / zoom;
            this.mouseX = mouseX;
            this.mouseY = mouseY;
            this.mouseOver = true;
            switch (e.button) {
                case MouseButton.LEFT:
                    this.mouseLeftPressed = true;
                    this.currentToolActive = true;
                    this.currentTool.onMouseDown(this as WorkspaceSkeleton, this.cameraX + mouseX, this.cameraY - mouseY);
                    break;
                case MouseButton.RIGHT:
                    this.mouseRightPressed = true;
                    break;
            }
            this.onCanvasMouseMove(e);
        },
        onCanvasMouseMove(e: MouseEvent) {
            const canvasWrapper = this.$refs.canvasWrapper as HTMLElement;
            const canvasWrapperRect = canvasWrapper.getBoundingClientRect();
            const zoom = this.zoom;
            const contentWidth = this.canvasWidth - RULER_SIZE;
            const contentHeight = this.canvasHeight - RULER_SIZE;
            const mouseX = (e.clientX - canvasWrapperRect.left - RULER_SIZE - contentWidth / 2) / zoom;
            const mouseY = (e.clientY - canvasWrapperRect.top - RULER_SIZE - contentHeight / 2) / zoom;
            const dx = mouseX - this.mouseX;
            const dy = mouseY - this.mouseY;
            this.mouseX = mouseX;
            this.mouseY = mouseY;
            this.mouseOver = true;
            if (this.mouseRightPressed) {
                this.cameraX -= dx;
                this.cameraY += dy;
            }
            if (this.currentToolActive) {
                this.currentTool.onMouseMove(this as WorkspaceSkeleton, this.cameraX + mouseX, this.cameraY - mouseY);
            }
            this.render();
        },
        onCanvasMouseUp(e: MouseEvent) {
            this.mouseOver = true;
            switch (e.button) {
                case MouseButton.LEFT:
                    this.mouseLeftPressed = false;
                    if (this.currentToolActive) {
                        this.currentToolActive = false;
                        this.currentTool.onMouseUp(this as WorkspaceSkeleton);
                    }
                    break;
                case MouseButton.RIGHT:
                    this.mouseRightPressed = false;
                    break;
            }
        },
        onCanvasMouseOver() {
            this.mouseOver = true;
        },
        onCanvasMouseLeave() {
            this.mouseOver = false;
            this.mouseLeftPressed = false;
            this.mouseRightPressed = false;
            if (this.currentToolActive) {
                this.currentToolActive = false;
                this.currentTool.onMouseUp(this as WorkspaceSkeleton);
            }
            this.render();
        },
        // ================ bone ================
        selectBone(bone: Bone) {
            this.currentBone = bone;
            this.render();
        },
        setBoneVector(bone: Bone, position: { x: number, y: number } | null, rotation: number, length: number) {
            const original = {
                position: bone.position && bone.position.clone(),
                rotation: bone.rotation,
                length: bone.length
            };
            const id = bone.id;
            history.applyAndRecord(
                Workspace.SKELETON,
                () => {
                    project.setBoneVector(
                        project.getBone(id),
                        position,
                        rotation,
                        length
                    );
                    this.render();
                },
                () => {
                    project.setBoneVector(
                        project.getBone(id),
                        original.position,
                        original.rotation,
                        original.length
                    );
                    this.render();
                },
                'setBoneVector#' + id
            );
        },
        confirmSetBoneVector(bone: Bone) {
            history.endMerge('setBoneVector#' + bone.id)
        },
        setBoneName(bone: Bone, name: string) {
            const oldName = bone.name;
            if (oldName === name) {
                return;
            }
            const id = bone.id;
            history.applyAndRecord(
                Workspace.SKELETON,
                () => {
                    project.setBoneName(project.getBone(id), name);
                },
                () => {
                    project.setBoneName(project.getBone(id), oldName);
                }
            );
        },
        setBoneVisibility(bone: Bone, visible: boolean) {
            const id = bone.id;
            history.applyAndRecord(
                Workspace.SKELETON,
                () => {
                    project.setBoneVisibility(project.getBone(id), visible);
                    this.render();
                },
                () => {
                    project.setBoneVisibility(project.getBone(id), !visible);
                    this.render();
                }
            );
        },
        setBoneBoneVisibility(bone: Bone, visible: boolean) {
            const id = bone.id;
            history.applyAndRecord(
                Workspace.SKELETON,
                () => {
                    project.setBoneBoneVisibility(project.getBone(id), visible);
                    this.render();
                },
                () => {
                    project.setBoneBoneVisibility(project.getBone(id), !visible);
                    this.render();
                }
            );
        },
        setBoneImageVisibility(bone: Bone, visible: boolean) {
            const id = bone.id;
            history.applyAndRecord(
                Workspace.SKELETON,
                () => {
                    project.setBoneImageVisibility(project.getBone(id), visible);
                    this.render();
                },
                () => {
                    project.setBoneImageVisibility(project.getBone(id), !visible);
                    this.render();
                }
            );
        },
        setBoneLayerId(bone: Bone, layerId: number) {
            const oldLayerId = bone.layerId;
            if (oldLayerId === layerId) {
                return;
            }
            const id = bone.id;
            history.applyAndRecord(
                Workspace.SKELETON,
                () => {
                    const bone = project.getBone(id);
                    project.setBoneLayerId(bone, layerId);
                    this.render();
                },
                () => {
                    const bone = project.getBone(id);
                    project.setBoneLayerId(bone, oldLayerId);
                    this.render();
                }
            );
            if (this.autoNaming) {
                const layer = project.getLayer(layerId);
                if (layer) {
                    this.setBoneName(bone, layer.name);
                }
            }
        },
        moveBone(bone: Bone, position: string, target: Bone) {
            if (bone.id < 0) {
                return;
            }
            const id = bone.id;
            const targetId = target.id;
            const restoreInfo = project.getBonePositionRestoreInfo(bone);
            history.applyAndRecord(
                Workspace.SKELETON,
                () => {
                    this.currentBone = project.moveBone(project.getBone(id), position, project.getBone(targetId));
                },
                () => {
                    this.currentBone = project.restoreBonePosition(restoreInfo);
                }
            );
        },
        newChildBone(parent?: Bone) {
            if (!(parent instanceof Bone)) {
                parent = this.currentBone;
            }
            const bone = this.currentBone = project.addBone(parent);
            const restoreInfo = project.getBoneRestoreInfo(bone);
            history.record(
                Workspace.SKELETON,
                () => {
                    const bone = this.currentBone = project.restoreBone(restoreInfo);
                    for (let curr = bone.parent; curr; curr = curr.parent) {
                        curr.expanded = true;
                    }
                },
                () => {
                    project.deleteBone(project.getBone(restoreInfo.id));
                    this.currentBone = project.state.bones;
                }
            );
        },
        newNeighboringBone() {
            this.newChildBone(this.currentBone && this.currentBone.parent || this.currentBone);
        },
        deleteBone() {
            if (this.currentBone) {
                if (this.currentBone.id < 0) {
                    return;
                }
                const restoreInfo = project.getBoneRestoreInfo(this.currentBone);
                history.applyAndRecord(
                    Workspace.SKELETON,
                    () => {
                        this.currentBone = project.deleteBone(project.getBone(restoreInfo.id));
                        this.render();
                    },
                    () => {
                        const bone = this.currentBone = project.restoreBone(restoreInfo);
                        for (let curr = bone.parent; curr; curr = curr.parent) {
                            curr.expanded = true;
                        }
                        this.render();
                    }
                );
            }
        }
    }
}) {
    ctx: CanvasRenderingContext2D = undefined as any;
    project: Project = project;
}
