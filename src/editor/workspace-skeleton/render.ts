import WorkspaceSkeletonClass from './WorkspaceSkeleton'

import Vec2 from '../../utils/Vec2'
import Renderer from '../../utils/Renderer'
import {transparentBackgroundShader} from '../shaders'

import Layer from '../project/Layer'
import LayerFolder from '../project/LayerFolder'
import Bone from '../project/Bone'

import drawCanvasRuler from '../draw-canvas-ruler'
import drawBone from '../draw-bone'

const renderer = Renderer.instance();

const BACKGROUND_GRID_SIZE = 4;
const UNSELECTED_IMAGES_OPACITY = 0.25;
const UNSELECTED_BONES_OPACITY = 0.25;

const layersFrameBufferInfo = renderer.createFrameBufferInfo();

export default function render(workspace: WorkspaceSkeletonClass) {
    const RULER_SIZE = workspace.RULER_SIZE;
    const ctx = workspace.ctx;
    const project = workspace.project;
    const canvasWidth = workspace.canvasWidth;
    const canvasHeight = workspace.canvasHeight;
    const contentWidth = canvasWidth - RULER_SIZE;
    const contentHeight = canvasHeight - RULER_SIZE;
    const zoom = workspace.zoom;
    const cameraX = workspace.cameraX;
    const cameraY = workspace.cameraY;
    const cx = Math.round(-cameraX * zoom + contentWidth / 2);
    const cy = Math.round(+cameraY * zoom + contentHeight / 2);

    if (contentWidth <= 0 || contentHeight <= 0) {
        return;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // ======================= background =======================
    renderer.resizeCanvas(contentWidth, contentHeight, true);
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
    const spriteX = Math.round(-cameraX * zoom + contentWidth / 2);
    const spriteY = Math.round(-cameraY * zoom + contentHeight / 2);
    const spriteWidth = project.state.width * zoom;
    const spriteHeight = project.state.height * zoom;

    if (workspace.displayImages) {
        const visibleLayerIds = project.getVisibleLayerIdBoneMap();
        renderer.useShader();
        renderer.startCapture(layersFrameBufferInfo);
        renderer.clear();
        renderLayers(
            workspace,
            project.state.layers,
            visibleLayerIds,
            spriteX,
            spriteY,
            spriteWidth,
            spriteHeight
        );
        renderer.endCapture();

        const highlightLayer = (workspace.lightenUnselectedImages && workspace.currentBone && workspace.currentBone.layerId != null) ?
            project.getLayer(workspace.currentBone.layerId)
            : null;
        renderer.useShader();
        if (highlightLayer != null && workspace.currentBone && workspace.currentBone.id >= 0) {
            renderer.setColor(UNSELECTED_IMAGES_OPACITY, UNSELECTED_IMAGES_OPACITY, UNSELECTED_IMAGES_OPACITY, UNSELECTED_IMAGES_OPACITY);
        }
        renderer.draw(
            layersFrameBufferInfo.attachments[0] as WebGLTexture,
            0,
            0,
            contentWidth,
            contentHeight
        );
        if (
            highlightLayer != null
            && workspace.currentBone && workspace.currentBone.visible && workspace.currentBone.imageVisible
        ) {
            const alpha = highlightLayer.opacity / 100;
            renderer.setColor(alpha, alpha, alpha, alpha);
            renderer.draw(
                project.getLayerTexture(highlightLayer),
                spriteX,
                spriteY,
                spriteWidth,
                spriteHeight
            );
        }
    }

    renderer.copyTo(ctx, RULER_SIZE, RULER_SIZE, contentWidth, contentHeight);

    // ======================= bones =======================
    if (workspace.displayBones) {
        const highlightBone = workspace.currentBone && workspace.currentBone.id >= 0 ? workspace.currentBone : null;
        const x0 = RULER_SIZE + cx;
        const y0 = RULER_SIZE + cy;
        drawBones(
            workspace,
            project.state.bones,
            highlightBone,
            x0,
            y0
        );

        do {
            if (workspace.showBoneEndpointIndicator) {
                const bone = workspace.currentBone;
                if (!bone || bone.id <= 0) {
                    break;
                }
                const v0 = bone.position;
                if (!v0) {
                    break;
                }
                const v1 = v0.add(new Vec2(bone.length, 0).rotate(0, 0, bone.rotation));

                ctx.save();

                ctx.beginPath();
                ctx.arc(
                    v0.x * zoom + x0,
                    -v0.y * zoom + y0,
                    workspace.BONE_ENDPOINT_0_INDICATOR_DISPLAY_RADIUS,
                    0,
                    Math.PI * 2
                );
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.strokeStyle = '#f62';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(
                    v1.x * zoom + x0,
                    -v1.y * zoom + y0,
                    workspace.BONE_ENDPOINT_1_INDICATOR_DISPLAY_RADIUS,
                    0,
                    Math.PI * 2
                );
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.strokeStyle = '#f62';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.restore();
            }
        } while (false);
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

function renderLayers(
    workspace: WorkspaceSkeletonClass,
    layers: Array<Layer | LayerFolder>,
    visibleLayers: { [id: number]: any },
    x: number,
    y: number,
    width: number,
    height: number
) {
    const project = workspace.project;
    for (let i = layers.length - 1; i >= 0; --i) {
        const layer = layers[i];
        if (layer.visible) {
            if (visibleLayers.hasOwnProperty(layer.id)) {
                const texture = project.getLayerTexture(layer);
                const alpha = layer.opacity / 100;
                renderer.setColor(alpha, alpha, alpha, alpha);
                renderer.draw(texture, x, y, width, height);
            } else if (layer instanceof LayerFolder) {
                renderLayers(workspace, layer.children, visibleLayers, x, y, width, height);
            }
        }
    }
}

function drawBones(
    workspace: WorkspaceSkeletonClass,
    bone: Bone,
    highlightBone: Bone | null,
    x0: number,
    y0: number
) {
    if (!bone.visible) {
        return;
    }
    if (bone.id >= 0 && bone.position && bone.boneVisible) {
        const ctx = workspace.ctx;
        const zoom = workspace.zoom;
        const v0 = bone.position;
        const v1 = v0.add(new Vec2(bone.length, 0).rotate(0, 0, bone.rotation));
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
    for (let i = bone.children.length - 1; i >= 0; --i) {
        const child = bone.children[i];
        drawBones(workspace, child, highlightBone, x0, y0);
    }
}
