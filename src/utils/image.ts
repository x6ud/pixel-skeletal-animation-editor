import Renderer from './Renderer'

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function resizeBackstageCanvas(width: number, height: number) {
    if (canvas.width !== width || canvas.width !== height) {
        canvas.width = width;
        canvas.height = height;
    }
}

export function createImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            resolve(image);
        };
        image.onerror = image.onabort = reject;
        image.src = dataUrl;
    });
}

export async function dataUrlToUint8Array(dataUrl: string, width: number, height: number) {
    resizeBackstageCanvas(width, height);
    const image = await createImageFromDataUrl(dataUrl);
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
    return new Uint8Array(ctx.getImageData(0, 0, width, height).data);
}

export function textureToImage(renderer: Renderer, texture: WebGLTexture, opacity: number, width: number, height: number) {
    renderer.resizeCanvas(width, height, true);
    renderer.clear();
    renderer.useShader();
    renderer.setColor(1, 1, 1, opacity);
    renderer.draw(texture, 0, 0, width, height);
    return createImageFromDataUrl(renderer.canvas.toDataURL());
}
