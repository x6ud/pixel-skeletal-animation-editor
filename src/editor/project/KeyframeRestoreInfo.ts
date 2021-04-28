import Keyframe from './Keyframe'
import BoneTransform from './BoneTransform'

/**
 * Used for undoing create or delete keyframes
 */
export default class KeyframeRestoreInfo {

    animationId: number;
    frameIndex: number;
    transform: { [id: number]: BoneTransform } = {};

    constructor(animationId: number, keyframe: Keyframe) {
        this.animationId = animationId;
        this.frameIndex = keyframe.frameIndex;
        this.transform = BoneTransform.cloneMap(keyframe.transform);
    }

}
