import Vec2 from '../utils/Vec2'

export default function drawBone(
    ctx: CanvasRenderingContext2D,
    boneSize: number,
    x0: number,
    y0: number,
    x1: number,
    y1: number
) {
    const radius1 = boneSize;
    const radius2 = radius1 / 2;
    const v0 = new Vec2(x0, y0);
    const v1 = new Vec2(x1, y1);
    const vec = v1.sub(v0);
    const rotation = vec.angle();
    const length = vec.len();
    ctx.beginPath();
    if (length <= radius1) {
        ctx.arc(x0, y0, radius1, 0, Math.PI * 2, false);
        ctx.moveTo(x0 + radius2, y0);
        ctx.arc(x0, y0, radius2, 0, Math.PI * 2, true);
    } else {
        const tan = v0.add(vec.scalarCross(-1).norm().mul(-radius1));
        ctx.arc(x0, y0, radius1, rotation + Math.PI / 2, rotation - Math.PI / 2, false);
        ctx.lineTo(x1, y1);
        ctx.lineTo(tan.x, tan.y);
        ctx.closePath();
        ctx.moveTo(x0 + radius2, y0);
        ctx.arc(
            x0,
            y0,
            radius2,
            0,
            Math.PI * 2,
            true
        );
        ctx.closePath();
    }
}
