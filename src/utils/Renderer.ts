import * as twgl from 'twgl.js'

import {multiply} from './mat'

import defaultVert from '../shaders/default.vert'
import defaultFrag from '../shaders/default.frag'

class Camera {
    x: number = 0;
    y: number = 0;
    zoom: number = 1;

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export default class Renderer {

    private static _instance: Renderer;

    static instance(): Renderer {
        if (!Renderer._instance) {
            Renderer._instance = new Renderer();
        }
        return Renderer._instance;
    }

    gl: WebGLRenderingContext;
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    camera = new Camera();

    private readonly defaultShader: twgl.ProgramInfo;
    private readonly bufferInfo: twgl.BufferInfo;

    private currentShader: twgl.ProgramInfo;
    private currentShaderUniforms: any;
    private color?: number[];

    private frameBufferInfoStack: twgl.FramebufferInfo[] = [];
    private currentFrameBufferInfo?: WebGLFramebuffer;

    constructor(canvas?: HTMLCanvasElement) {
        if (!canvas) {
            canvas = document.createElement('canvas');
        }
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;

        const gl = this.gl = <WebGLRenderingContext>canvas.getContext('webgl', {
            alpha: true,
            antialias: false,
            depth: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: true,
            stencil: false
        });
        gl.viewport(0, 0, this.width, this.height);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        this.currentShader = this.defaultShader = this.createShader();
        this.useShader(this.defaultShader);

        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
            a_position: {
                data: [0, 0, 1, 0, 0, 1, 1, 1],
                numComponents: 2
            },
            a_texCoord0: {
                data: [0, 1, 1, 1, 0, 0, 1, 0],
                numComponents: 2
            }
        });
    }

    /**
     * Resize the canvas element and drawing area. Frequently resize the canvas element will cause slowness.
     */
    resizeCanvas(width: number, height: number, centerCamera: boolean = false) {
        if (width < 0 || height < 0) {
            throw new Error('Negative width/height');
        }
        if (width !== this.canvas.width || height !== this.canvas.height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
        if (width !== this.width || height !== this.height) {
            this.resize(width, height, centerCamera);
        }
        if (centerCamera) {
            this.centerCamera();
        }
    }

    /**
     * Resize the drawing area.
     */
    resize(width: number, height: number, centerCamera: boolean = false) {
        if (width < 0 || height < 0) {
            throw new Error('Negative width/height');
        }
        if (width !== this.width || height !== this.height) {
            this.width = width;
            this.height = height;
            this.gl.viewport(0, 0, width, height);
        }
        if (centerCamera) {
            this.centerCamera();
        }
    }

    /**
     * Move the origin to the lower left corner.
     */
    centerCamera() {
        this.camera.setPosition(this.width / 2, this.height / 2);
    }

    createShader(vertSrc: string = defaultVert, fragSrc: string = defaultFrag) {
        return twgl.createProgramInfo(this.gl, [vertSrc, fragSrc]);
    }

    useShader(shader?: twgl.ProgramInfo) {
        shader = shader || this.defaultShader;
        if (this.currentShader === shader) {
            return;
        }
        this.currentShader = shader;
        this.gl.useProgram(shader.program);
        this.currentShaderUniforms = null;
    }

    setUniforms(value: any) {
        this.currentShaderUniforms = value;
    }

    createTexture(src: string): Promise<WebGLTexture> {
        const gl = this.gl;
        return new Promise(function (resolve, reject) {
            twgl.createTexture(
                gl,
                {
                    src: src,
                    mag: gl.NEAREST,
                    min: gl.NEAREST
                },
                (err, texture) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(texture);
                    }
                });
        });
    }

    createTextureFromUint8Array(src: Uint8Array, width: number) {
        const gl = this.gl;
        return twgl.createTexture(
            gl,
            {
                width,
                src,
                internalFormat: gl.RGBA,
                format: gl.RGBA,
                type: gl.UNSIGNED_BYTE,
                mag: gl.NEAREST,
                min: gl.NEAREST,
                wrapS: gl.CLAMP_TO_EDGE,
                wrapT: gl.CLAMP_TO_EDGE,
                auto: false,
                premultiplyAlpha: 0,
                level: 0
            });
    }

    setTextureFromUint8Array(texture: WebGLTexture, src: Uint8Array, width: number) {
        const gl = this.gl;
        twgl.setTextureFromArray(gl, texture, src, {
            width,
            internalFormat: gl.RGBA,
            format: gl.RGBA,
            type: gl.UNSIGNED_BYTE,
            mag: gl.NEAREST,
            min: gl.NEAREST,
            wrapS: gl.CLAMP_TO_EDGE,
            wrapT: gl.CLAMP_TO_EDGE,
            auto: false,
            premultiplyAlpha: 0,
            level: 0
        });
    }

    deleteTexture(texture: WebGLTexture) {
        this.gl.deleteTexture(texture);
    }

    clear() {
        this.switchFrameBuffer();
        const gl = this.gl;
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    copyTo(
        ctx: CanvasRenderingContext2D,
        dx: number = 0,
        dy: number = 0,
        dw: number = this.width,
        dh: number = this.height,
        sx: number = 0,
        sy: number = 0,
        sw: number = this.width,
        sh: number = this.height
    ) {
        ctx.drawImage(this.canvas, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    /**
     * Set blending color of next draw call.
     * @param r 0 ~ 1
     * @param g 0 ~ 1
     * @param b 0 ~ 1
     * @param a 0 ~ 1
     */
    setColor(r: number, g: number, b: number, a: number) {
        this.color = [r, g, b, a];
    }

    draw(texture?: WebGLTexture,
         x: number = 0,
         y: number = 0,
         width: number = this.width,
         height: number = this.height,
         ox: number = 0,
         oy: number = 0,
         rotation: number = 0,
         flipX: boolean = false,
         flipY: boolean = false
    ) {
        const canvasWidth = this.width;
        const canvasHeight = this.height;

        const aspect = canvasWidth / canvasHeight;
        const sx = width / canvasWidth * 2;
        const sy = height / canvasHeight * 2;
        const ox_ = ox / canvasWidth * 2;
        const oy_ = oy / canvasHeight * 2;
        const dx = x / canvasWidth * 2;
        const dy = y / canvasHeight * 2;
        const zoom = this.camera.zoom;
        const cx = this.camera.x / canvasWidth * 2;
        const cy = this.camera.y / canvasHeight * 2;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        let mat = multiply(
            [
                [aspect, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ],
            [
                [sx, 0, 0, 0],
                [0, sy, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ],
            [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [-ox_, -oy_, 0, 1]
            ],
            [
                [cos, sin, 0, 0],
                [-sin, cos, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ],
            [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [ox_, oy_, 0, 1]
            ],
            [
                [1 / aspect, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ],
            [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [dx, dy, 0, 1]
            ],
            [
                [zoom, 0, 0, 0],
                [0, zoom, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ],
            [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [-cx, -cy, 0, 1]
            ]
        );

        // flip y when drawing on frame buffer texture
        if (this.frameBufferInfoStack.length) {
            mat = multiply(
                mat,
                [
                    [1, 0, 0, 0],
                    [0, -1, 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 1]
                ]
            );
        }

        const uniforms = {
            u_texture: texture,
            u_projTrans: mat.reduce((arr, curr) => arr.concat(curr), []),
            u_flipX: flipX,
            u_flipY: flipY,
            u_color: this.color || [1, 1, 1, 1],
            ...(this.currentShaderUniforms || {})
        };
        this.color = undefined;

        this.switchFrameBuffer();
        const gl = this.gl;
        twgl.setUniforms(this.currentShader, uniforms);
        twgl.setBuffersAndAttributes(gl, this.currentShader, this.bufferInfo);
        twgl.drawBufferInfo(gl, this.bufferInfo, gl.TRIANGLE_STRIP);
    }

    private switchFrameBuffer() {
        const gl = this.gl;
        const frameBufferInfoStack = this.frameBufferInfoStack;
        const frameBufferInfo = frameBufferInfoStack.length ? frameBufferInfoStack[frameBufferInfoStack.length - 1] : undefined;
        if (frameBufferInfo !== this.currentFrameBufferInfo) {
            this.currentFrameBufferInfo = frameBufferInfo;
            if (frameBufferInfo) {
                if (frameBufferInfo.width !== this.width || frameBufferInfo.height !== this.height) {
                    twgl.resizeFramebufferInfo(gl, frameBufferInfo, frameBufferInfo.attachments, this.width, this.height);
                }
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferInfo ? frameBufferInfo.framebuffer : null);
        }
    }

    createFrameBufferInfo(width: number = this.width, height: number = this.height) {
        const gl = this.gl;
        const createFrameBufferInfo = twgl.createFramebufferInfo(
            gl,
            [
                {
                    internalFormat: gl.RGBA,
                    format: gl.RGBA,
                    type: gl.UNSIGNED_BYTE,
                    mag: gl.NEAREST,
                    min: gl.NEAREST,
                    wrapS: gl.CLAMP_TO_EDGE,
                    wrapT: gl.CLAMP_TO_EDGE,
                    auto: false,
                    level: 0
                }
            ],
            width,
            height
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return createFrameBufferInfo;
    }

    deleteFrameBufferInfo(frameBufferInfo: twgl.FramebufferInfo) {
        const gl = this.gl;
        gl.deleteFramebuffer(frameBufferInfo.framebuffer);
        gl.deleteTexture(frameBufferInfo.attachments[0]);
    }

    /**
     * Push a framebuffer info into stack.
     * All subsequent drawings will be applied to the top framebuffer.
     * Framebuffers with a size different from the drawing area will be resized when drawing.
     */
    startCapture(frameBufferInfo: twgl.FramebufferInfo) {
        this.frameBufferInfoStack.push(frameBufferInfo);
    }

    /**
     * Pop a framebuffer info from stack.
     */
    endCapture() {
        this.frameBufferInfoStack.pop();
    }

    isCaptureStackEmpty() {
        return this.frameBufferInfoStack.length === 0;
    }

    readPixels(frameBufferInfo: twgl.FramebufferInfo): Uint8Array {
        const gl = this.gl;
        const width = frameBufferInfo.width;
        const height = frameBufferInfo.height;
        const buffer = new Uint8Array(4 * width * height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferInfo.framebuffer);
        gl.readPixels(
            0,
            0,
            width,
            height,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            buffer
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return buffer;
    }

}
