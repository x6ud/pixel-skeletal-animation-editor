import Vec2 from '../../utils/Vec2'

export default class Bone {

    id: number;
    name: string;
    parent?: Bone;
    expanded: boolean = true;
    children: Array<Bone>;

    layerId: number | null = null;
    position: Vec2 | null = null;
    rotation: number = 0;
    length: number = 0;

    visible: boolean = true;
    boneVisible: boolean = true;
    imageVisible: boolean = true;

    constructor(id: number, name: string, parent?: Bone) {
        this.id = id;
        this.name = name;
        Object.defineProperty(this, 'parent', {
            configurable: true,
            enumerable: false,
            writable: true
        });
        this.parent = parent;
        this.children = [];
    }

}
