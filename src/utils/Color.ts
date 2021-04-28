export default class Color {

    /** 0 ~ 255 */
    readonly r: number;
    /** 0 ~ 255 */
    readonly g: number;
    /** 0 ~ 255 */
    readonly b: number;
    /** 0 ~ 1 */
    readonly h: number;
    /** 0 ~ 1 */
    readonly s: number;
    /** 0 ~ 1 */
    readonly v: number;

    private constructor(r: number, g: number, b: number, h: number, s: number, v: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.h = h;
        this.s = s;
        this.v = v;
    }

    /**
     * @param h 0 ~ 1
     * @param s 0 ~ 1
     * @param v 0 ~ 1
     */
    static hsv(h: number, s: number, v: number) {
        let r: number = 0,
            g: number = 0,
            b: number = 0,
            i: number = Math.floor(h * 6),
            f: number = h * 6 - i,
            p: number = v * (1 - s),
            q: number = v * (1 - f * s),
            t: number = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 5:
                r = v;
                g = p;
                b = q;
                break;
        }

        return new Color(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), h, s, v);
    }

    /**
     * @param r 0 ~ 255
     * @param g 0 ~ 255
     * @param b 0 ~ 255
     */
    static rgb(r: number, g: number, b: number) {
        let max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            det = max - min,
            h = 0,
            s = (max === 0 ? 0 : det / max),
            v = max / 255;

        switch (max) {
            case min:
                h = 0;
                break;
            case r:
                h = (g - b) + det * (g < b ? 6 : 0);
                h /= 6 * det;
                break;
            case g:
                h = (b - r) + det * 2;
                h /= 6 * det;
                break;
            case b:
                h = (r - g) + det * 4;
                h /= 6 * det;
                break;
        }

        return new Color(r, g, b, h, s, v);
    }

    static parse(val: any): Color {
        if (!val) {
            return Color.rgb(0, 0, 0);
        }
        if (typeof val === 'string') {
            if (val.startsWith('#')) {
                const num = Number.parseInt(val.substr(1), 16);
                if (isNaN(num)) {
                    throw new Error('Failed to parse');
                }
                const r = (num >> 16) & 0xff;
                const g = (num >> 8) & 0xff;
                const b = num & 0xff;
                return Color.rgb(r, b, g);
            }
        }
        if (typeof val === 'number') {
            const r = (val >> 16) & 0xff;
            const g = (val >> 8) & 0xff;
            const b = val & 0xff;
            return Color.rgb(r, b, g);
        }
        throw new Error('Failed to parse');
    }

    valueOf() {
        return (this.r << 16) | (this.g << 8) | (this.b);
    }

    toString() {
        return '#' + this.valueOf().toString(16).padStart(6, '0');
    }

    static readonly WHITE = Color.rgb(0xff, 0xff, 0xff);
    static readonly BLACK = Color.rgb(0, 0, 0);

}
