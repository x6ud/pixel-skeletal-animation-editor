import Renderer from './Renderer'

export default class TextureCache {

    private renderer: Renderer;
    private texture?: WebGLTexture;
    private textureExpired: boolean = false;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
    }

    getTexture() {
        return this.texture;
    }

    expired() {
        this.textureExpired = true;
    }

    shouldSetData(): boolean {
        return !this.texture || this.textureExpired;
    }

    isValid(): boolean {
        return !this.shouldSetData();
    }

    setData(src: Uint8Array, width: number) {
        if (this.texture) {
            this.renderer.setTextureFromUint8Array(this.texture, src, width);
        } else {
            this.texture = this.renderer.createTextureFromUint8Array(src, width);
        }
        this.textureExpired = false;
    }

    dispose() {
        if (this.texture) {
            this.renderer.deleteTexture(this.texture);
            this.texture = undefined;
        }
    }

}
