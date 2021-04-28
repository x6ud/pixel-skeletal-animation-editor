import WorkspaceAnimateClass from './WorkspaceAnimate'

import Vec2 from '../../utils/Vec2'
import {multiply, transformVec2} from '../../utils/mat'
import Renderer from '../../utils/Renderer'
import {transparentBackgroundShader, downscale3xShader} from '../shaders'

import Layer from '../project/Layer'
import LayerFolder from '../project/LayerFolder'
import Bone from '../project/Bone'
import Animation from '../project/Animation'
import BoneTransform from '../project/BoneTransform'

import drawCanvasRuler from '../draw-canvas-ruler'
import drawBone from '../draw-bone'

const renderer = Renderer.instance();

const BACKGROUND_GRID_SIZE = 4;
const UNSELECTED_IMAGES_OPACITY = 0.25;
const UNSELECTED_BONES_OPACITY = 0.25;

const x3layersFrameBufferInfo = renderer.createFrameBufferInfo();
const x1layersFrameBufferInfo = renderer.createFrameBufferInfo();

export default function render(workspace: WorkspaceAnimateClass) {
    const RULER_SIZE = workspace.RULER_SIZE;
    const ctx = workspace.ctx;
    const project = workspace.project;
    const canvasWidth = workspace.canvasWidth;
    const canvasHeight = workspace.canvasHeight;
    const contentWidth = canvasWidth - RULER_SIZE;
    const contentHeight = canvasHeight - RULER_SIZE;

    if (contentWidth <= 0 || contentHeight <= 0) {
        return;
    }

    const zoom = workspace.zoom;
    const cameraX = workspace.cameraX;
    const cameraY = workspace.cameraY;
    const cx = Math.round(-cameraX * zoom + contentWidth / 2);
    const cy = Math.round(+cameraY * zoom + contentHeight / 2);

    const animation = workspace.currentAnimation;
    const frameIndex = workspace.timelineCurrent;
    const frameTransformMap: { [id: number]: BoneTransform } | null =
        animation ? project.getFrameBoneTransformMap(animation, frameIndex) : null;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    project.preRenderX3Textures();
    const rendererCanvasWidth = contentWidth;
    const rendererCanvasHeight = contentHeight;
    renderer.resizeCanvas(rendererCanvasWidth, rendererCanvasHeight);

    // ======================= layers =======================
    const x1ViewWidth = Math.ceil(contentWidth / zoom);
    const x1ViewHeight = Math.ceil(contentHeight / zoom);
    const x1CameraX = Math.round(-cameraX + x1ViewWidth / 2);
    const x1CameraY = Math.round(-cameraY + x1ViewHeight / 2);

    if (animation && frameTransformMap && workspace.displayImages) {
        // x3
        renderer.resize(x1ViewWidth * 3, x1ViewHeight * 3, true);
        renderer.useShader();
        renderer.startCapture(x3layersFrameBufferInfo);
        renderer.clear();
        renderX3Layers(
            workspace,
            project.state.layers,
            project.getVisibleLayerIdBoneMap(),
            animation,
            frameIndex,
            frameTransformMap,
            x1CameraX * 3,
            x1CameraY * 3,
            project.state.width * 3,
            project.state.height * 3
        );
        renderer.endCapture();

        // x1
        renderer.resize(x1ViewWidth, x1ViewHeight, true);
        renderer.useShader(downscale3xShader);
        renderer.setUniforms({
            u_inputSize: [x1ViewWidth * 3, x1ViewHeight * 3]
        });
        renderer.startCapture(x1layersFrameBufferInfo);
        renderer.clear();
        renderer.draw(x3layersFrameBufferInfo.attachments[0]);
        renderer.endCapture();
    }

    // ======================= background =======================
    renderer.resize(contentWidth, contentHeight, true);
    renderer.clear();
    renderer.useShader(transparentBackgroundShader);
    const backgroundColor1 = project.state.backgroundColor.color1;
    const backgroundColor2 = project.state.backgroundColor.color2;
    const gridSize = BACKGROUND_GRID_SIZE * zoom;
    renderer.setUniforms({
        u_resolution: [contentWidth, contentHeight],
        u_gridColor1: [backgroundColor1.r / 0xff, backgroundColor1.g / 0xff, backgroundColor1.b / 0xff, 1],
        u_gridColor2: [backgroundColor2.r / 0xff, backgroundColor2.g / 0xff, backgroundColor2.b / 0xff, 1],
        u_gridSize: [gridSize, gridSize],
        u_offset: [cx, cy]
    });
    renderer.draw();

    // ======================= layers =======================
    if (animation && workspace.displayImages) {
        const dx = Math.round(-cameraX * zoom + contentWidth / 2);
        const dy = Math.round(-cameraY * zoom + contentHeight / 2);
        renderer.useShader();
        renderer.draw(
            x1layersFrameBufferInfo.attachments[0],
            -x1CameraX * zoom + dx,
            -x1CameraY * zoom + dy,
            x1ViewWidth * zoom,
            x1ViewHeight * zoom
        );
    }

    renderer.copyTo(
        ctx,
        RULER_SIZE,
        RULER_SIZE,
        contentWidth,
        contentHeight,
        0,
        rendererCanvasHeight - contentHeight,
        contentWidth,
        contentHeight
    );

    // ======================= bones =======================
    if (frameTransformMap && workspace.displayBones) {
        const highlightBone = workspace.currentBone && workspace.currentBone.id >= 0 ? workspace.currentBone : null;
        const x0 = RULER_SIZE + cx;
        const y0 = RULER_SIZE + cy;

        drawBones(
            workspace,
            frameTransformMap,
            project.state.bones,
            highlightBone,
            x0,
            y0,
            [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ]
        );
    }

    // ======================= center axis =======================
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(RULER_SIZE, RULER_SIZE + cy - 0.5);
    ctx.lineTo(canvasWidth, RULER_SIZE + cy - 0.5);
    ctx.moveTo(RULER_SIZE + cx - 0.5, RULER_SIZE);
    ctx.lineTo(RULER_SIZE + cx - 0.5, canvasHeight);
    ctx.closePath();
    ctx.stroke();

    // ======================= ruler =======================
    drawCanvasRuler(
        ctx,
        canvasWidth,
        canvasHeight,
        RULER_SIZE,
        zoom,
        cameraX,
        cameraY,
        workspace.mouseOver,
        workspace.mouseX,
        workspace.mouseY,
        workspace.snapToPixel
    );
}

