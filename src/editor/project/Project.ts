import Vue from 'vue'
import JSZip from 'jszip'
import {dataUrlToUint8Array} from '../../utils/image'

import Renderer from '../../utils/Renderer'
import TextureCache from '../../utils/TextureCache'
import FrameBufferInfoCache from '../../utils/FrameBufferInfoCache'
import Vec2 from '../../utils/Vec2'
import Color from '../../utils/Color'
import {multiply, transformVec2} from '../../utils/mat'

import {multiplyAlphaShader, x3brShader} from '../shaders'

import Layer from './Layer'
import LayerFolder from './LayerFolder'
import LayerJSON from './LayerJSON'
import LayerRestoreInfo from './LayerRestoreInfo'
import LayerPositionRestoreInfo from './LayerPositionRestoreInfo'

import Bone from './Bone'
import BoneJSON from './BoneJSON'
import BoneRestoreInfo from './BoneRestoreInfo'
import BonePositionRestoreInfo from './BonePositionRestoreInfo'

import Animation from './Animation'
import AnimationJSON from './AnimationJSON'
import AnimationRestoreInfo from './AnimationRestoreInfo'
import AnimationPositionRestoreInfo from './AnimationPositionRestoreInfo'
import Keyframe from './Keyframe'
import KeyframeRestoreInfo from './KeyframeRestoreInfo'
import BoneTransform from './BoneTransform'
import KeyframeTransformRestoreInfo from './KeyframeTransformRestoreInfo'

const renderer = Renderer.instance();

export default class Project {

    private static _instance: Project;

    static instance() {
        if (!this._instance) {
            this._instance = new Project();
            this._instance.createNew('Untitled', 64, 64);
        }
        return this._instance;
    }

    readonly renderer = renderer;

    // ================ data ================

    private idCount: number = 0;
    /** Layers image RGBA array */
    private imageData: { [id: string]: Uint8Array } = {};
    state = {
        /** Used for refreshing vue components */
        timestamp: 0 as number,
        name: '' as string,
        /** Layers width */
        width: 0 as number,
        /** Layers height */
        height: 0 as number,
        layers: [] as Array<Layer | LayerFolder>,
        bones: new Bone(-1, 'root') as Bone,
        animations: [] as Array<Animation>,
        layerIdMap: {} as { [id: number]: Layer | LayerFolder },
        boneIdMap: {} as { [id: number]: Bone },
        animationIdMap: {} as { [id: number]: Animation },
        backgroundColor: {
            color1: Color.rgb(0xff, 0xff, 0xff),
            color2: Color.rgb(0xcc, 0xcc, 0xcc)
        }
    };

    // ================ render ================

    shouldReRender: boolean = false;
    private layerTextureCache: { [id: number]: TextureCache } = {};
    private folderFrameBufferInfoCache: { [id: number]: FrameBufferInfoCache } = {};
    private x3textureCache: { [id: number]: FrameBufferInfoCache } = {};

    // ================ base ================

    private constructor() {
    }

    private init() {
        this.state.layers = [];
        this.state.bones = new Bone(-1, 'root');
        this.state.layerIdMap = {};
        this.state.boneIdMap = {};
        this.state.animationIdMap = {};
        this.disposeAllRenderCache();
        this.imageData = {};
        this.layerTextureCache = {};
        this.folderFrameBufferInfoCache = {};
        this.x3textureCache = {};
        this.shouldReRender = true;
    }

    createNew(name: string, width: number, height: number) {
        this.idCount = 0;
        this.state.name = name;
        this.state.width = width;
        this.state.height = height;
        this.init();
        this.addLayer();
        this.addAnimation();
        this.state.timestamp = new Date().valueOf();
    }

    /**
     * Create zip bytes
     */
    save(): Promise<Uint8Array> {
        if (!renderer.isCaptureStackEmpty()) {
            throw new Error('Renderer capture stack is not empty');
        }
        const zip = new JSZip();
        const boneIds = Object.keys(this.state.boneIdMap).map(id => Number(id));
        zip.file('project.json', JSON.stringify({
            idCount: this.idCount,
            name: this.state.name,
            width: this.state.width,
            height: this.state.height,
            layers: this.state.layers.map(layer => new LayerJSON(layer, this)),
            bones: new BoneJSON(this.state.bones),
            animations: this.state.animations.map(animation => new AnimationJSON(animation, boneIds)),
            backgroundColor: {
                color1: this.state.backgroundColor.color1.valueOf(),
                color2: this.state.backgroundColor.color2.valueOf()
            }
        }));
        const images = zip.folder('images');
        Object.keys(this.imageData).forEach(id => {
            const texture = this.getLayerTexture(this.getLayer(Number(id)));
            renderer.resizeCanvas(this.state.width, this.state.height, true);
            renderer.clear();
            renderer.useShader();
            renderer.draw(texture);
            const url = renderer.canvas.toDataURL('png');
            images.file(id + '.png', url.substr('data:image/png;base64,'.length), {base64: true});
        });
        return zip.generateAsync({type: 'uint8array'});
    }

    /**
     * Read zip bytes
     */
    async read(data: Uint8Array) {
        const zip = new JSZip();
        await zip.loadAsync(data);
        const projectJsonFile = zip.file('project.json');
        if (!projectJsonFile) {
            throw new Error('Failed to load project.json');
        }
        const projectJsonStr = await projectJsonFile.async('text');
        const projectJson = JSON.parse(projectJsonStr);
        if (!projectJson) {
            throw new Error('Incorrect json format');
        }
        const idCount = projectJson.idCount as number | undefined;
        const name = (projectJson.name as string) || 'Untitled';
        const width = projectJson.width as number | undefined;
        const height = projectJson.height as number | undefined;
        const layers = projectJson.layers as Array<LayerJSON> | undefined;
        const bones = projectJson.bones as BoneJSON | undefined;
        const animations = projectJson.animations as Array<AnimationJSON> | undefined;
        const backgroundColor = projectJson.backgroundColor as { color1: number, color2: number } | undefined;
        if (
            typeof idCount !== 'number'
            || typeof width !== 'number'
            || typeof height !== 'number'
            || !layers
            || !layers.length) {
            throw new Error('Incorrect json format');
        }
        const images = zip.folder('images');
        if (!images) {
            throw new Error('Failed to load images');
        }
        const wait: Promise<any>[] = [];
        const imageData: { [id: number]: Uint8Array } = {};
        images.forEach((path, file) => {
            wait.push((async () => {
                path = path.toLowerCase();
                if (!path.endsWith('.png')) {
                    return;
                }
                const id = Number(path.substr(0, path.length - '.png'.length));
                const base64 = await file.async('base64');
                const url = 'data:image/png;base64,' + base64;
                imageData[id] = await dataUrlToUint8Array(url, width, height);
            })());
        });
        await Promise.all(wait);

        this.init();
        this.imageData = imageData;
        this.idCount = idCount;
        this.state.name = name;
        this.state.width = width;
        this.state.height = height;
        this.state.layers = this.createLayersFromJson(layers);
        if (bones) {
            this.state.bones = this.createBonesFromJson(bones);
        }
        if (animations) {
            this.state.animations = animations.map(json => this.createAnimationsFromJson(json));
        } else {
            this.state.animations = [];
        }
        if (backgroundColor) {
            this.state.backgroundColor.color1 = Color.parse(backgroundColor.color1);
            this.state.backgroundColor.color2 = Color.parse(backgroundColor.color2);
        }
        this.fillKeyframesMissingBoneTransform();
        this.state.timestamp = new Date().valueOf();
    }

