import {FramebufferInfo} from 'twgl.js'
import Renderer from './Renderer'

export default class FrameBufferInfoCache {

    private renderer: Renderer;
    private frameBufferInfo?: FramebufferInfo;
    private frameBufferInfoExpired: boolean = false;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
    }

    getFrameBufferInfo(width: number, height: number) {
        if (!this.frameBufferInfo) {
            this.frameBufferInfo = this.renderer.createFrameBufferInfo(width, height);
        }
        return this.frameBufferInfo;
    }

    getTexture(): WebGLTexture {
        if (!this.frameBufferInfo) {
            throw new Error('Frame Buffer not created');
        }
        return this.frameBufferInfo.attachments[0] as WebGLTexture;
    }

    setExpired(expired: boolean) {
        this.frameBufferInfoExpired = expired;
    }

    shouldReRender(): boolean {
        return !this.frameBufferInfo || this.frameBufferInfoExpired;
    }

    dispose() {
        if (this.frameBufferInfo) {
            this.renderer.deleteFrameBufferInfo(this.frameBufferInfo);
            this.frameBufferInfo = undefined;
        }
    }

}
