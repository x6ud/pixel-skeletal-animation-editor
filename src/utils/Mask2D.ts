/**
 * 2D 1-bit mask
 */
export default class Mask2D {

    width: number;
    height: number;
    bytes: Uint8Array;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        const bits = width * height;
        const bytes = Math.ceil(bits / 8);
        this.bytes = new Uint8Array(bytes);
    }

    get(x: number, y: number) {
        if (x < 0 || y < 0 || x > this.width || y > this.height) {
            throw new Error('Out of range');
        }
        const bitIndex = (y * this.width + x) >>> 0;
        const byteIndex = bitIndex >>> 3;
        const bitOffset = bitIndex - (byteIndex << 3);
        const byte = this.bytes[byteIndex];
        return (byte >>> bitOffset) & 1;
    }

    set(x: number, y: number, val: number) {
        if (x < 0 || y < 0 || x > this.width || y > this.height) {
            throw new Error('Out of range');
        }
        if (val !== 0 && val !== 1) {
            throw new Error('Illegal value');
        }
        const bitIndex = (y * this.width + x) >>> 0;
        const byteIndex = bitIndex >>> 3;
        const bitOffset = bitIndex - (byteIndex << 3);
        const byte = this.bytes[byteIndex];
        this.bytes[byteIndex] = (byte & ~(1 << bitOffset)) | (val << bitOffset);
    }

    toString() {
        const ret = [];
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                ret.push(this.get(x, y));
            }
            if (y < this.height - 1) {
                ret.push('\n');
            }
        }
        return ret.join('');
    }

}
