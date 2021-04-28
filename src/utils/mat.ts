import Vec2 from './Vec2'

export function multiply(...mats: number[][][]): number[][] {
    if (mats.length < 2) {
        return mats[0];
    }

    const m1 = mats[0];
    const m2 = mats[1];
    let result: number[][] = [];
    for (let col = 0; col < m1.length; col++) {
        result[col] = [];
        for (let row = 0; row < m2[0].length; row++) {
            let sum = 0;
            for (let i = 0; i < m1[0].length; i++) {
                sum += m1[col][i] * m2[i][row];
            }
            result[col][row] = sum;
        }
    }

    if (mats.length > 2) {
        return multiply(result, ...mats.slice(2));
    }

    return result;
}

export function transformVec2(mat33: number[][], vec: { x: number, y: number }) {
    const ret = multiply([[vec.x, vec.y, 1]], mat33);
    return new Vec2(ret[0][0], ret[0][1]);
}

export function invertMat33(mat33: number[][]) {
    const
        m00 = mat33[0][0],
        m01 = mat33[0][1],
        m02 = mat33[0][2],
        m10 = mat33[1][0],
        m11 = mat33[1][1],
        m12 = mat33[1][2],
        m20 = mat33[2][0],
        m21 = mat33[2][1],
        m22 = mat33[2][2],
        invDet = 1 / (m00 * m11 * m22 - m00 * m12 * m21 - m01 * m10 * m22 + m01 * m12 * m20 + m02 * m10 * m21 - m02 * m11 * m20);
    return [
        [(m11 * m22 - m12 * m21) * invDet, -(m01 * m22 - m02 * m21) * invDet, (m01 * m12 - m02 * m11) * invDet],
        [-(m10 * m22 - m12 * m20) * invDet, (m00 * m22 - m02 * m20) * invDet, -(m00 * m12 - m02 * m10) * invDet],
        [(m10 * m21 - m11 * m20) * invDet, -(m00 * m21 - m01 * m20) * invDet, (m00 * m11 - m01 * m10) * invDet]
    ]
}
