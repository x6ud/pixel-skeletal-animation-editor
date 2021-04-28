import Animation from './Animation'
import Keyframe from './Keyframe'

export default class AnimationJSON {
    id: number;
    name: string;
    timeline: Array<Keyframe>;
    fps: number;
    loop: boolean;

    constructor(animation: Animation, boneIds: number[]) {
        this.id = animation.id;
        this.name = animation.name;
        this.fps = animation.fps;
        this.loop = animation.loop;
        this.timeline = animation.timeline.map(keyframe => {
            const ret = new Keyframe(keyframe.frameIndex);
            ret.transform = {};
            boneIds.forEach(id => {
                ret.transform[id] = keyframe.transform[id];
            });
            return ret;
        });
    }
}