    private createLayersFromJson(json: LayerJSON[], parent?: LayerFolder) {
        return json.map(json => {
            const layer = json.isFolder ?
                new LayerFolder(json.id, json.name, parent)
                : new Layer(json.id, json.name, parent);
            layer.opacity = json.opacity;
            layer.visible = json.visible;
            if (layer instanceof LayerFolder) {
                if (json.expanded != null) {
                    layer.expanded = json.expanded;
                }
                if (json.children) {
                    layer.children = this.createLayersFromJson(json.children, layer);
                }
            }
            this.state.layerIdMap[json.id] = layer;
            return layer;
        });
    }

    private createBonesFromJson(json: BoneJSON, parent?: Bone): Bone {
        const bone = new Bone(json.id, json.name, parent);
        bone.expanded = json.expanded;
        bone.layerId = json.layerId;
        bone.position = json.position && new Vec2(json.position.x, json.position.y);
        bone.rotation = json.rotation;
        bone.length = json.length;
        if (json.visible != null) {
            bone.visible = json.visible;
        }
        if (json.boneVisible != null) {
            bone.boneVisible = json.boneVisible;
        }
        if (json.imageVisible != null) {
            bone.imageVisible = json.imageVisible;
        }
        bone.children = json.children.map(child => this.createBonesFromJson(child, bone));
        this.state.boneIdMap[bone.id] = bone;
        return bone;
    }

    private createAnimationsFromJson(json: AnimationJSON): Animation {
        const animation = new Animation(json.id, json.name);
        if (json.timeline) {
            animation.timeline = json.timeline.map(json => {
                const keyframe = new Keyframe(json.frameIndex);
                if (json.transform) {
                    keyframe.transform = BoneTransform.cloneMap(json.transform);
                }
                return keyframe;
            });
        }
        if (json.fps) {
            animation.fps = json.fps;
        }
        if (json.loop) {
            animation.loop = json.loop;
        }
        this.state.animationIdMap[json.id] = animation;
        return animation;
    }

    private nextId() {
        return ++this.idCount;
    }

    // ================ render ================

    /**
     * Get layer image WebGL texture
     */
    getLayerTexture(layer: Layer | LayerFolder): WebGLTexture {
        if (!this.layerTextureCache.hasOwnProperty(layer.id)) {
            this.layerTextureCache[layer.id] = new TextureCache(renderer);
        }
        if (layer instanceof Layer) {
            const textureCache = this.layerTextureCache[layer.id];
            if (textureCache.shouldSetData()) {
                textureCache.setData(this.imageData[layer.id], this.state.width);
            }
            return textureCache.getTexture() as WebGLTexture;
        } else {
            const cache = this.getFolderFrameBufferInfoCache(layer);
            if (cache.shouldReRender()) {
                renderer.startCapture(cache.getFrameBufferInfo(this.state.width, this.state.height));
                renderer.clear();
                this.renderLayers(layer.children);
                renderer.endCapture();
                cache.setExpired(false);
            }
            return cache.getTexture();
        }
    }

    /**
     * Get layer folder WebGL frame buffer cache
     */
    private getFolderFrameBufferInfoCache(folder: LayerFolder) {
        if (!this.folderFrameBufferInfoCache.hasOwnProperty(folder.id)) {
            this.folderFrameBufferInfoCache[folder.id] = new FrameBufferInfoCache(renderer);
        }
        return this.folderFrameBufferInfoCache[folder.id];
    }

    /**
     * Get triple size texture
     */
    getX3LayerTexture(layer: Layer | LayerFolder): WebGLTexture {
        if (!this.x3textureCache.hasOwnProperty(layer.id)) {
            this.x3textureCache[layer.id] = new FrameBufferInfoCache(renderer);
        }
        const x3cache = this.x3textureCache[layer.id];
        if (x3cache.shouldReRender()) {
            const texture = this.getLayerTexture(layer);
            const x3width = this.state.width * 3;
            const x3height = this.state.height * 3;
            renderer.resizeCanvas(x3width, x3height, true);
            renderer.startCapture(x3cache.getFrameBufferInfo(x3width, x3height));
            renderer.clear();
            renderer.useShader(x3brShader);
            renderer.setUniforms({u_inputSize: [this.state.width, this.state.height]});
            renderer.draw(texture, 0, 0, x3width, x3height);
            renderer.endCapture();
            x3cache.setExpired(false);
        }
        return x3cache.getTexture();
    }

    /**
     * Create x3 texture cache for every layer.
     */
    preRenderX3Textures(layers: Array<Layer | LayerFolder> = this.state.layers) {
        layers.forEach(layer => {
            this.getX3LayerTexture(layer);
            if (layer instanceof LayerFolder) {
                this.preRenderX3Textures(layer.children);
            }
        });
    }

    /**
     * Call this when layer display changed
     */
    markLayerAsShouldReRender(layer: Layer | LayerFolder) {
        if (layer instanceof LayerFolder) {
            if (this.folderFrameBufferInfoCache.hasOwnProperty(layer.id)) {
                this.folderFrameBufferInfoCache[layer.id].setExpired(true);
            }
        } else {
            if (this.layerTextureCache.hasOwnProperty(layer.id)) {
                this.layerTextureCache[layer.id].expired();
            }
        }
        if (this.x3textureCache.hasOwnProperty(layer.id)) {
            this.x3textureCache[layer.id].setExpired(true);
        }
        layer.parent && this.markLayerAsShouldReRender(layer.parent);
        this.shouldReRender = true;
    }