function renderX3Layers(
    workspace: WorkspaceAnimateClass,
    layers: Array<Layer | LayerFolder>,
    visibleLayerIdBoneMap: { [id: number]: Bone },
    animation: Animation,
    frameIndex: number,
    transformMap: { [id: number]: BoneTransform },
    x: number,
    y: number,
    width: number,
    height: number
) {
    const project = workspace.project;
    for (let i = layers.length - 1; i >= 0; --i) {
        const layer = layers[i];
        if (layer.visible) {
            if (visibleLayerIdBoneMap.hasOwnProperty(layer.id)) {
                const texture = project.getX3LayerTexture(layer);
                const alpha = layer.opacity / 100;
                renderer.setColor(alpha, alpha, alpha, alpha);

                const bone = visibleLayerIdBoneMap[layer.id];
                const mat = project.getFrameBoneWorldTransformMat33(
                    animation,
                    frameIndex,
                    bone,
                    transformMap
                );
                const dx = mat[2][0] * 3;
                const dy = mat[2][1] * 3;
                const rotation = Math.atan2(mat[0][1], mat[0][0]);

                renderer.draw(
                    texture,
                    x + dx,
                    y + dy,
                    width,
                    height,
                    0,
                    0,
                    rotation,
                    false,
                    false
                );
            } else if (layer instanceof LayerFolder) {
                renderX3Layers(
                    workspace,
                    layer.children,
                    visibleLayerIdBoneMap,
                    animation,
                    frameIndex,
                    transformMap,
                    x,
                    y,
                    width,
                    height
                );
            }
        }
    }
}

function drawBones(
    workspace: WorkspaceAnimateClass,
    boneTransformMap: { [id: number]: BoneTransform },
    bone: Bone,
    highlightBone: Bone | null,
    x0: number,
    y0: number,
    mat: number[][]
) {
    if (!bone.visible) {
        return;
    }
    if (bone.id >= 0 && bone.position) {
        if (boneTransformMap.hasOwnProperty(bone.id)) {
            const boneTransform = boneTransformMap[bone.id];
            const cos = Math.cos(boneTransform.rotate);
            const sin = Math.sin(boneTransform.rotate);
            mat = multiply(
                [
                    [1, 0, 0],
                    [0, 1, 0],
                    [-bone.position.x, -bone.position.y, 1]
                ],
                [
                    [cos, sin, 0],
                    [-sin, cos, 0],
                    [0, 0, 1]
                ],
                [
                    [1, 0, 0],
                    [0, 1, 0],
                    [bone.position.x, bone.position.y, 1]
                ],
                [
                    [1, 0, 0],
                    [0, 1, 0],
                    [boneTransform.translateX, boneTransform.translateY, 1]
                ],
                mat
            );
        }
        if (bone.boneVisible) {
            const ctx = workspace.ctx;
            const zoom = workspace.zoom;
            const v0 = transformVec2(mat, bone.position);
            const v1 = transformVec2(mat, bone.position.add(new Vec2(bone.length, 0).rotate(0, 0, bone.rotation)));
            ctx.save();
            ctx.strokeStyle = '#000';
            ctx.fillStyle = '#fff';
            if (workspace.lightenUnselectedBones && highlightBone && highlightBone !== bone) {
                ctx.globalAlpha = UNSELECTED_BONES_OPACITY;
            }
            if (highlightBone === bone) {
                ctx.fillStyle = '#cef';
            }
            drawBone(
                ctx,
                workspace.BONE_DISPLAY_RADIUS,
                v0.x * zoom + x0,
                -v0.y * zoom + y0,
                v1.x * zoom + x0,
                -v1.y * zoom + y0,
            );
            ctx.stroke();
            ctx.fill();
            ctx.restore();
        }
    }
    for (let i = bone.children.length - 1; i >= 0; --i) {
        const child = bone.children[i];
        drawBones(workspace, boneTransformMap, child, highlightBone, x0, y0, mat);
    }
}
