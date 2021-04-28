import WorkspacePaint from '../WorkspacePaint'
import Tool from './Tool'
import icon from '../../../assets/editor/paint/tools/move.png'
import cursor from '../../../assets/editor/paint/cursor/move.png'

import Layer from '../../project/Layer'
import LayerFolder from '../../project/LayerFolder'
import Project from '../../project/Project'

export default class Move implements Tool {

    id = 'move';
    name = 'Move';
    icon = icon;
    cursor = `url("${cursor}"), auto`;
    canBeUsedOnFolder = true;
    cancelable = true;
    propertiesComponent = undefined;

    private startX: number = 0;
    private startY: number = 0;

    onMouseDown(paint: WorkspacePaint, button: number, x: number, y: number): void {
        this.startX = x;
        this.startY = y;
    }

    onMouseMove(paint: WorkspacePaint, x: number, y: number): void {
        const detX = x - this.startX;
        const detY = y - this.startY;
        if (!paint.currentLayer) {
            return;
        }
        paint.currentLayer.offsetX = detX;
        paint.currentLayer.offsetY = -detY;
        paint.project.markLayerAsShouldReRender(paint.currentLayer);
    }

    onMouseUp(paint: WorkspacePaint, button: number): void {
        if (!paint.currentLayer) {
            return;
        }
        const result: { [id: number]: Uint8Array } = {};
        Move.applyMove(result, paint.project, paint.currentLayer, paint.currentLayer.offsetX, paint.currentLayer.offsetY);
        paint.currentLayer.offsetX = 0;
        paint.currentLayer.offsetY = 0;
        paint.project.markLayerAsShouldReRender(paint.currentLayer);
        paint.applyLayerDataModifications(result);
    }

    cancel(paint: WorkspacePaint): void {
        if (!paint.currentLayer) {
            return;
        }
        paint.currentLayer.offsetX = 0;
        paint.currentLayer.offsetY = 0;
        paint.project.markLayerAsShouldReRender(paint.currentLayer);
    }

    private static applyMove(
        result: { [id: number]: Uint8Array },
        project: Project,
        layer: Layer | LayerFolder,
        dx: number,
        dy: number
    ) {
        if (dx === 0 && dy === 0) {
            return;
        }
        if (layer instanceof Layer) {
            const width = project.state.width;
            const height = project.state.height;
            const ref = project.getLayerImageData(layer);
            const data = new Uint8Array(4 * width * height);

            for (let x = 0; x < width; ++x) {
                const rx = x + dx;
                for (let y = 0; y < height; ++y) {
                    const ry = y - dy;
                    if (rx >= 0 && ry >= 0 && rx < width && ry < height) {
                        const color = project.getPixel(ref, x, y);
                        project.setPixel(data, rx, ry, color);
                    }
                }
            }
            result[layer.id] = data;
        } else {
            layer.children.forEach(layer => Move.applyMove(result, project, layer, dx, dy));
        }
    }

}
