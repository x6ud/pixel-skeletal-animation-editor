import Project from './Project'
import Layer from './Layer'
import LayerFolder from './LayerFolder'

/**
 * Used for saving project
 */
export default class LayerJSON {

    id: number;
    name: string;
    opacity: number;
    visible: boolean;
    isFolder: boolean;
    children?: Array<LayerJSON>;
    expanded?: boolean;

    constructor(layer: Layer | LayerFolder, project: Project) {
        this.id = layer.id;
        this.name = layer.name;
        this.opacity = layer.opacity;
        this.visible = layer.visible;
        if (layer instanceof Layer) {
            this.isFolder = false;
        } else {
            this.isFolder = true;
            this.expanded = layer.expanded;
            this.children = layer.children.map(child => new LayerJSON(child, project));
        }
    }

}
