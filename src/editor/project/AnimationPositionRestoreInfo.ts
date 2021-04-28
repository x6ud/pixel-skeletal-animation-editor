/**
 * Used for undoing move animations
 */
export default class AnimationPositionRestoreInfo {

    id: number;
    index: number;

    constructor(id: number, index: number) {
        this.id = id;
        this.index = index;
    }

}
