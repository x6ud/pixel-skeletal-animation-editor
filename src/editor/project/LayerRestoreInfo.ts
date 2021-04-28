import Project from './Project'
import Layer from './Layer'
import LayerFolder from './LayerFolder'

/**
 * Used for undoing create or delete layers
 */
export default class LayerRestoreInfo {

    id: number;
    name: string;
    opacity: number;
    visible: boolean;
    parentId?: number;
    position: number;
    isFolder: boolean;
    imageData?: Uint8Array;
    children?: Array<LayerRestoreInfo>;
    expanded?: boolean;

    constructor(layer: Layer | LayerFolder, project: Project) {
        this.id = layer.id;
        this.name = layer.name;
        this.opacity = layer.opacity;
        this.visible = layer.visible;
        if (layer.parent) {
            this.parentId = layer.parent.id;
            this.position = layer.parent.children.indexOf(layer);
        } else {
            this.position = project.state.layers.indexOf(layer);
        }

        if (layer instanceof Layer) {
            this.isFolder = false;
            this.imageData = project.getLayerImageData(layer).slice();
        } else {
            this.isFolder = true;
            this.expanded = layer.expanded;
            this.children = layer.children.map(child => new LayerRestoreInfo(child, project));
        }
    }

}
