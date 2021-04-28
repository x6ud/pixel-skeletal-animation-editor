import Keyframe from './Keyframe'

export default class Animation {

    id: number;
    name: string;
    timeline: Array<Keyframe> = [];
    fps: number = 24;
    loop: boolean = true;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

}
