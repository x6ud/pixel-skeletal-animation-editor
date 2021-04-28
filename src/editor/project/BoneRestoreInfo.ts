import Bone from './Bone'

/**
 * Used for undoing create or delete bones
 */
export default class BoneRestoreInfo {

    id: number;
    name: string;
    parentId: number;
    expanded: boolean;
    children: Array<BoneRestoreInfo>;

    layerId: number | null;
    position: { x: number, y: number } | null;
    rotation: number;
    length: number;

    visible: boolean;
    boneVisible: boolean;
    imageVisible: boolean;

    index: number;

    constructor(bone: Bone) {
        if (!bone.parent) {
            throw new Error('Illegal bone');
        }
        this.id = bone.id;
        this.name = bone.name;
        this.parentId = bone.parent.id;
        this.expanded = bone.expanded;

        this.layerId = bone.layerId;
        this.position = bone.position && bone.position.clone();
        this.rotation = bone.rotation;
        this.length = bone.length;

        this.visible = bone.visible;
        this.boneVisible = bone.boneVisible;
        this.imageVisible = bone.imageVisible;

        this.children = bone.children.map(child => new BoneRestoreInfo(child));

        this.index = bone.parent.children.indexOf(bone);
    }

}
