import Layer from './Layer'

export default class LayerFolder {

    id: number;
    name: string;
    /**
     * 0 ~ 100
     */
    opacity: number;
    visible: boolean;
    parent?: LayerFolder;
    children: Array<Layer | LayerFolder>;
    expanded: boolean;

    offsetX: number = 0;
    offsetY: number = 0;

    constructor(id: number, name: string, parent?: LayerFolder) {
        this.id = id;
        this.name = name;
        this.opacity = 100;
        this.visible = true;
        this.expanded = true;
        Object.defineProperty(this, 'parent', {
            configurable: true,
            enumerable: false,
            writable: true
        });
        this.parent = parent;
        this.children = [];
    }

}
