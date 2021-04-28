export function pixelLine(
    x0: number, y0: number,
    x1: number, y1: number,
    draw: (x: number, y: number) => void
) {
    let x, y, xe, ye;
    let dx = x1 - x0;
    let dy = y1 - y0;
    let dx1 = Math.abs(dx);
    let dy1 = Math.abs(dy);
    let px = 2 * dy1 - dx1;
    let py = 2 * dx1 - dy1;
    if (dy1 <= dx1) {
        if (dx >= 0) {
            x = x0;
            y = y0;
            xe = x1;
        } else {
            x = x1;
            y = y1;
            xe = x0;
        }
        draw(x, y);
        for (let i = 0; x < xe; i++) {
            x = x + 1;
            if (px < 0) {
                px = px + 2 * dy1;
            } else {
                if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
                    y = y + 1;
                } else {
                    y = y - 1;
                }
                px = px + 2 * (dy1 - dx1);
            }
            draw(x, y);
        }
    } else {
        if (dy >= 0) {
            x = x0;
            y = y0;
            ye = y1;
        } else {
            x = x1;
            y = y1;
            ye = y0;
        }
        draw(x, y);
        for (let i = 0; y < ye; i++) {
            y = y + 1;
            if (py <= 0) {
                py = py + 2 * dx1;
            } else {
                if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
                    x = x + 1;
                } else {
                    x = x - 1;
                }
                py = py + 2 * (dx1 - dy1);
            }
            draw(x, y);
        }
    }
}

export function pixelRect(width: number, height: number, fill: boolean, draw: (x: number, y: number) => void) {
    if (fill) {
        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {
                draw(x, y);
            }
        }
    } else {
        for (let x = 0; x < width; ++x) {
            draw(x, 0);
            draw(x, height - 1);
        }
        for (let y = 1; y < height - 1; ++y) {
            draw(0, y);
            draw(width - 1, y);
        }
    }
}

export function pixelCircle(
    size: number,
    fill: boolean,
    fillCorner: boolean,
    draw: (x: number, y: number) => void
) {
    const r = size / 2;
    const r2 = (r - 0.25) ** 2;
    let x = Math.floor(r);
    let y = 0;
    let fillX = false;
    while (x >= y) {
        const dx0 = r - (x + 0.5);
        const dy0 = r - (y + 0.5);
        const fx = Math.floor(r + dx0);
        const fy = Math.floor(r + dy0);

        draw(fx, fy);
        draw(+x, fy);
        draw(fx, +y);
        draw(+x, +y);
        draw(fy, fx);
        draw(+y, fx);
        draw(fy, +x);
        draw(+y, +x);

        if (fill) {
            if (fillX) {
                fillX = false;
                for (let px = x + 1; px < fx; ++px) {
                    draw(px, +y);
                    draw(px, fy);
                }
            }
            for (let py = y + 1; py < fy; ++py) {
                draw(py, +x);
                draw(py, fx);
            }
        }

        const dx1 = r - (x - 1 + 0.5);
        if (dx1 ** 2 + dy0 ** 2 <= r2) {
            x -= 1;
        } else {
            if (fill || !fillCorner) {
                const dy1 = r - (y + 1 + 0.5);
                if (dx1 ** 2 + dy1 ** 2 <= r2) {
                    x -= 1;
                }
            }
            fillX = true;
            y += 1;
        }
    }
}
