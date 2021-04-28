import Tool from './Tool'
import WorkspaceSkeleton from '../WorkspaceSkeleton'
import icon from '../../../assets/editor/skeleton/tools/bone.png'

import Vec2 from '../../../utils/Vec2'

export default class BoneTool implements Tool {

    id = 'bone';
    name = 'Draw Bone';
    icon = icon;
    cursor = 'crosshair';

    private v0: Vec2 = new Vec2();

    onMouseDown(workspace: WorkspaceSkeleton, x: number, y: number): void {
        const bone = workspace.currentBone;
        if (bone && bone.id <= 0) {
            workspace.newChildBone(bone);
        }

        if (workspace.snapToPixel) {
            x = Math.floor(x) + .5;
            y = Math.floor(y) + .5;
        }
        this.v0.set(x, y);
    }

    onMouseMove(workspace: WorkspaceSkeleton, x: number, y: number): void {
        if (workspace.snapToPixel) {
            x = Math.floor(x) + .5;
            y = Math.floor(y) + .5;
        }
        const bone = workspace.currentBone;
        if (bone && bone.id >= 0) {
            const v1 = new Vec2(x, y);
            const vec = v1.sub(this.v0);
            const rotation = vec.angle();
            const length = vec.len();
            workspace.setBoneVector(bone, this.v0, rotation, length);
        }
    }

    onMouseUp(workspace: WorkspaceSkeleton): void {
        const bone = workspace.currentBone;
        if (bone) {
            workspace.confirmSetBoneVector(bone);
        }
    }

}