    private deleteLayerData(layer: Layer | LayerFolder) {
        Vue.delete(this.state.layerIdMap, layer.id);
        if (layer instanceof LayerFolder) {
            if (this.folderFrameBufferInfoCache.hasOwnProperty(layer.id)) {
                this.folderFrameBufferInfoCache[layer.id].dispose();
                delete this.folderFrameBufferInfoCache[layer.id];
            }
            layer.children.forEach(child => this.deleteLayerData(child));
        } else {
            if (this.layerTextureCache.hasOwnProperty(layer.id)) {
                this.layerTextureCache[layer.id].dispose();
                delete this.layerTextureCache[layer.id];
            }
            delete this.imageData[layer.id];
        }
        if (this.x3textureCache.hasOwnProperty(layer.id)) {
            this.x3textureCache[layer.id].dispose();
            delete this.x3textureCache[layer.id];
        }
    }

    private disposeAllRenderCache() {
        Object.values(this.layerTextureCache).forEach(cache => cache.dispose());
        Object.values(this.folderFrameBufferInfoCache).forEach(cache => cache.dispose());
        Object.values(this.x3textureCache).forEach(cache => cache.dispose());
    }

    renderLayers(
        layers: Array<Layer | LayerFolder>,
        customDrawingFunc?: (renderer: Renderer, layer: Layer | LayerFolder, texture: WebGLTexture) => boolean
    ) {
        const width = this.state.width;
        const height = this.state.height;
        for (let i = layers.length - 1; i >= 0; --i) {
            const layer = layers[i];
            if (layer.visible) {
                if (layer instanceof Layer) {
                    const alpha = layer.opacity / 100;
                    renderer.setColor(alpha, alpha, alpha, alpha);
                    renderer.useShader(multiplyAlphaShader);
                    const texture = this.getLayerTexture(layer);
                    if (customDrawingFunc && customDrawingFunc(renderer, layer, texture)) {
                    } else {
                        renderer.draw(texture, layer.offsetX, layer.offsetY);
                    }
                } else {
                    const frameBufferInfoCache = this.getFolderFrameBufferInfoCache(layer);
                    if (frameBufferInfoCache.shouldReRender()) {
                        renderer.startCapture(frameBufferInfoCache.getFrameBufferInfo(width, height));
                        renderer.clear();
                        this.renderLayers(layer.children, customDrawingFunc);
                        renderer.endCapture();
                        frameBufferInfoCache.setExpired(false);
                    }
                    renderer.useShader();
                    const alpha = layer.opacity / 100;
                    renderer.setColor(alpha, alpha, alpha, alpha);
                    const texture = frameBufferInfoCache.getTexture();
                    if (customDrawingFunc && customDrawingFunc(renderer, layer, texture)) {
                    } else {
                        renderer.draw(texture, layer.offsetX, layer.offsetY);
                    }
                }
            }
        }
    }

    getVisibleLayerIdBoneMap() {
        const ret: { [id: number]: Bone } = {};
        walk(this.state.bones);
        return ret;

        function walk(bone: Bone) {
            if (bone.visible) {
                if (bone.imageVisible && bone.layerId != null) {
                    ret[bone.layerId] = bone;
                }
                bone.children.forEach(child => walk(child));
            }
        }
    }

    // ================ paint - layer ================

    getLayer(id: number): Layer | LayerFolder {
        if (!this.state.layerIdMap.hasOwnProperty(id)) {
            throw new Error('Layer not exist')
        }
        return this.state.layerIdMap[id];
    }

    /**
     * Insert layer or layer folder to a certain position
     */
    private insertLayerObject<T extends Layer | LayerFolder>(object: T, parent?: LayerFolder, after?: Layer | LayerFolder): T {
        const container = parent ? parent.children : this.state.layers;
        if (after) {
            container.splice(container.indexOf(after), 0, object);
        } else {
            container.unshift(object);
        }
        this.state.layerIdMap[object.id] = object;
        return object;
    }

    /**
     * Choose a default name for layer
     */
    private getAvailableLayerName(prefix: string) {
        let max = 0;
        walk(this.state.layers);
        return prefix + (max + 1);

        function walk(container: Array<Layer | LayerFolder>) {
            container.forEach(layer => {
                if (layer.name.startsWith(prefix)) {
                    const num = Number(layer.name.substr(prefix.length));
                    if (num) {
                        max = Math.max(num, max);
                    }
                }
                if (layer instanceof LayerFolder) {
                    walk(layer.children);
                }
            });
        }
    }

    /**
     * Create an empty layer and insert it to related position
     */
    addLayer(position?: Layer | LayerFolder, parent?: LayerFolder, after?: Layer) {
        if (position) {
            if (position instanceof LayerFolder) {
                parent = position;
            } else {
                parent = position.parent;
                after = position;
            }
        }
        const id = this.nextId();
        this.imageData[id] = new Uint8Array(4 * this.state.width * this.state.height);
        return this.insertLayerObject(
            new Layer(
                id,
                this.getAvailableLayerName('Layer '),
                parent
            ),
            parent,
            after
        );
    }

    /**
     * Create an empty layer folder and insert it to related position
     */
    addFolder(position?: Layer | LayerFolder, parent?: LayerFolder, after?: Layer) {
        if (position) {
            if (position instanceof LayerFolder) {
                parent = position;
            } else {
                parent = position.parent;
                after = position;
            }
        }
        const id = this.nextId();
        return this.insertLayerObject(
            new LayerFolder(
                id,
                this.getAvailableLayerName('Folder '),
                parent
            ),
            parent,
            after
        );
    }

    deleteLayer(layer: Layer | LayerFolder) {
        const container = layer.parent ? layer.parent.children : this.state.layers;
        let index = container.indexOf(layer);
        container.splice(index, 1);
        index -= 1;
        if (index < 0) {
            index = 0;
        }
        this.deleteLayerData(layer);
        layer.parent && this.markLayerAsShouldReRender(layer.parent);
        this.shouldReRender = true;
        Vue.delete(this.state.layerIdMap, layer.id);
        if (container.length) {
            return container[index];
        } else {
            return layer.parent;
        }
    }

    moveLayer(layer: Layer | LayerFolder, position: 'before' | 'after', target: Layer | LayerFolder) {
        const oldParent = layer.parent;
        const oldContainer = layer.parent ? layer.parent.children : this.state.layers;
        oldContainer.splice(oldContainer.indexOf(layer), 1);
        if (target instanceof LayerFolder && position === 'after') {
            layer.parent = target;
            target.children.unshift(layer);
        } else {
            const newContainer = target.parent ? target.parent.children : this.state.layers;
            let index = newContainer.indexOf(target);
            if (position === 'after') {
                index += 1;
            }
            layer.parent = target.parent;
            newContainer.splice(index, 0, layer);
        }
        oldParent && this.markLayerAsShouldReRender(oldParent);
        layer.parent && this.markLayerAsShouldReRender(layer.parent);
        this.shouldReRender = true;
        return layer;
    }

