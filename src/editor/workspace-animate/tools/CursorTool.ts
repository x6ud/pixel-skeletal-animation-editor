import Tool from './Tool'
import WorkspaceAnimate from '../WorkspaceAnimate'
import icon from '../../../assets/editor/animate/tools/cursor.png'

import Vec2 from '../../../utils/Vec2'
import isPointInTriangle from '../../../utils/is-point-in-triangle'
import Bone from '../../project/Bone'

export default class CursorTool implements Tool {

    id = 'cursor';
    name = 'Select Bone';
    icon = icon;
    cursor = '';

    onMouseDown(workspace: WorkspaceAnimate, x: number, y: number): void {
        if (!workspace.displayBones) {
            return;
        }
        const mouse = CursorTool.toScreenCoord(workspace, x, y);
        const clickedBone = CursorTool.findClickedBone(workspace, workspace.project.state.bones, mouse);
        workspace.selectBone(clickedBone || workspace.project.state.bones);
    }

    onMouseMove(workspace: WorkspaceAnimate, x: number, y: number): void {
    }

    onMouseUp(workspace: WorkspaceAnimate): void {
    }

    static toScreenCoord(workspace: WorkspaceAnimate, x: number, y: number) {
        const RULER_SIZE = workspace.RULER_SIZE;
        const canvasWidth = workspace.canvasWidth;
        const canvasHeight = workspace.canvasHeight;
        const contentWidth = canvasWidth - RULER_SIZE;
        const contentHeight = canvasHeight - RULER_SIZE;
        const zoom = workspace.zoom;
        const cameraX = workspace.cameraX;
        const cameraY = workspace.cameraY;
        const mx = (x - cameraX) * zoom + contentWidth / 2;
        const my = (-y + cameraY) * zoom + contentHeight / 2;
        return new Vec2(mx, my);
    }

    static isMouseIn(workspace: WorkspaceAnimate, bone: Bone, mouse: Vec2) {
        if (!bone.position || !bone.visible || !bone.boneVisible) {
            return false;
        }
        const animation = workspace.currentAnimation;
        if (!animation) {
            return false;
        }
        const vec = workspace.project.getFrameBoneWorldVec(animation, workspace.timelineCurrent, bone);
        const v0 = CursorTool.toScreenCoord(workspace, vec[0].x, vec[0].y);
        const v1 = CursorTool.toScreenCoord(workspace, vec[1].x, vec[1].y);
        const radius = workspace.BONE_DISPLAY_RADIUS;
        if (v0.sub(mouse).sqLen() <= radius ** 2) {
            return true;
        }
        const tan = v1.sub(v0).scalarCross(-1).norm().mul(radius);
        const ta = v0.add(tan);
        const tb = v0.add(tan.negate());
        return isPointInTriangle(ta, tb, v1, mouse);
    }

    static findClickedBone(workspace: WorkspaceAnimate, bone: Bone, mouse: Vec2): Bone | undefined {
        if (!bone.visible) {
            return undefined;
        }
        for (let i = 0; i < bone.children.length; ++i) {
            const child = bone.children[i];
            const ret = CursorTool.findClickedBone(workspace, child, mouse);
            if (ret) {
                return ret;
            }
        }
        return CursorTool.isMouseIn(workspace, bone, mouse) ? bone : undefined;
    }

}
