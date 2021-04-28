import BoneTransform from './BoneTransform'

export default class Keyframe {

    frameIndex: number;
    transform: { [id: number]: BoneTransform } = {};

    constructor(frameIndex: number) {
        this.frameIndex = frameIndex;
    }

}
