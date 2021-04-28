import WorkspacePaint from '../WorkspacePaint'
import BrushTool from './BrushTool'
import icon from '../../../assets/editor/paint/tools/eraser.png'
import {BrushShapeType} from '../brush/BrushShapeType'
import {BrushDrawingMask, getBrushDrawingMask} from '../brush/brush-drawing-mask'
import Layer from '../../project/Layer'

export default class Eraser extends BrushTool {

    id = 'eraser';
    name = 'Eraser';
    icon = icon;
    size = 8;
    shape = BrushShapeType.RECT;

    private brushDrawingMask?: BrushDrawingMask;
    private lastX: number = 0;
    private lastY: number = 0;
    private layerData?: Uint8Array;

    onMouseDown(paint: WorkspacePaint, button: number, x: number, y: number): void {
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

        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {
                if (mask.get(x, y)) {
                    project.setPixel(data, x, y, [0, 0, 0, 0]);
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
