export default class Vec2 {

    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    setAs(vec2: Vec2) {
        this.x = vec2.x;
        this.y = vec2.y;
    }

    clone() {
        return new Vec2(this.x, this.y);
    }

    len(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    sqLen(): number {
        return this.x * this.x + this.y * this.y;
    }

    norm(): Vec2 {
        let inv = 1 / this.len();
        if (inv === Infinity) {
            return new Vec2();
        }
        return new Vec2(this.x * inv, this.y * inv);
    }

    negate(): Vec2 {
        return new Vec2(-this.x, -this.y);
    }

    add(vec: Vec2) {
        return new Vec2(vec.x + this.x, vec.y + this.y);
    }

    sub(vec: Vec2) {
        return new Vec2(this.x - vec.x, this.y - vec.y);
    }

    mul(num: number): Vec2 {
        return new Vec2(this.x * num, this.y * num);
    }

    div(num: number): Vec2 {
        let inv = 1 / num;
        if (inv === Infinity) {
            throw new Error('Divide by 0.');
        }
        return new Vec2(this.x * inv, this.y * inv);
    }

    dot(vec: Vec2): number {
        return this.x * vec.x + this.y * vec.y;
    }

    cross(vec: Vec2): number {
        return this.x * vec.y - vec.x * this.y;
    }

    scalarCross(num: number): Vec2 {
        return new Vec2(-num * this.y, num * this.x);
    }

    static tripleProduct(v1: Vec2, v2: Vec2, v3: Vec2): Vec2 {
        return new Vec2(-(v1.x * v2.y - v1.y * v2.x) * v3.y, (v1.x * v2.y - v1.y * v2.x) * v3.x);
    }

    rotate(x: number, y: number, rad: number): Vec2 {
        let cos = Math.cos(rad),
            sin = Math.sin(rad),
            dx = this.x - x,
            dy = this.y - y;
        return new Vec2(dx * cos - dy * sin + x, dx * sin + dy * cos + y);
    }

    angle(): number {
        return Math.atan2(this.y, this.x);
    }

    angleDegree(): number {
        return (this.angle() / Math.PI * 180 + 360) % 360;
    }

}
