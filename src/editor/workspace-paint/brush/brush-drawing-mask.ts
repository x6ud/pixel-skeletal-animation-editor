import {BrushShapeType} from './BrushShapeType'
import BrushShapeEdge from './BrushShapeEdge'
import Vec2 from '../../../utils/Vec2'
import {pixelLine, pixelCircle, pixelRect} from '../../../utils/pixel'
import Mask2D from '../../../utils/Mask2D'

function createCircleEdge(size: number) {
    const center = size / 2;
    const points = [] as Vec2[];
    pixelCircle(size, false, true, (x, y) => points.push(new Vec2(x, y)));
    return new BrushShapeEdge(points, center, center);
}

function createRectEdge(size: number) {
    const center = size / 2;
    const points = [] as Vec2[];
    pixelRect(size, size, false, (x, y) => points.push(new Vec2(x, y)));
    return new BrushShapeEdge(points, center, center);
}

function createCircleMask(size: number) {
    const mask = new Mask2D(size, size);
    pixelCircle(size, true, false, (x, y) => mask.set(x, y, 1));
    return mask;
}

function createRectMask(size: number) {
    const mask = new Mask2D(size, size);
    pixelRect(size, size, true, (x, y) => mask.set(x, y, 1));
    return mask;
}

export class BrushDrawingMask {

    brushSize: number;
    brushMask: Mask2D;
    brushEdge: BrushShapeEdge;
    mask?: Mask2D;

    constructor(brushSize: number, brushMask: Mask2D, brushEdge: BrushShapeEdge) {
        this.brushSize = brushSize;
        this.brushMask = brushMask;
        this.brushEdge = brushEdge;
    }

    start(width: number, height: number) {
        this.mask = new Mask2D(width, height);
    }

    line(x0: number, y0: number, x1: number, y1: number) {
        if (!this.mask) {
            throw new Error('BrushMask is not initialized');
        }

        const size = this.brushSize;
        const mask = this.mask;
        const brushMask = this.brushMask;
        const width = mask.width;
        const height = mask.height;
        const r = Math.floor(size / 2);
        for (let xi = 0; xi < size; ++xi) {
            const x = x0 - r + xi;
            if (x >= 0 && x < width) {
                for (let yi = 0; yi < size; ++yi) {
                    const y = y0 - r + yi;
                    if (y >= 0 && y < height) {
                        const val = brushMask.get(xi, yi);
                        if (val) {
                            mask.set(x, y, 1);
                        }
                    }
                }
            }
        }

        if (x0 !== x1 || y0 !== y1) {
            const edge = this.brushEdge.halfInDirection(x0, y0, x1, y1);
            pixelLine(x0, y0, x1, y1, (x, y) => {
                edge.forEach(point => {
                    const px = x + point.x - r;
                    const py = y + point.y - r;
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        mask.set(px, py, 1);
                    }
                });
            });
        }
    }

}

const brushDrawingMaskCache = {} as { [hash: string]: BrushDrawingMask };

export function getBrushDrawingMask(brushSize: number, brushShape: BrushShapeType): BrushDrawingMask {
    const hash = brushSize + '#' + brushShape;
    if (brushDrawingMaskCache.hasOwnProperty(hash)) {
        return brushDrawingMaskCache[hash];
    }
    let ret: BrushDrawingMask;
    switch (brushShape) {
        case BrushShapeType.CIRCLE:
            ret = new BrushDrawingMask(
                brushSize,
                createCircleMask(brushSize),
                createCircleEdge(brushSize)
            );
            break;
        case BrushShapeType.RECT:
            ret = new BrushDrawingMask(
                brushSize,
                createRectMask(brushSize),
                createRectEdge(brushSize)
            );
            break;
        default:
            throw new Error('Unknown brush type');
    }
    return brushDrawingMaskCache[hash] = ret;
}