    getFirstLayer(): Layer | LayerFolder | undefined {
        return this.state.layers[0];
    }

    getLayerImageData(layer: Layer): Uint8Array {
        if (!this.imageData.hasOwnProperty(layer.id)) {
            throw new Error('Layer data not exist');
        }
        return this.imageData[layer.id];
    }

    setLayerImageData(layer: Layer, data: Uint8Array) {
        this.imageData[layer.id] = data;
        this.markLayerAsShouldReRender(layer);
    }

    setLayerName(layer: Layer | LayerFolder, name: string) {
        layer.name = name;
    }

    setLayerVisibility(layer: Layer | LayerFolder, visible: boolean) {
        layer.visible = visible;
        layer.parent && this.markLayerAsShouldReRender(layer.parent);
        this.shouldReRender = true;
    }

    setLayerOpacity(layer: Layer | LayerFolder, opacity: number) {
        layer.opacity = opacity;
        layer.parent && this.markLayerAsShouldReRender(layer.parent);
        this.shouldReRender = true;
    }

    /**
     * Used for merging layers
     */
    getBottomLayer(layer: Layer): Layer | LayerFolder | undefined {
        const container = layer.parent ? layer.parent.children : this.state.layers;
        const index = container.indexOf(layer);
        if (index >= container.length - 1) {
            return undefined;
        }
        return container[index + 1];
    }

