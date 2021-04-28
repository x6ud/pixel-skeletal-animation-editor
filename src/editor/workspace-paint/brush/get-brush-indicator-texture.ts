import Renderer from '../../../utils/Renderer'
import {BrushShapeType} from './BrushShapeType'
import {pixelCircle, pixelRect} from '../../../utils/pixel'

const renderer = Renderer.instance();

function createCircleImgData(size: number) {
    const arr = new Uint8Array(size * size * 4);
    pixelCircle(size, true, false, (x, y) => {
        arr.set([255, 255, 255, 255], (y * size + x) * 4);
    });
    return arr;
}

function createRectImageData(size: number) {
    const arr = new Uint8Array(size * size * 4);
    pixelRect(size, size, true, (x, y) => {
        arr.set([255, 255, 255, 255], (y * size + x) * 4);
    });
    return arr;
}

let texture: WebGLTexture;
let currentSize: number = 0;
let currentType: BrushShapeType = BrushShapeType.RECT;

export default function getBrushIndicatorTexture(size: number, type: BrushShapeType): WebGLTexture {
    if (size === currentSize && type === currentType && texture) {
        return texture;
    }
    let src: Uint8Array;
    switch (type) {
        case BrushShapeType.RECT:
            src = createRectImageData(size);
            break;
        case BrushShapeType.CIRCLE:
            src = createCircleImgData(size);
            break;
        default:
            throw new Error('Unknown brush type');
    }
    currentSize = size;
    currentType = type;
    if (texture) {
        renderer.setTextureFromUint8Array(texture, src, size);
    } else {
        texture = renderer.createTextureFromUint8Array(src, size);
    }
    return texture;
}
