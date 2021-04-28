import Vec2 from '../../../utils/Vec2'

export default class BrushShapeEdge {

    points: Vec2[];
    cx: number;
    cy: number;

    constructor(points: Vec2[], cx: number, cy: number) {
        this.points = points;
        this.cx = cx;
        this.cy = cy;
    }

    halfInDirection(x0: number, y0: number, x1: number, y1: number) {
        const direction = new Vec2(x1 - x0, y1 - y0);
        const cx = this.cx;
        const cy = this.cy;
        return this.points.filter(point => {
            const vec = new Vec2(-cx + (point.x + 0.5), -cy + (point.y + 0.5));
            return direction.dot(vec) >= 0;
        });
    }

}
