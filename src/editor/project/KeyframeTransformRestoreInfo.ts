import BoneTransform from './BoneTransform'

export default class KeyframeTransformRestoreInfo {

    isNew: boolean = false;
    animationId: number = -1;
    frameIndex: number = -1;
    boneId: number = -1;
    transform: BoneTransform = new BoneTransform();

}
