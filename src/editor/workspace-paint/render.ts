import WorkspacePaint from './WorkspacePaint'
import Project from '../project/Project'
import Layer from '../project/Layer'
import BrushTool from './tools/BrushTool'

import {transparentBackgroundShader, brushIndicatorShader} from '../shaders'

const renderer = Project.instance().renderer;

const canvasBackgroundAndLayersRenderResultFrameBufferInfo = renderer.createFrameBufferInfo();
const layersRenderResultFrameBufferInfo = renderer.createFrameBufferInfo();

export default function render(paint: WorkspacePaint) {
    const width = paint.projectState.width;
    const height = paint.projectState.height;
    const zoom = paint.zoom;
    const canvasWidth = width * zoom;
    const canvasHeight = height * zoom;

    renderer.resizeCanvas(canvasWidth, canvasHeight);

    // ================================================
    renderer.resize(width, height, true);
    renderer.startCapture(canvasBackgroundAndLayersRenderResultFrameBufferInfo);
    renderer.clear();

    // transparent background
    renderer.useShader(transparentBackgroundShader);
    const backgroundColor1 = paint.projectState.backgroundColor.color1;
    const backgroundColor2 = paint.projectState.backgroundColor.color2;
    renderer.setUniforms({
        u_resolution: [width, height],
        u_gridColor1: [backgroundColor1.r / 0xff, backgroundColor1.g / 0xff, backgroundColor1.b / 0xff, 1],
        u_gridColor2: [backgroundColor2.r / 0xff, backgroundColor2.g / 0xff, backgroundColor2.b / 0xff, 1],
        u_gridSize: [4, 4],
        u_offset: [0, 0]
    });
    renderer.draw();

    let renderResultChanged = false;

    // layers
    if (paint.project.shouldReRender) {
        renderer.startCapture(layersRenderResultFrameBufferInfo);
        renderer.clear();
        paint.project.renderLayers(
            paint.project.state.layers,
            (renderer, layer, texture) => {
                if (paint.drawing && layer === paint.currentLayer && paint.editingLayerTextureCache.isValid()) {
                    renderer.draw(paint.editingLayerTextureCache.getTexture(), layer.offsetX, layer.offsetY);
                    return true;
                }
                return false;
            }
        );
        renderer.endCapture();
        paint.project.shouldReRender = false;
        renderResultChanged = true;
    }

    renderer.useShader();
    renderer.draw(layersRenderResultFrameBufferInfo.attachments[0]);
    renderer.endCapture();
    // ================================================

    if (!paint.renderResult || renderResultChanged) {
        paint.renderResult = renderer.readPixels(layersRenderResultFrameBufferInfo);
    }

    // canvas
    renderer.resize(canvasWidth, canvasHeight, true);
    renderer.useShader();
    renderer.clear();
    renderer.draw(canvasBackgroundAndLayersRenderResultFrameBufferInfo.attachments[0]);

    renderer.copyTo(paint.ctxPreview, 0, 0, width * paint.previewZoom, height * paint.previewZoom);

    // brush indicator
    if (paint.canvasMouseOver
        && paint.currentLayer && paint.currentLayer.visible
        && paint.currentTool instanceof BrushTool
        && (paint.currentLayer instanceof Layer || paint.currentTool.canBeUsedOnFolder)
    ) {
        const size = paint.currentTool.size;
        renderer.useShader(brushIndicatorShader);
        renderer.setUniforms({
            u_brushSize: [size * zoom, size * zoom],
            u_back: canvasBackgroundAndLayersRenderResultFrameBufferInfo.attachments[0],
            u_backSize: [canvasWidth, canvasHeight]
        });
        renderer.draw(
            paint.currentTool.getIndicatorTexture(),
            (paint.canvasMouseX - (size >> 1)) * zoom,
            (height - paint.canvasMouseY - Math.ceil(size / 2)) * zoom,
            size * zoom,
            size * zoom
        );
    }

    renderer.copyTo(paint.ctx);
}
