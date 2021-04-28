import Animation from './Animation';
import Keyframe from './Keyframe'
import Project from './Project'
import BoneTransform from './BoneTransform'

/**
 * Used for undoing create or delete animations
 */
export default class AnimationRestoreInfo {

    id: number;
    name: string;
    timeline: Array<Keyframe>;
    fps: number;
    loop: boolean;

    index: number;

    constructor(animation: Animation, project: Project) {
        this.id = animation.id;
        this.name = animation.name;
        this.timeline = animation.timeline.map(keyframe => {
            const clone = new Keyframe(keyframe.frameIndex);
            clone.transform = BoneTransform.cloneMap(keyframe.transform);
            return clone;
        });
        this.fps = animation.fps;
        this.loop = animation.loop;

        this.index = project.state.animations.indexOf(animation);
    }

}
