const PREFER_RULER_SCALE_LENGTH = 75;
const RULER_TICK_SIZE_1 = 0.8;
const RULER_TICK_SIZE_2 = 0.5;
const RULER_TICK_SIZE_3 = 0.2;
const RULER_LABEL_OFFSET_X = 2;
const RULER_LABEL_OFFSET_Y = 4;

function findSuitableScaleLen(size: number): number {
    const arr = [10, 20, 50, 100, 200, 400, 600, 800, 1000];
    for (let i = 0, len = arr.length; i < len; ++i) {
        if (arr[i] >= size) {
            return arr[i];
        }
    }
    return arr[arr.length - 1];
}

export default function drawCanvasRuler(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    rulerSize: number,
    zoom: number,
    cameraX: number,
    cameraY: number,
    mouseOver: boolean,
    mouseX: number,
    mouseY: number,
    snapToPixel: boolean
) {
    const contentWidth = canvasWidth - rulerSize;
    const contentHeight = canvasHeight - rulerSize;

    ctx.fillStyle = '#555';
    ctx.fillRect(0, 0, canvasWidth, rulerSize);
    ctx.fillRect(0, 0, rulerSize, canvasHeight);

    const rulerRangeX = contentWidth / zoom;
    const rulerRangeY = contentHeight / zoom;
    const rulerX0 = (-contentWidth / 2) / zoom + cameraX;
    const rulerY0 = (-contentHeight + contentHeight / 2) / zoom + cameraY;
    const rulerX1 = rulerX0 + rulerRangeX;
    const rulerY1 = rulerY0 + rulerRangeY;
    const scaleNumX = contentWidth / PREFER_RULER_SCALE_LENGTH;
    const scaleNumY = contentHeight / PREFER_RULER_SCALE_LENGTH;
    const scaleLen = findSuitableScaleLen(Math.min(rulerRangeX / scaleNumX, rulerRangeY / scaleNumY));

    // scales
    ctx.strokeStyle = '#888';
    ctx.fillStyle = '#aaa';
    ctx.beginPath();

    // x ticks
    for (let i = Math.floor(rulerX0 / scaleLen) * scaleLen; i <= rulerX1; i += scaleLen) {
        const x = Math.round((i - cameraX) * zoom + contentWidth / 2 + rulerSize) - 0.5;
        // large tick
        ctx.moveTo(x, rulerSize);
        ctx.lineTo(x, rulerSize - rulerSize * RULER_TICK_SIZE_1);
        // label
        ctx.fillText(i + '', x + RULER_LABEL_OFFSET_X, rulerSize - RULER_LABEL_OFFSET_Y);
        // small ticks
        for (let j = 1; j <= 9; ++j) {
            const x = Math.round((i - cameraX + scaleLen / 10 * j) * zoom + contentWidth / 2 + rulerSize) - 0.5;
            ctx.moveTo(x, rulerSize);
            ctx.lineTo(x, rulerSize - rulerSize * (j === 5 ? RULER_TICK_SIZE_2 : RULER_TICK_SIZE_3));
        }
    }

    // y ticks
    for (let i = Math.floor(rulerY0 / scaleLen) * scaleLen; i <= rulerY1; i += scaleLen) {
        const y = Math.round((i - cameraY) * zoom + contentHeight / 2) + 0.5;
        // large tick
        ctx.moveTo(rulerSize, contentHeight + rulerSize - y);
        ctx.lineTo(rulerSize - rulerSize * RULER_TICK_SIZE_1, contentHeight + rulerSize - y);
        // label
        ctx.save();
        ctx.translate(rulerSize, contentHeight + rulerSize - y);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(i + '', RULER_LABEL_OFFSET_X, -RULER_LABEL_OFFSET_Y);
        ctx.restore();
        // small ticks
        for (let j = 1; j <= 9; ++j) {
            const y = Math.round((i - cameraY + scaleLen / 10 * j) * zoom + contentHeight / 2) + 0.5;
            ctx.moveTo(rulerSize, contentHeight + rulerSize - y);
            ctx.lineTo(rulerSize - rulerSize * (j === 5 ? RULER_TICK_SIZE_2 : RULER_TICK_SIZE_3), contentHeight + rulerSize - y);
        }
    }

    ctx.closePath();
    ctx.stroke();

    // mouse position
    if (mouseOver) {
        let actualMouseX = mouseX + cameraX;
        let actualMouseY = mouseY - cameraY;
        if (snapToPixel) {
            actualMouseX = Math.floor(actualMouseX) + 0.5;
            actualMouseY = Math.floor(actualMouseY) + 0.5;
        }
        ctx.strokeStyle = '#f00';
        const mouseTickX = Math.round((actualMouseX - cameraX) * zoom + contentWidth / 2 + rulerSize) - 0.5;
        const mouseTickY = Math.round((actualMouseY + cameraY) * zoom + contentHeight / 2 + rulerSize) - 0.5;
        ctx.beginPath();
        ctx.moveTo(0, mouseTickY);
        ctx.lineTo(rulerSize, mouseTickY);
        ctx.moveTo(mouseTickX, 0);
        ctx.lineTo(mouseTickX, rulerSize);
        ctx.closePath();
        ctx.stroke();
    }

    // top left rect
    ctx.fillStyle = '#666';
    ctx.fillRect(0, 0, rulerSize, rulerSize);
}
