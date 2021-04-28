import Bone from './Bone'

/**
 * Used for undoing move bones
 */
export default class BonePositionRestoreInfo {

    id: number;
    parentId: number;
    position: number;

    constructor(bone: Bone) {
        if (!bone.parent) {
            throw new Error('Illegal bone');
        }
        this.id = bone.id;
        this.parentId = bone.parent.id;
        this.position = bone.parent.children.indexOf(bone);
    }

}
