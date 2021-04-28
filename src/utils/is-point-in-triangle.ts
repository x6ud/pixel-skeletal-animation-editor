import Vec2 from './Vec2'

export default function isPointInTriangle(a: Vec2, b: Vec2, c: Vec2, point: Vec2) {
    const v0 = c.sub(a),
        v1 = c.sub(b),
        v2 = c.sub(point),
        d00 = v0.dot(v0),
        d01 = v0.dot(v1),
        d02 = v0.dot(v2),
        d11 = v1.dot(v1),
        d12 = v1.dot(v2),
        inv = 1 / (d00 * d11 - d01 * d01),
        u = (d11 * d02 - d01 * d12) * inv,
        v = (d00 * d12 - d01 * d02) * inv;
    if (u < 0 || u > 1 || v < 0 || v > 1) {
        return false;
    }
    return u + v <= 1;
}
