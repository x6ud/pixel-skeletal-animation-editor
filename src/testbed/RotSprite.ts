import Vue from 'vue'

import Renderer from '../utils/Renderer'
import {x3brShader, downscale3xShader} from '../editor/shaders'

import trianglePng from '../assets/test/triangle.png'

const renderer = Renderer.instance();

const TEX_WIDTH = 24;
const TEX_HEIGHT = 24;
const ZOOM = 2;

const x3FrameBufferInfo = renderer.createFrameBufferInfo(TEX_WIDTH * 3 * 2, TEX_HEIGHT * 3 * 2);

export default Vue.extend({
    data() {
        return {
            canvasWidth: TEX_WIDTH * ZOOM * 2 * 3 * 3,
            canvasHeight: TEX_HEIGHT * ZOOM * 2 * 3,
            ctx: undefined as any as CanvasRenderingContext2D,
            rotation: 0 as string | number,
            x1Texture: undefined as any as WebGLTexture,
            x3Texture: undefined as any as WebGLTexture
        };
    },
    async mounted() {
        const canvas = this.$refs.canvas as HTMLCanvasElement;
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.ctx.imageSmoothingEnabled = false;

        const x1Texture = await renderer.createTexture(trianglePng);

        const x3TextureFrameBufferInfo = renderer.createFrameBufferInfo(TEX_WIDTH * 3, TEX_HEIGHT * 3);
        renderer.resizeCanvas(TEX_WIDTH * 3, TEX_HEIGHT * 3, true);
        renderer.startCapture(x3TextureFrameBufferInfo);
        renderer.clear();
        renderer.useShader(x3brShader);
        renderer.setUniforms({u_inputSize: [TEX_WIDTH, TEX_HEIGHT]});
        renderer.draw(x1Texture, 0, 0, TEX_WIDTH * 3, TEX_HEIGHT * 3);
        renderer.endCapture();
        const x3Texture = x3TextureFrameBufferInfo.attachments[0];

        this.x1Texture = x1Texture;
        this.x3Texture = x3Texture;

        this.render();
    },
    watch: {
        rotation() {
            this.render();
        }
    },
    methods: {
        render() {
            const rotation = Number(this.rotation) / 180 * Math.PI;
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

            renderer.useShader();

            renderer.resizeCanvas(TEX_WIDTH * 2, TEX_HEIGHT * 2, true);
            renderer.clear();
            renderer.draw(
                this.x1Texture,
                TEX_WIDTH / 2,
                TEX_HEIGHT / 2,
                TEX_WIDTH,
                TEX_HEIGHT,
                TEX_WIDTH / 2,
                TEX_HEIGHT / 2,
                rotation
            );
            renderer.copyTo(this.ctx, 0, 0, this.canvasHeight, this.canvasHeight);

            renderer.resizeCanvas(TEX_WIDTH * 2 * 3, TEX_HEIGHT * 2 * 3, true);
            renderer.startCapture(x3FrameBufferInfo);
            renderer.clear();
            renderer.draw(
                this.x3Texture,
                TEX_WIDTH / 2 * 3,
                TEX_HEIGHT / 2 * 3,
                TEX_WIDTH * 3,
                TEX_HEIGHT * 3,
                TEX_WIDTH / 2 * 3,
                TEX_HEIGHT / 2 * 3,
                rotation
            );
            renderer.endCapture();

            renderer.clear();
            renderer.draw(x3FrameBufferInfo.attachments[0]);
            renderer.copyTo(this.ctx, this.canvasHeight, 0, this.canvasHeight, this.canvasHeight);

            renderer.resizeCanvas(TEX_WIDTH * 2, TEX_HEIGHT * 2, true);
            renderer.clear();
            renderer.useShader(downscale3xShader);
            renderer.setUniforms({u_inputSize: [TEX_WIDTH * 2 * 3, TEX_HEIGHT * 2 * 3]});
            renderer.draw(x3FrameBufferInfo.attachments[0]);
            renderer.copyTo(this.ctx, this.canvasHeight * 2, 0, this.canvasHeight, this.canvasHeight);
        }
    }
});