    /**
     * Blend src layer image to dst layer image
     */
    mergeDownLayerImageData(srcLayer: Layer, dstLayer: Layer) {
        const dataSrc = this.getLayerImageData(srcLayer);
        const dataDst = this.getLayerImageData(dstLayer);
        const width = this.state.width;
        const height = this.state.height;
        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {
                const src = this.getPixel(dataSrc, x, y);
                const dst = this.getPixel(dataDst, x, y);

                const srcR = src[0];
                const srcG = src[1];
                const srcB = src[2];
                const srcA = src[3];
                const srcAlpha = srcA / 255;
                const srcMix = srcA / Math.max(srcA, dst[3]) || 0;
                const dstMix = 1 - srcMix;

                const r = Math.max(0, Math.min(0xff, Math.round(srcR * srcMix + dst[0] * dstMix)));
                const g = Math.max(0, Math.min(0xff, Math.round(srcG * srcMix + dst[1] * dstMix)));
                const b = Math.max(0, Math.min(0xff, Math.round(srcB * srcMix + dst[2] * dstMix)));
                const a = Math.max(0, Math.min(0xff, Math.round(srcA + dst[3] * (1 - srcAlpha))));
                this.setPixel(dataDst, x, y, [r, g, b, a]);
            }
        }
        this.markLayerAsShouldReRender(dstLayer);
        return dstLayer;
    }

    duplicateLayer(layer: Layer | LayerFolder, cloneParent?: LayerFolder): Layer | LayerFolder {
        if (layer instanceof Layer) {
            const clone = this.addLayer(undefined, cloneParent || layer.parent, cloneParent ? undefined : layer);
            clone.name = layer.name + (cloneParent ? '' : ' Copy');
            clone.opacity = layer.opacity;
            clone.visible = layer.visible;
            this.setLayerImageData(clone, this.getLayerImageData(layer).slice());
            return clone;
        } else {
            const clone = this.addFolder(undefined, cloneParent || layer.parent, cloneParent ? undefined : layer);
            clone.name = layer.name + (cloneParent ? '' : ' Copy');
            clone.opacity = layer.opacity;
            clone.visible = layer.visible;
            clone.expanded = layer.expanded;
            for (let i = layer.children.length - 1; i >= 0; --i) {
                const child = layer.children[i];
                this.duplicateLayer(child, clone);
            }
            return clone;
        }
    }

    // ================ paint - draw ================

    private pixelIndex(x: number, y: number) {
        if (x < 0 || y < 0 || x > this.state.width || y > this.state.height) {
            throw new Error('Out of range');
        }
        return (y * this.state.width + x) * 4;
    }

    getPixel(image: Uint8Array, x: number, y: number) {
        const index = this.pixelIndex(x, y);
        return image.slice(index, index + 4);
    }

    setPixel(image: Uint8Array, x: number, y: number, bytes: ArrayLike<number>) {
        const index = this.pixelIndex(x, y);
        image.set(bytes, index);
    }

    // ================ paint - other opts ================

    resizeCanvas(width: number, height: number, align: string) {
        if (width === this.state.width && height === this.state.height) {
            return;
        }
        const oldWidth = this.state.width;
        const oldHeight = this.state.height;
        let dx = 0;
        let dy = 0;
        const cx = Math.round((width - oldWidth) / 2);
        // const cy = Math.round((height - oldHeight) / 2);
        switch (align) {
            case 'top-left':
                break;
            case 'top':
                dx = cx;
                break;
            case 'top-right':
                dx = width - oldWidth;
                break;
            case 'left':
                dy = cx;
                break;
            case 'center':
                dx = cx;
                dy = cx;
                break;
            case 'right':
                dx = width - oldWidth;
                dy = cx;
                break;
            case 'bottom-left':
                dy = height - oldHeight;
                break;
            case 'bottom':
                dx = cx;
                dy = height - oldHeight;
                break;
            case 'bottom-right':
                dx = width - oldWidth;
                dy = height - oldHeight;
                break;
            default:
                throw new Error('Unknown align type');
        }
        for (let id in this.imageData) {
            if (this.imageData.hasOwnProperty(id)) {
                const oldData = this.imageData[id] as Uint8Array;
                const newData = new Uint8Array(width * height * 4);
                this.imageData[id] = newData;

                for (let ox = 0; ox < oldWidth; ++ox) {
                    const nx = ox + dx;
                    if (nx < 0 || nx >= width) {
                        continue;
                    }
                    for (let oy = 0; oy < oldHeight; ++oy) {
                        const ny = oy + dy;
                        if (ny < 0 || ny >= height) {
                            continue;
                        }
                        const oi = (oy * oldWidth + ox) * 4;
                        const ni = (ny * width + nx) * 4;
                        newData.set(oldData.slice(oi, oi + 4), ni);
                    }
                }
            }
        }
        this.state.width = width;
        this.state.height = height;
        this.disposeAllRenderCache();
        this.shouldReRender = true;
    }

    flipHorizontal() {
        const width = this.state.width;
        const height = this.state.height;
        for (let id in this.imageData) {
            if (this.imageData.hasOwnProperty(id)) {
                const oldData = this.imageData[id] as Uint8Array;
                const newData = new Uint8Array(width * height * 4);
                this.imageData[id] = newData;
                for (let x = 0; x < width; ++x) {
                    for (let y = 0; y < height; ++y) {
                        this.setPixel(newData, width - 1 - x, y, this.getPixel(oldData, x, y));
                    }
                }
            }
        }
        this.disposeAllRenderCache();
        this.shouldReRender = true;
    }

    flipVertical() {
        const width = this.state.width;
        const height = this.state.height;
        for (let id in this.imageData) {
            if (this.imageData.hasOwnProperty(id)) {
                const oldData = this.imageData[id] as Uint8Array;
                const newData = new Uint8Array(width * height * 4);
                this.imageData[id] = newData;
                for (let x = 0; x < width; ++x) {
                    for (let y = 0; y < height; ++y) {
                        this.setPixel(newData, x, height - 1 - y, this.getPixel(oldData, x, y));
                    }
                }
            }
        }
        this.disposeAllRenderCache();
        this.shouldReRender = true;
    }

    rotate180() {
        const width = this.state.width;
        const height = this.state.height;
        for (let id in this.imageData) {
            if (this.imageData.hasOwnProperty(id)) {
                const oldData = this.imageData[id] as Uint8Array;
                const newData = new Uint8Array(width * height * 4);
                this.imageData[id] = newData;
                for (let x = 0; x < width; ++x) {
                    for (let y = 0; y < height; ++y) {
                        this.setPixel(newData, width - 1 - x, height - 1 - y, this.getPixel(oldData, x, y));
                    }
                }
            }
        }
        this.disposeAllRenderCache();
        this.shouldReRender = true;
    }

    rotate90cw() {
        const width = this.state.width;
        const height = this.state.height;
        for (let id in this.imageData) {
            if (this.imageData.hasOwnProperty(id)) {
                const oldData = this.imageData[id] as Uint8Array;
                const newData = new Uint8Array(width * height * 4);
                this.imageData[id] = newData;
                for (let x = 0; x < width; ++x) {
                    for (let y = 0; y < height; ++y) {
                        const oi = (y * width + x) * 4;
                        const ni = (x * height + (height - 1 - y)) * 4;
                        newData.set(oldData.slice(oi, oi + 4), ni);
                    }
                }
            }
        }
        this.state.width = (height);
        this.state.height = (width);
        this.disposeAllRenderCache();
        this.shouldReRender = true;
    }

    rotate90ccw() {
        const width = this.state.width;
        const height = this.state.height;
        for (let id in this.imageData) {
            if (this.imageData.hasOwnProperty(id)) {
                const oldData = this.imageData[id] as Uint8Array;
                const newData = new Uint8Array(width * height * 4);
                this.imageData[id] = newData;
                for (let x = 0; x < width; ++x) {
                    for (let y = 0; y < height; ++y) {
                        const oi = (y * width + x) * 4;
                        const ni = ((width - 1 - x) * height + y) * 4;
                        newData.set(oldData.slice(oi, oi + 4), ni);
                    }
                }
            }
        }
        this.state.width = (height);
        this.state.height = (width);
        this.disposeAllRenderCache();
        this.shouldReRender = true;
    }

    // ================ paint - history ================

    getImageDataCopies() {
        const ret: { [id: string]: Uint8Array } = {};
        Object.keys(this.imageData).forEach(key => {
            ret[key] = this.imageData[key].slice();
        });
        return ret;
    }

    getLayerImageDataCopy(layer: Layer) {
        return this.getLayerImageData(layer).slice();
    }

    setImageData(data: { [id: string]: Uint8Array }) {
        Object.keys(data).forEach(key => {
            this.imageData[key] = data[key].slice();
        });
        this.disposeAllRenderCache();
        this.shouldReRender = true;
    }

    getLayerRestoreInfo(layer: Layer | LayerFolder) {
        return new LayerRestoreInfo(layer, this);
    }

    restoreLayer(restoreInfo: LayerRestoreInfo) {
        if (this.state.layerIdMap.hasOwnProperty(restoreInfo.id)) {
            throw new Error('Layer already exists');
        }

        const object: Layer | LayerFolder = restoreInfo.isFolder ?
            new LayerFolder(restoreInfo.id, restoreInfo.name)
            : new Layer(restoreInfo.id, restoreInfo.name);

        object.opacity = restoreInfo.opacity;
        object.visible = restoreInfo.visible;
        if (restoreInfo.parentId != null) {
            object.parent = this.getLayer(restoreInfo.parentId) as LayerFolder;
        }
        const container = restoreInfo.parentId == null ?
            this.state.layers
            : (this.getLayer(restoreInfo.parentId) as LayerFolder).children;
        container.splice(restoreInfo.position, 0, object);

        if (!restoreInfo.isFolder && restoreInfo.imageData) {
            this.imageData[restoreInfo.id] = restoreInfo.imageData.slice();
        }

        this.state.layerIdMap[restoreInfo.id] = object;

        if (restoreInfo.isFolder) {
            if (restoreInfo.expanded != null) {
                (object as LayerFolder).expanded = restoreInfo.expanded;
            }
            if (restoreInfo.children) {
                restoreInfo.children.forEach(restoreInfo => this.restoreLayer(restoreInfo));
            }
        }

        this.shouldReRender = true;
        return object;
    }

    getLayerPositionRestoreInfo(layer: Layer | LayerFolder) {
        return new LayerPositionRestoreInfo(layer, this);
    }

    restoreLayerPosition(restoreInfo: LayerPositionRestoreInfo) {
        const layer = this.getLayer(restoreInfo.id);
        const currentContainer = layer.parent ? layer.parent.children : this.state.layers;
        const originalContainer = restoreInfo.parentId == null ?
            this.state.layers
            : (this.getLayer(restoreInfo.parentId) as LayerFolder).children;

        currentContainer.splice(currentContainer.indexOf(layer), 1);
        originalContainer.splice(restoreInfo.position, 0, layer);
        layer.parent = restoreInfo.parentId == null ? undefined : this.getLayer(restoreInfo.parentId) as LayerFolder;

        layer.parent && this.markLayerAsShouldReRender(layer.parent);
        this.shouldReRender = true;
        return layer;
    }

    // ================ skeleton - bone ================

    /**
     * Choose a default name for bone
     */
    private getAvailableBoneName(prefix: string) {
        let max = 0;
        Object.values(this.state.boneIdMap).forEach(bone => {
            if (bone.name.startsWith(prefix)) {
                const num = Number(bone.name.substr(prefix.length));
                if (num) {
                    max = Math.max(max, num);
                }
            }
        });
        return prefix + (max + 1);
    }

    getBone(id: number) {
        if (id < 0) {
            return this.state.bones;
        }
        if (!this.state.boneIdMap.hasOwnProperty(id)) {
            throw new Error('Bone not exists');
        }
        return this.state.boneIdMap[id];
    }

    addBone(parent?: Bone) {
        parent = parent || this.state.bones;
        const bone = new Bone(this.nextId(), this.getAvailableBoneName('Bone '), parent);
        parent.children.push(bone);
        this.state.boneIdMap[bone.id] = bone;
        return bone;
    }

    deleteBone(bone: Bone): Bone {
        if (!bone.parent) {
            throw new Error('Illegal bone');
        }
        const container = bone.parent.children;
        let index = container.indexOf(bone);
        container.splice(index, 1);
        Vue.delete(this.state.boneIdMap, bone.id);
        index -= 1;
        if (index < 0) {
            index = 0;
        }
        bone.children.forEach(child => this.deleteBone(child));
        return container.length ? container[index] : bone.parent;
    }

    moveBone(bone: Bone, position: string, target: Bone) {
        if (!bone.parent) {
            throw new Error('Illegal bone');
        }
        if (position === 'before' && !target.parent) {
            return bone;
        }
        const oldParent = bone.parent;
        const oldContainer = oldParent.children;
        oldContainer.splice(oldContainer.indexOf(bone), 1);
        switch (position) {
            case 'before':
                if (target.parent) {
                    const newContainer = target.parent.children;
                    newContainer.splice(newContainer.indexOf(target), 0, bone);
                    bone.parent = target.parent;
                }
                break;
            case 'after':
                if (target.parent) {
                    const newContainer = target.parent.children;
                    newContainer.splice(newContainer.indexOf(target) + 1, 0, bone);
                    bone.parent = target.parent;
                }
                break;
            case 'inner': {
                const container = target.children;
                container.unshift(bone);
                bone.parent = target;
            }
                break;
            default:
                throw new Error('Unknown position type');
        }
        return bone;
    }

    setBoneVector(bone: Bone, position: { x: number, y: number } | null, rotation: number, length: number) {
        bone.position = position && new Vec2(position.x, position.y);
        bone.rotation = rotation;
        bone.length = length;
    }

    setBoneName(bone: Bone, name: string) {
        bone.name = name;
    }

    setBoneLayerId(bone: Bone, layerId: number | null) {
        bone.layerId = layerId;
    }

    setBoneBoneVisibility(bone: Bone, visible: boolean) {
        bone.boneVisible = visible;
    }

    setBoneImageVisibility(bone: Bone, visible: boolean) {
        bone.imageVisible = visible;
    }

    setBoneVisibility(bone: Bone, visible: boolean) {
        bone.visible = visible;
    }

    // ================ skeleton - history ================

    getBoneRestoreInfo(bone: Bone) {
        return new BoneRestoreInfo(bone);
    }

    restoreBone(restoreInfo: BoneRestoreInfo) {
        if (this.state.boneIdMap.hasOwnProperty(restoreInfo.id)) {
            throw new Error('Bone already exists');
        }
        const parent = this.getBone(restoreInfo.parentId);
        const bone = new Bone(restoreInfo.id, restoreInfo.name, parent);
        bone.expanded = restoreInfo.expanded;

        bone.layerId = restoreInfo.layerId;
        bone.position = restoreInfo.position && new Vec2(restoreInfo.position.x, restoreInfo.position.y);
        bone.rotation = restoreInfo.rotation;
        bone.length = restoreInfo.length;

        bone.visible = restoreInfo.visible;
        bone.boneVisible = restoreInfo.boneVisible;
        bone.imageVisible = restoreInfo.imageVisible;

        parent.children.splice(restoreInfo.index, 0, bone);
        this.state.boneIdMap[bone.id] = bone;

        bone.children = restoreInfo.children.map(child => this.restoreBone(child));

        return bone;
    }

    getBonePositionRestoreInfo(bone: Bone) {
        return new BonePositionRestoreInfo(bone);
    }

    restoreBonePosition(restoreInfo: BonePositionRestoreInfo) {
        const bone = this.getBone(restoreInfo.id);
        if (!bone.parent) {
            throw new Error('Illegal bone');
        }
        const currentContainer = bone.parent.children;
        const originalParent = this.getBone(restoreInfo.parentId);
        const originalContainer = originalParent.children;
        currentContainer.splice(currentContainer.indexOf(bone), 1);
        originalContainer.splice(restoreInfo.position, 0, bone);
        bone.parent = originalParent;
        return bone;
    }

    // ================ animate - animation ================

    getAnimation(id: number) {
        if (!this.state.animationIdMap.hasOwnProperty(id)) {
            throw new Error('Animation not exists');
        }
        return this.state.animationIdMap[id];
    }

    /**
     * Choose a default name for animation
     */
    private getAvailableAnimationName(prefix: string) {
        let max = 0;
        this.state.animations.forEach(animation => {
            if (animation.name.startsWith(prefix)) {
                const num = Number(animation.name.substr(prefix.length));
                if (num) {
                    max = Math.max(max, num);
                }
            }
        });
        return prefix + (max + 1);
    }

    addAnimation() {
        const id = this.nextId();
        const name = this.getAvailableAnimationName('Animation ');
        const animation = new Animation(id, name);
        this.state.animations.unshift(animation);
        this.state.animationIdMap[id] = animation;
        return animation;
    }

    deleteAnimation(animation: Animation): Animation | undefined {
        const animations = this.state.animations;
        const index = animations.indexOf(animation);
        animations.splice(index, 1);
        Vue.delete(this.state.animationIdMap, animation.id);
        return index < animations.length ? animations[index] : animations[0];
    }

    moveAnimation(animation: Animation, position: string, target: Animation) {
        const animations = this.state.animations;
        animations.splice(animations.indexOf(animation), 1);
        let index = animations.indexOf(target);
        if (position === 'after') {
            index += 1;
        }
        animations.splice(index, 0, animation);
        return animation;
    }

    setAnimationFps(animation: Animation, fps: number) {
        animation.fps = fps;
    }

    // ================ animate - animation - history ================

    getAnimationRestoreInfo(animation: Animation) {
        return new AnimationRestoreInfo(animation, this);
    }

    restoreAnimation(restoreInfo: AnimationRestoreInfo) {
        const animation = new Animation(restoreInfo.id, restoreInfo.name);
        animation.timeline = restoreInfo.timeline.map(keyframe => {
            const clone = new Keyframe(keyframe.frameIndex);
            clone.transform = BoneTransform.cloneMap(keyframe.transform);
            return clone;
        });
        animation.fps = restoreInfo.fps;
        animation.loop = restoreInfo.loop;
        this.state.animations.splice(restoreInfo.index, 0, animation);
        this.state.animationIdMap[restoreInfo.id] = animation;
        return animation;
    }

    getAnimationPositionRestoreInfo(animation: Animation) {
        return new AnimationPositionRestoreInfo(animation.id, this.state.animations.indexOf(animation));
    }

    restoreAnimationPosition(restoreInfo: AnimationPositionRestoreInfo) {
        const animation = this.getAnimation(restoreInfo.id);
        this.state.animations.splice(this.state.animations.indexOf(animation), 1);
        this.state.animations.splice(restoreInfo.index, 0, animation);
        return animation;
    }

    // ================ animate - timeline ================

    /**
     * Insert keyframe to timeline. If a keyframe already exists, return the existing one.
     */
    private insertKeyframe(animation: Animation, keyframe: Keyframe) {
        const index = animation.timeline.findIndex(curr => curr.frameIndex >= keyframe.frameIndex);
        if (index >= 0) {
            if (animation.timeline[index].frameIndex === keyframe.frameIndex) {
                return animation.timeline[index];
            }
            animation.timeline.splice(index, 0, keyframe);
        } else {
            animation.timeline.push(keyframe);
        }
        return keyframe;
    }

    getKeyframe(animation: Animation, frameIndex: number): Keyframe | undefined {
        return animation.timeline.find(keyframe => keyframe.frameIndex === frameIndex);
    }

    /**
     * Create an empty keyframe and inert it to timeline.
     */
    addKeyframe(animation: Animation, frameIndex: number) {
        let keyframe = this.getKeyframe(animation, frameIndex);
        if (keyframe) {
            return keyframe;
        }
        keyframe = new Keyframe(frameIndex);
        keyframe.transform = BoneTransform.cloneMap(this.getFrameBoneTransformMap(animation, frameIndex));
        return this.insertKeyframe(animation, keyframe);
    }

    deleteKeyframe(animation: Animation, frameIndex: number) {
        const index = animation.timeline.findIndex(keyframe => keyframe.frameIndex === frameIndex);
        if (index >= 0) {
            animation.timeline.splice(index, 1);
        }
    }

    /**
     * Move keyframe to a certain position.
     */
    moveKeyframe(animation: Animation, frameIndex: number, position: number) {
        if (this.getKeyframe(animation, position)) {
            throw new Error('Keyframe already existed');
        }
        const keyframe = this.getKeyframe(animation, frameIndex);
        if (!keyframe) {
            throw new Error('Keyframe not exists')
        }
        animation.timeline.splice(animation.timeline.findIndex(keyframe => keyframe.frameIndex === frameIndex), 1);
        keyframe.frameIndex = position;
        this.insertKeyframe(animation, keyframe);
    }

    /**
     * Move all keyframes right of frameIndex 1 frame to the left.
     * Return true if any keyframe moved.
     */
    frameMoveLeft(animation: Animation, frameIndex: number) {
        if (!animation.timeline.length) {
            return false;
        }
        if (animation.timeline[animation.timeline.length - 1].frameIndex < frameIndex) {
            return false;
        }
        if (frameIndex === 0) {
            return false;
        }
        if (animation.timeline.find(keyframe => keyframe.frameIndex === frameIndex - 1)
            && animation.timeline.find(keyframe => keyframe.frameIndex === frameIndex)
        ) {
            return false;
        }
        animation.timeline.forEach(keyframe => {
            if (keyframe.frameIndex >= frameIndex) {
                keyframe.frameIndex -= 1;
            }
        });
        return true;
    }

    /**
     * Move all keyframes right of frameIndex 1 frame to the right.
     * Return true if any keyframe moved.
     */
    frameMoveRight(animation: Animation, frameIndex: number) {
        if (!animation.timeline.length) {
            return false;
        }
        animation.timeline.forEach(keyframe => {
            if (keyframe.frameIndex >= frameIndex) {
                keyframe.frameIndex += 1;
            }
        });
        return true;
    }

    // ================ animate - timeline - history ================

    /**
     * Used for undoing create or delete keyframe.
     */
    getKeyframeRestoreInfo(animation: Animation, frameIndex: number) {
        const index = animation.timeline.findIndex(keyframe => keyframe.frameIndex === frameIndex);
        if (index >= 0) {
            return new KeyframeRestoreInfo(animation.id, animation.timeline[index]);
        } else {
            throw new Error('Keyframe not exists');
        }
    }

    /**
     * Undo create or delete keyframe.
     */
    restoreKeyframe(restoreInfo: KeyframeRestoreInfo) {
        const animation = this.getAnimation(restoreInfo.animationId);
        const keyframe = new Keyframe(restoreInfo.frameIndex);
        keyframe.transform = BoneTransform.cloneMap(restoreInfo.transform);
        const ret = this.insertKeyframe(animation, keyframe);
        if (ret !== keyframe) {
            throw new Error('Keyframe already existed');
        }
        return ret;
    }

    // ================ animate - transform ================

    setKeyframeBoneTransform(
        animation: Animation,
        frameIndex: number,
        bone: Bone,
        translateX: number,
        translateY: number,
        rotate: number
    ) {
        if (bone.id <= 0) {
            throw new Error('Cannot set root bone transform');
        }
        let keyframe = this.getKeyframe(animation, frameIndex);
        if (!keyframe) {
            keyframe = this.addKeyframe(animation, frameIndex);
        }
        const transform = keyframe.transform[bone.id] = new BoneTransform;
        transform.translateX = translateX;
        transform.translateY = translateY;
        transform.rotate = rotate;
    }

    /**
     * Get the transformation of bone in the local coordinate in frame.
     */
    getFrameBoneTransform(
        animation: Animation,
        frameIndex: number,
        bone: Bone,
        transformMap: { [id: number]: BoneTransform } = this.getFrameBoneTransformMap(animation, frameIndex)
    ) {
        if (transformMap.hasOwnProperty(bone.id)) {
            return transformMap[bone.id];
        }
        return new BoneTransform;
    }

    /**
     * Get the 3x3 transformation matrix of bone in the world coordinate in frame.
     */
    getFrameBoneWorldTransformMat33(
        animation: Animation,
        frameIndex: number,
        bone: Bone,
        transformMap?: { [id: number]: BoneTransform }
    ) {
        let curr: Bone | undefined = bone;
        let mat: number[][] = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ];

        transformMap = transformMap || this.getFrameBoneTransformMap(animation, frameIndex);

        while (curr && curr.id >= 0) {
            if (curr.position && transformMap.hasOwnProperty(curr.id)) {
                const transform = transformMap[curr.id];
                const cos = Math.cos(transform.rotate);
                const sin = Math.sin(transform.rotate);
                mat = multiply(
                    mat,
                    [
                        [1, 0, 0],
                        [0, 1, 0],
                        [-curr.position.x, -curr.position.y, 1]
                    ],
                    [
                        [cos, sin, 0],
                        [-sin, cos, 0],
                        [0, 0, 1]
                    ],
                    [
                        [1, 0, 0],
                        [0, 1, 0],
                        [curr.position.x, curr.position.y, 1]
                    ],
                    [
                        [1, 0, 0],
                        [0, 1, 0],
                        [transform.translateX, transform.translateY, 1]
                    ]
                );
            }
            curr = curr.parent;
        }

        return mat;
    }

    /**
     * Get the two endpoints of bone in the world coordinate in frame.
     */
    getFrameBoneWorldVec(
        animation: Animation,
        frameIndex: number,
        bone: Bone,
        transformMap?: { [id: number]: BoneTransform }
    ): [Vec2, Vec2] {
        if (!bone.position) {
            return [new Vec2(), new Vec2()];
        }
        const v0 = bone.position;
        const v1 = bone.position.add(new Vec2(1, 0).rotate(0, 0, bone.rotation).mul(bone.length));
        const mat = this.getFrameBoneWorldTransformMat33(animation, frameIndex, bone, transformMap);
        return [
            transformVec2(mat, v0),
            transformVec2(mat, v1)
        ];
    }

    private static getPrevKeyframe(animation: Animation, frameIndex: number) {
        let ret: Keyframe | undefined;
        const timeline = animation.timeline;
        for (let i = 0; i < timeline.length; ++i) {
            const keyframe = timeline[i];
            if (keyframe.frameIndex < frameIndex) {
                ret = keyframe;
            } else if (keyframe.frameIndex >= frameIndex) {
                break;
            }
        }
        return ret;
    }

    private static getNextKeyframe(animation: Animation, frameIndex: number) {
        let ret: Keyframe | undefined;
        const timeline = animation.timeline;
        for (let i = 0; i < timeline.length; ++i) {
            const keyframe = timeline[i];
            if (keyframe.frameIndex > frameIndex) {
                ret = keyframe;
                break;
            }
        }
        return ret;
    }

    /**
     * Get the transformation of all bones in a frame. Non-key frames will be interpolated.
     */
    getFrameBoneTransformMap(animation: Animation, frameIndex: number): { [boneId: number]: BoneTransform } {
        const keyframe = this.getKeyframe(animation, frameIndex);
        if (keyframe) {
            return keyframe.transform;
        }

        const prevKeyframe = Project.getPrevKeyframe(animation, frameIndex);
        const nextKeyframe = Project.getNextKeyframe(animation, frameIndex);

        const boneIds = Object.keys(this.state.boneIdMap);
        const ret = boneIds.reduce((map, id) => {
            map[Number(id)] = new BoneTransform();
            return map;
        }, {} as { [id: number]: BoneTransform });

        if (!prevKeyframe) {
            return ret;
        }
        if (!nextKeyframe) {
            return prevKeyframe.transform;
        }

        const interp = (frameIndex - prevKeyframe.frameIndex) / (nextKeyframe.frameIndex - prevKeyframe.frameIndex);
        boneIds.forEach(id => {
            let prevTransform = prevKeyframe.transform[Number(id)];
            let nextTransform = nextKeyframe.transform[Number(id)];
            if (!prevTransform) {
                return;
            }
            if (!nextTransform) {
                nextTransform = new BoneTransform();
            }
            const transform = new BoneTransform();
            transform.translateX = prevTransform.translateX + interp * (nextTransform.translateX - prevTransform.translateX);
            transform.translateY = prevTransform.translateY + interp * (nextTransform.translateY - prevTransform.translateY);
            transform.rotate = prevTransform.rotate + interp * (nextTransform.rotate - prevTransform.rotate);
            ret[Number(id)] = transform;
        });

        return ret;
    }

    fillKeyframesMissingBoneTransform() {
        const boneIds = Object.keys(this.state.boneIdMap);
        this.state.animations.forEach(animation => {
            animation.timeline.forEach(keyframe => {
                boneIds.forEach(id => {
                    if (!keyframe.transform.hasOwnProperty(id)) {
                        keyframe.transform[Number(id)] = new BoneTransform();
                    }
                });
            });
        });
    }

    // ================ animate - transform - history ================

    /**
     * Used for undoing set keyframe transform
     */
    getKeyframeTransformRestoreInfo(animation: Animation, frameIndex: number, bone: Bone) {
        const restoreInfo = new KeyframeTransformRestoreInfo;
        restoreInfo.animationId = animation.id;
        restoreInfo.frameIndex = frameIndex;
        restoreInfo.boneId = bone.id;
        const keyframe = this.getKeyframe(animation, frameIndex);
        if (keyframe) {
            restoreInfo.isNew = false;
            const transform = keyframe.transform[bone.id];
            if (transform) {
                restoreInfo.transform.translateX = transform.translateX;
                restoreInfo.transform.translateY = transform.translateY;
                restoreInfo.transform.rotate = transform.rotate;
            }
        } else {
            restoreInfo.isNew = true;
        }
        return restoreInfo;
    }

    /**
     * Undo set keyframe transform
     */
    restoreKeyframeTransform(restoreInfo: KeyframeTransformRestoreInfo) {
        if (restoreInfo.isNew) {
            this.deleteKeyframe(this.getAnimation(restoreInfo.animationId), restoreInfo.frameIndex);
        } else {
            this.setKeyframeBoneTransform(
                this.getAnimation(restoreInfo.animationId),
                restoreInfo.frameIndex,
                this.getBone(restoreInfo.boneId),
                restoreInfo.transform.translateX,
                restoreInfo.transform.translateY,
                restoreInfo.transform.rotate
            );
        }
    }

}
