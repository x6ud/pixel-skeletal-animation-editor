import Tool from './Tool'
import WorkspaceAnimate from '../WorkspaceAnimate'
import icon from '../../../assets/editor/animate/tools/move.png'
import cursor from '../../../assets/editor/animate/cursor/move.png'

import CursorTool from './CursorTool'
import Vec2 from '../../../utils/Vec2'
import {invertMat33, transformVec2} from '../../../utils/mat'

export default class Move implements Tool {

    id = 'move';
    name = 'Move';
    icon = icon;
    cursor = `url("${cursor}"), auto`;

    private det: Vec2 = new Vec2();

    onMouseDown(workspace: WorkspaceAnimate, x: number, y: number): void {
        if (workspace.displayBones) {
            const mouse = CursorTool.toScreenCoord(workspace, x, y);
            if (!(workspace.currentBone && CursorTool.isMouseIn(workspace, workspace.currentBone, mouse))) {
                const clickedBone = CursorTool.findClickedBone(workspace, workspace.project.state.bones, mouse);
                workspace.selectBone(clickedBone || workspace.project.state.bones);
            }
        }

        const project = workspace.project;
        const animation = workspace.currentAnimation;
        const bone = workspace.currentBone;
        const frameIndex = workspace.timelineCurrent;
        if (!animation || !bone || !bone.position || bone.id <= 0) {
            return;
        }
        if (workspace.snapToPixel) {
            x = Math.floor(x) + .5;
            y = Math.floor(y) + .5;
        }
        this.det = new Vec2(x, y).sub(project.getFrameBoneWorldVec(animation, frameIndex, bone)[0]);
    }

    onMouseMove(workspace: WorkspaceAnimate, x: number, y: number): void {
        if (workspace.snapToPixel) {
            x = Math.floor(x) + .5;
            y = Math.floor(y) + .5;
        }

        const project = workspace.project;
        const animation = workspace.currentAnimation;
        const bone = workspace.currentBone;
        const frameIndex = workspace.timelineCurrent;
        if (!animation || !bone || !bone.position || bone.id <= 0) {
            return;
        }
        const transformMap = project.getFrameBoneTransformMap(animation, frameIndex);
        const transform = project.getFrameBoneTransform(animation, frameIndex, bone, transformMap);

        const newWorldPosition = new Vec2(x, y).sub(this.det);

        const mat = project.getFrameBoneWorldTransformMat33(animation, frameIndex, bone.parent || bone, transformMap);
        const invMat = invertMat33(mat);
        const newLocalPosition = transformVec2(invMat, newWorldPosition);

        workspace.setCurrentKeyframeTransform(
            newLocalPosition.x - bone.position.x,
            newLocalPosition.y - bone.position.y,
            transform.rotate
        );
    }

    onMouseUp(workspace: WorkspaceAnimate): void {
        workspace.confirmSetCurrentKeyframeTransform();
    }

}
