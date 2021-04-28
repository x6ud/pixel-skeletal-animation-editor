export default class BoneTransform {
    translateX: number = 0;
    translateY: number = 0;
    rotate: number = 0;

    static cloneMap(transform: { [id: number]: BoneTransform }) {
        const ret: { [id: number]: BoneTransform } = {};
        Object.keys(transform).forEach(id => {
            const src = transform[Number(id)];
            const clone = new BoneTransform();
            clone.translateX = src.translateX;
            clone.translateY = src.translateY;
            clone.rotate = src.rotate;
            ret[Number(id)] = clone;
        });
        return ret;
    }

}
