import WorkspacePaint from '../WorkspacePaint'
import BrushTool from './BrushTool'
import PenProperties from './PenProperties.vue'
import icon from '../../../assets/editor/paint/tools/pen.png'
import {BrushShapeType} from '../brush/BrushShapeType'
import {MouseButton} from '../../../utils/MouseButton'
import {BrushDrawingMask, getBrushDrawingMask} from '../brush/brush-drawing-mask'
import Layer from '../../project/Layer'

enum Mode {
    SIMPLE_INK = 0,
    COPY_RGBA = 1,
    LOCK_ALPHA = 2
}

export default class Pen extends BrushTool {

    id = 'pen';
    name = 'Pen';
    icon = icon;
    propertiesComponent = PenProperties;
    size = 1;
    shape = BrushShapeType.RECT;
    mode = Mode.SIMPLE_INK;

    private asEraser: boolean = false;
    private brushDrawingMask?: BrushDrawingMask;
    private lastX: number = 0;
    private lastY: number = 0;
    private layerData?: Uint8Array;

    onMouseDown(paint: WorkspacePaint, button: number, x: number, y: number): void {
        this.asEraser = button === MouseButton.RIGHT;
        this.brushDrawingMask = getBrushDrawingMask(this.size, this.shape);
        this.brushDrawingMask.start(paint.projectState.width, paint.projectState.height);
        this.lastX = x;
        this.lastY = y;
    }

    onMouseMove(paint: WorkspacePaint, x: number, y: number): void {
        if (!(this.brushDrawingMask && this.brushDrawingMask.mask)) {
            return;
        }
        this.brushDrawingMask.line(this.lastX, this.lastY, x, y);
        this.lastX = x;
        this.lastY = y;

        const mask = this.brushDrawingMask.mask;
        const project = paint.project;
        const layer = paint.currentLayer as Layer;
        const data = project.getLayerImageData(layer).slice();
        const width = project.state.width;
        const height = project.state.height;

        const srcAlpha = paint.brushOpacity / 100;
        const srcR = paint.currentColor.r;
        const srcG = paint.currentColor.g;
        const srcB = paint.currentColor.b;
        const srcA = Math.round(srcAlpha * 0xff);

        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {
                if (mask.get(x, y)) {
                    if (this.asEraser) {
                        project.setPixel(data, x, y, [0, 0, 0, 0]);
                    } else {
                        const dst = project.getPixel(data, x, y);
                        switch (this.mode) {
                            case Mode.SIMPLE_INK: {
                                const srcMix = srcA / Math.max(srcA, dst[3]) || 0;
                                const dstMix = 1 - srcMix;
                                const r = Math.max(0, Math.min(0xff, Math.round(srcR * srcMix + dst[0] * dstMix)));
                                const g = Math.max(0, Math.min(0xff, Math.round(srcG * srcMix + dst[1] * dstMix)));
                                const b = Math.max(0, Math.min(0xff, Math.round(srcB * srcMix + dst[2] * dstMix)));
                                const a = Math.max(0, Math.min(0xff, Math.round(srcA + dst[3] * (1 - srcAlpha))));
                                project.setPixel(data, x, y, [r, g, b, a]);
                            }
                                break;
                            case Mode.COPY_RGBA: {
                                project.setPixel(data, x, y, [srcR, srcG, srcB, srcA]);
                            }
                                break;
                            case Mode.LOCK_ALPHA: {
                                const srcS = srcA / Math.max(srcA, dst[3]) || 0;
                                const dstS = 1 - srcS;
                                const r = Math.max(0, Math.min(0xff, Math.round(srcR * srcS + dst[0] * dstS)));
                                const g = Math.max(0, Math.min(0xff, Math.round(srcG * srcS + dst[1] * dstS)));
                                const b = Math.max(0, Math.min(0xff, Math.round(srcB * srcS + dst[2] * dstS)));
                                project.setPixel(data, x, y, [r, g, b, dst[3]]);
                            }
                                break;
                        }
                    }
                }
            }
        }
        this.layerData = data;
        paint.editingLayerTextureCache.setData(data, width);
        project.markLayerAsShouldReRender(layer);
    }

    onMouseUp(paint: WorkspacePaint, button: number): void {
        const layer = paint.currentLayer as Layer;
        if (this.layerData) {
            paint.applyLayerDataModification(layer, this.layerData);
        }
        this.layerData = undefined;
    }

    cancel(paint: WorkspacePaint): void {
        this.layerData = undefined;
    }

}
