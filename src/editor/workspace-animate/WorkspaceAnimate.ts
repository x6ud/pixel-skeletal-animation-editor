import Vue from 'vue'

import {Workspace} from '../Workspace'
import Project from '../project/Project'
import Bone from '../project/Bone'
import Animation from '../project/Animation'
import History from '../History'

import HorizontalSplit from '../components/HorizontalSplit.vue'
import VerticalSplit from '../components/VerticalSplit.vue'
import InputNumber from '../components/InputNumber.vue'
import NumberRange from '../components/NumberRange.vue'

import BoneTree from '../workspace-skeleton/components/BoneTree.vue'
import AnimationsList from './components/AnimationsList.vue'
import AnimationTimeline from './components/AnimationTimeline.vue'
import AnimationTimelineClass from './components/AnimationTimeline'

import Tool from './tools/Tool'
import CursorTool from './tools/CursorTool'
import MoveTool from './tools/Move'
import RotateTool from './tools/Rotate'

import render from './render'
import {MouseButton} from '../../utils/MouseButton'

const project = Project.instance();
const history = History.instance();

const MAX_ZOOM = 24;
const RULER_SIZE = 16;
const BONE_DISPLAY_RADIUS = 8.5;

export default class WorkspaceAnimate extends Vue.extend({
    components: {
        HorizontalSplit,
        VerticalSplit,
        InputNumber,
        NumberRange,

        BoneTree,
        AnimationsList,
        AnimationTimeline
    },
    data() {
        const tools: Array<Tool> = [
            new CursorTool(),
            new MoveTool(),
            new RotateTool()
        ];
        return {
            RULER_SIZE,
            BONE_DISPLAY_RADIUS,

            tools,
            currentTool: tools[0],
            currentToolActive: false,
            snapToPixel: true,
            lightenUnselectedBones: true,
            displayBones: true,
            displayImages: true,

            rightWrapperSize: 300,
            animationsWrapperSize: 200,

            projectState: project.state,
            /**
             * Current selected bone
             */
            currentBone: undefined as Bone | undefined,
            /**
             * Current selected animation
             */
            currentAnimation: undefined as Animation | undefined,
            /**
             * Info displayed in the lower left corner when a bone is selected
             */
            currentFrameBoneTransformInfo: {
                name: '' as string,
                translateX: 0 as number | string,
                translateY: 0 as number | string,
                rotate: 0 as number | string
            },

            /**
             * Timeline zoom
             */
            timelineStep: 1,
            /**
             * View window position
             */
            timelinePosition: 0,
            /**
             * Current frame index
             */
            timelineCurrent: 0,
            /**
             * Id of setInterval
             */
            playTid: null as any,
            /**
             * Whether the animation is playing
             */
            playing: false,

            canvasWidth: 1,
            canvasHeight: 1,
            updateCanvasSizeTid: null as any,

            zoom: 6,
            cameraX: 0,
            cameraY: 0,
            /**
             * Is mouse over canvas
             */
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
            style.cursor = this.currentTool.cursor;
            return style;
        },
        timelineFrameDuration(): string {
            if (!(this.currentAnimation)) {
                return '0s';
            }
            const secsPerFrame = 1000 / this.currentAnimation.fps;
            return Number(secsPerFrame.toFixed(1)) + 'ms';
        },
        timelineDuration(): string {
            if (!(this.currentAnimation && this.currentAnimation.timeline.length)) {
                return '0s';
            }
            const secsPerFrame = 1 / this.currentAnimation.fps;
            const lastFrame = this.currentAnimation.timeline[this.currentAnimation.timeline.length - 1].frameIndex;
            const secs = secsPerFrame * (lastFrame + 1);
            return Number(secs.toFixed(2)) + 's';
        }
    },
    mounted() {
        const canvas = this.$refs.canvas as HTMLCanvasElement;
        (this as WorkspaceAnimate).ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.init();

        this.updateCanvasSizeTid = setInterval(this.updateCanvasSize, 1000 / 30);
        this.updateCanvasSize();
    },
    beforeDestroy() {
        this.stop();
        clearInterval(this.updateCanvasSizeTid);
    },
    activated() {
        this.selectBone(project.state.bones);
        project.fillKeyframesMissingBoneTransform();
        this.render();
    },
    watch: {
        'projectState.timestamp'() {
            this.init();
        },
        'currentAnimation.id'() {
            this.stop();
            this.timelineCurrent = 0;
            this.timelineScrollToCurrent();
            this.render();
            this.updateCurrentFrameBoneTransformInfo();
        },
        'currentBone.id'() {
            this.updateCurrentFrameBoneTransformInfo();
        },
        timelineCurrent() {
            this.render();
            this.updateCurrentFrameBoneTransformInfo();
        },
        'projectState.backgroundColor': {
            deep: true,
            handler() {
                this.render();
            }
        }
    },
    methods: {
        init() {
            this.stop();
            this.currentBone = this.projectState.bones;
            this.currentAnimation = this.projectState.animations[0];
            this.timelineCurrent = 0;
            this.timelineScrollToCurrent();
            this.centerView();
            this.updateCurrentFrameBoneTransformInfo();
        },
        centerView() {
            this.cameraX = this.projectState.width / 2;
            this.cameraY = this.projectState.height / 2;
            this.render();
        },
        // ================ canvas ================
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
                    this.currentTool.onMouseDown(this as WorkspaceAnimate, this.cameraX + mouseX, this.cameraY - mouseY);
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
                this.currentTool.onMouseMove(this as WorkspaceAnimate, this.cameraX + mouseX, this.cameraY - mouseY);
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
                        this.currentTool.onMouseUp(this as WorkspaceAnimate);
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
                this.currentTool.onMouseUp(this as WorkspaceAnimate);
            }
            this.render();
        },
        render() {
            this.$nextTick(() => {
                requestAnimationFrame(() => render(this as WorkspaceAnimate));
            });
        },
        // ================ transform ================
        setCurrentKeyframeTransform(translateX: number, translateY: number, rotate: number) {
            if (!this.currentAnimation) {
                return;
            }
            if (!this.currentBone) {
                return;
            }

            const animationId = this.currentAnimation.id;
            const frameIndex = this.timelineCurrent;
            const boneId = this.currentBone.id;
            const restoreInfo = project.getKeyframeTransformRestoreInfo(this.currentAnimation, this.timelineCurrent, this.currentBone);

            history.applyAndRecord(
                Workspace.ANIMATE,
                () => {
                    project.setKeyframeBoneTransform(
                        this.currentAnimation = project.getAnimation(animationId),
                        frameIndex,
                        project.getBone(boneId),
                        translateX,
                        translateY,
                        rotate
                    );
                    this.timelineCurrent = frameIndex;
                    this.render();
                    this.renderTimeline();
                    this.updateCurrentFrameBoneTransformInfo();
                },
                () => {
                    project.restoreKeyframeTransform(restoreInfo);
                    this.currentAnimation = project.getAnimation(animationId);
                    this.timelineCurrent = frameIndex;
                    this.render();
                    this.renderTimeline();
                    this.updateCurrentFrameBoneTransformInfo();
                },
                `setKeyframeTransform#${animationId}#${frameIndex}#${boneId}`
            );
        },
        confirmSetCurrentKeyframeTransform() {
            if (!this.currentAnimation) {
                return;
            }
            if (!this.currentBone) {
                return;
            }
            const animationId = this.currentAnimation.id;
            const frameIndex = this.timelineCurrent;
            const boneId = this.currentBone.id;
            history.endMerge(`setKeyframeTransform#${animationId}#${frameIndex}#${boneId}`);
        },
        updateCurrentFrameBoneTransformInfo() {
            if (!this.currentAnimation) {
                return;
            }
            if (!this.currentBone) {
                return;
            }
            this.currentFrameBoneTransformInfo.name = this.currentBone.name;
            const transform = project.getFrameBoneTransform(this.currentAnimation, this.timelineCurrent, this.currentBone);
            this.currentFrameBoneTransformInfo.translateX = Number(transform.translateX.toFixed(1));
            this.currentFrameBoneTransformInfo.translateY = Number(transform.translateY.toFixed(1));
            this.currentFrameBoneTransformInfo.rotate = Number((transform.rotate / Math.PI * 180).toFixed(1));
        },
        // ================ timeline ================
        renderTimeline() {
            const timeline = this.$refs.timeline as AnimationTimelineClass;
            if (timeline) {
                this.$nextTick(() => {
                    timeline.render();
                });
            }
        },
        timelineScrollToCurrent() {
            const timeline = this.$refs.timeline as AnimationTimelineClass;
            if (timeline) {
                this.$nextTick(() => {
                    timeline.scrollToCurrent();
                    timeline.render();
                });
            }
        },
        timelineScrollViewWindow() {
            const timeline = this.$refs.timeline as AnimationTimelineClass;
            if (timeline) {
                this.$nextTick(() => {
                    timeline.scrollViewWindow();
                    timeline.render();
                });
            }
        },
        setAnimationFps(fps: number) {
            this.stop();
            if (!this.currentAnimation) {
                return;
            }
            const animationId = this.currentAnimation.id;
            const oldFps = this.currentAnimation.fps;
            history.applyAndRecord(
                Workspace.ANIMATE,
                () => {
                    this.stop();
                    project.setAnimationFps(this.currentAnimation = project.getAnimation(animationId), fps);
                },
                () => {
                    this.stop();
                    project.setAnimationFps(this.currentAnimation = project.getAnimation(animationId), oldFps);
                },
                'setAnimationFps#' + animationId
            );
        },
        toggleAnimationLoop() {
            this.stop();
            if (!this.currentAnimation) {
                return;
            }
            this.currentAnimation.loop = !this.currentAnimation.loop;
        },
        moveKeyframe(frameIndex: number, position: number) {
            this.stop();
            const animation = this.currentAnimation;
            if (!animation) {
                return;
            }
            const originKeyframe = project.getKeyframe(animation, position);
            const restoreInfo = originKeyframe ? project.getKeyframeRestoreInfo(animation, position) : undefined;
            const animationId = animation.id;
            history.applyAndRecord(
                Workspace.ANIMATE,
                () => {
                    this.stop();
                    if (restoreInfo) {
                        project.deleteKeyframe(project.getAnimation(animationId), position);
                    }
                    project.moveKeyframe(this.currentAnimation = project.getAnimation(animationId), frameIndex, position);
                    this.timelineCurrent = position;
                    this.renderTimeline();
                    this.render();
                },
                () => {
                    this.stop();
                    project.moveKeyframe(this.currentAnimation = project.getAnimation(animationId), position, frameIndex);
                    if (restoreInfo) {
                        project.restoreKeyframe(restoreInfo);
                    }
                    this.timelineCurrent = frameIndex;
                    this.renderTimeline();
                    this.render();
                }
            )
        },
        addKeyframe() {
            this.stop();
            if (!this.currentAnimation) {
                return;
            }
            if (project.getKeyframe(this.currentAnimation, this.timelineCurrent)) {
                return;
            }

            project.addKeyframe(this.currentAnimation, this.timelineCurrent);
            this.timelineScrollToCurrent();

            const restoreInfo = project.getKeyframeRestoreInfo(this.currentAnimation, this.timelineCurrent);
            history.record(
                Workspace.ANIMATE,
                () => {
                    this.stop();
                    project.restoreKeyframe(restoreInfo);
                    this.currentAnimation = project.getAnimation(restoreInfo.animationId);
                    this.timelineCurrent = restoreInfo.frameIndex;
                    this.timelineScrollToCurrent();
                    this.render();
                },
                () => {
                    this.stop();
                    project.deleteKeyframe(this.currentAnimation = project.getAnimation(restoreInfo.animationId), restoreInfo.frameIndex);
                    this.renderTimeline();
                    this.render();
                }
            )
        },
        deleteKeyframe() {
            this.stop();
            if (!this.currentAnimation) {
                return;
            }
            if (!project.getKeyframe(this.currentAnimation, this.timelineCurrent)) {
                return;
            }
            const restoreInfo = project.getKeyframeRestoreInfo(this.currentAnimation, this.timelineCurrent);
            history.applyAndRecord(
                Workspace.ANIMATE,
                () => {
                    this.stop();
                    project.deleteKeyframe(this.currentAnimation = project.getAnimation(restoreInfo.animationId), restoreInfo.frameIndex);
                    this.renderTimeline();
                    this.render();
                },
                () => {
                    this.stop();
                    project.restoreKeyframe(restoreInfo);
                    this.currentAnimation = project.getAnimation(restoreInfo.animationId);
                    this.timelineCurrent = restoreInfo.frameIndex;
                    this.timelineScrollToCurrent();
                    this.render();
                }
            );
        },
        frameMoveLeft() {
            this.stop();
            if (!(this.currentAnimation && this.currentAnimation.timeline.length)) {
                return;
            }
            const frameIndex = this.timelineCurrent;
            const animationId = this.currentAnimation.id;
            if (project.frameMoveLeft(this.currentAnimation, frameIndex)) {
                this.timelineCurrent = frameIndex - 1;
                this.timelineScrollToCurrent();
                history.record(
                    Workspace.ANIMATE,
                    () => {
                        this.stop();
                        project.frameMoveLeft(this.currentAnimation = project.getAnimation(animationId), frameIndex);
                        this.timelineCurrent = frameIndex - 1;
                        this.timelineScrollToCurrent();
                        this.render();
                    },
                    () => {
                        this.stop();
                        project.frameMoveRight(this.currentAnimation = project.getAnimation(animationId), frameIndex);
                        this.timelineCurrent = frameIndex;
                        this.timelineScrollToCurrent();
                        this.render();
                    }
                );
            }
        },
        frameMoveRight() {
            this.stop();
            if (!(this.currentAnimation && this.currentAnimation.timeline.length)) {
                return;
            }
            const frameIndex = this.timelineCurrent;
            const animationId = this.currentAnimation.id;
            if (project.frameMoveRight(this.currentAnimation, this.timelineCurrent)) {
                this.timelineCurrent = frameIndex + 1;
                this.timelineScrollToCurrent();
                history.record(
                    Workspace.ANIMATE,
                    () => {
                        this.stop();
                        project.frameMoveRight(this.currentAnimation = project.getAnimation(animationId), frameIndex);
                        this.timelineCurrent = frameIndex + 1;
                        this.timelineScrollToCurrent();
                        this.render();
                    },
                    () => {
                        this.stop();
                        project.frameMoveLeft(this.currentAnimation = project.getAnimation(animationId), frameIndex);
                        this.timelineCurrent = frameIndex;
                        this.timelineScrollToCurrent();
                        this.render();
                    }
                );
            }
        },
        firstFrame() {
            this.stop();
            if (!(this.currentAnimation && this.currentAnimation.timeline.length)) {
                return;
            }
            this.timelineCurrent = this.currentAnimation.timeline[0].frameIndex;
            this.timelineScrollToCurrent();
            this.render();
        },
        prevFrame() {
            this.stop();
            this.timelineCurrent = Math.max(0, this.timelineCurrent - 1);
            this.timelineScrollToCurrent();
            this.render();
        },
        nextFrame() {
            this.stop();
            this.timelineCurrent += 1;
            this.timelineScrollToCurrent();
            this.render();
        },
        lastFrame() {
            this.stop();
            if (!(this.currentAnimation && this.currentAnimation.timeline.length)) {
                return;
            }
            this.timelineCurrent = this.currentAnimation.timeline[this.currentAnimation.timeline.length - 1].frameIndex;
            this.timelineScrollToCurrent();
            this.render();
        },
        onTimelineKeydown(e: KeyboardEvent) {
            switch (e.key) {
                case 'ArrowLeft':
                    this.prevFrame();
                    break;
                case 'ArrowRight':
                    this.nextFrame();
                    break;
                case 'Delete':
                    this.deleteKeyframe();
                    break;
            }
        },
        // ================ play ================
        play() {
            this.stop();
            if (!this.currentAnimation) {
                return;
            }
            const animation = this.currentAnimation;
            const lastFrame = animation.timeline[animation.timeline.length - 1];
            if (!lastFrame) {
                return;
            }
            const lastFrameIndex = lastFrame.frameIndex;
            const loop = animation.loop;
            this.timelineCurrent = 0;
            this.playing = true;
            this.playTid = setInterval(() => {
                if (this.timelineCurrent < lastFrameIndex) {
                    this.timelineCurrent += 1;
                    this.timelineScrollViewWindow();
                } else if (loop) {
                    this.timelineCurrent = 0;
                    this.timelineScrollViewWindow();
                } else {
                    this.stop();
                }
            }, 1000 / animation.fps);
        },
        stop() {
            this.playing = false;
            if (this.playTid != null) {
                clearInterval(this.playTid);
                this.playTid = null;
            }
        },
        // ================ bones ================
        selectBone(bone: Bone) {
            this.currentBone = bone;
            this.render();
        },
        setBoneVisibility(bone: Bone, visible: boolean) {
            const id = bone.id;
            history.applyAndRecord(
                Workspace.ANIMATE,
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
                Workspace.ANIMATE,
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
                Workspace.ANIMATE,
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
        // ================ animations ================
        selectAnimation(animation: Animation) {
            this.currentAnimation = animation;
        },
        addAnimation() {
            const animation = this.currentAnimation = project.addAnimation();
            const id = animation.id;
            const restoreInfo = project.getAnimationRestoreInfo(animation);
            history.record(
                Workspace.ANIMATE,
                () => {
                    this.currentAnimation = project.restoreAnimation(restoreInfo);
                },
                () => {
                    this.currentAnimation = project.deleteAnimation(project.getAnimation(id));
                }
            );
        },
        deleteAnimation() {
            if (!this.currentAnimation) {
                return;
            }
            const restoreInfo = project.getAnimationRestoreInfo(this.currentAnimation);
            const id = this.currentAnimation.id;
            history.applyAndRecord(
                Workspace.ANIMATE,
                () => {
                    this.currentAnimation = project.deleteAnimation(project.getAnimation(id));
                },
                () => {
                    this.currentAnimation = project.restoreAnimation(restoreInfo);
                }
            );
        },
        moveAnimation(animation: Animation, position: string, target: Animation) {
            const restoreInfo = project.getAnimationPositionRestoreInfo(animation);
            const animationId = animation.id;
            const targetId = target.id;
            history.applyAndRecord(
                Workspace.ANIMATE,
                () => {
                    this.currentAnimation = project.moveAnimation(
                        project.getAnimation(animationId),
                        position,
                        project.getAnimation(targetId)
                    );
                },
                () => {
                    this.currentAnimation = project.restoreAnimationPosition(restoreInfo);
                }
            );
        }
    }
}) {
    project: Project = project;
    ctx: CanvasRenderingContext2D = undefined as any;
}
