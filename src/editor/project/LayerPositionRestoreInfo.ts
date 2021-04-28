import Project from './Project'
import Layer from './Layer'
import LayerFolder from './LayerFolder'

/**
 * Used for undoing move layers
 */
export default class LayerPositionRestoreInfo {

    id: number;
    parentId?: number;
    position: number;

    constructor(layer: Layer | LayerFolder, project: Project) {
        this.id = layer.id;
        if (layer.parent) {
            this.parentId = layer.parent.id;
            this.position = layer.parent.children.indexOf(layer);
        } else {
            this.position = project.state.layers.indexOf(layer);
        }
    }

}
