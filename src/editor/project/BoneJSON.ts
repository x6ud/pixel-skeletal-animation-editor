import Bone from './Bone'

/**
 * Used for saving project
 */
export default class BoneJSON {

    id: number;
    name: string;
    parentId?: number;
    expanded: boolean;
    children: Array<BoneJSON>;

    layerId: number | null;
    position: { x: number, y: number } | null;
    rotation: number;
    length: number;

    visible: boolean;
    boneVisible: boolean;
    imageVisible: boolean;

    constructor(bone: Bone) {
        this.id = bone.id;
        this.name = bone.name;
        this.parentId = bone.parent ? bone.parent.id : undefined;
        this.expanded = bone.expanded;

        this.layerId = bone.layerId;
        this.position = bone.position && bone.position.clone();
        this.rotation = bone.rotation;
        this.length = bone.length;

        this.visible = bone.visible;
        this.boneVisible = bone.boneVisible;
        this.imageVisible = bone.imageVisible;

        this.children = bone.children.map(child => new BoneJSON(child));
    }

}
