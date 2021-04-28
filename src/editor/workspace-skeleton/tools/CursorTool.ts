import Tool from './Tool'
import WorkspaceSkeleton from '../WorkspaceSkeleton'
import icon from '../../../assets/editor/skeleton/tools/cursor.png'

import Vec2 from '../../../utils/Vec2'
import isPointInTriangle from '../../../utils/is-point-in-triangle'
import Bone from '../../project/Bone'

export default class CursorTool implements Tool {

    id = 'cursor';
    name = 'Select Bone';
    icon = icon;
    cursor = '';

    private draggingBone: Bone | undefined = undefined;
    private draggingV1: boolean = false;

    onMouseDown(workspace: WorkspaceSkeleton, x: number, y: number): void {
        if (!workspace.displayBones) {
            return;
        }

        const mouse = CursorTool.toScreenCoord(workspace, x, y);

        this.draggingBone = undefined;
        do {
            const bone = workspace.currentBone;
            if (!bone || bone.id <= 0) {
                break;
            }
            const v0 = bone.position;
            if (!v0) {
                break;
            }
            const v1 = v0.add(new Vec2(bone.length, 0).rotate(0, 0, bone.rotation));
            const v0s = CursorTool.toScreenCoord(workspace, v0.x, v0.y);
            const v1s = CursorTool.toScreenCoord(workspace, v1.x, v1.y);

            if (mouse.sub(v1s).len() <= workspace.BONE_ENDPOINT_1_INDICATOR_DISPLAY_RADIUS) {
                this.draggingBone = bone;
                this.draggingV1 = true;
            } else if (mouse.sub(v0s).len() <= workspace.BONE_ENDPOINT_0_INDICATOR_DISPLAY_RADIUS) {
                this.draggingBone = bone;
                this.draggingV1 = false;
            }
        } while (false) ;

        if (!this.draggingBone) {
            const clickedBone = CursorTool.findClickedBone(workspace, workspace.project.state.bones, mouse);
            workspace.selectBone(clickedBone || workspace.project.state.bones);
        }
    }

    onMouseMove(workspace: WorkspaceSkeleton, x: number, y: number): void {
        if (this.draggingBone) {
            if (workspace.snapToPixel) {
                x = Math.floor(x) + .5;
                y = Math.floor(y) + .5;
            }

            const bone = this.draggingBone;
            let v0 = bone.position;
            if (v0) {
                if (this.draggingV1) {
                    const v0 = bone.position;
                    if (v0) {
                        const v1 = new Vec2(x, y);
                        const vec = v1.sub(v0);
                        const rotation = vec.angle();
                        const length = vec.len();
                        workspace.setBoneVector(bone, v0, rotation, length);
                    }
                } else {
                    const v1 = v0.add(new Vec2(bone.length, 0).rotate(0, 0, bone.rotation));
                    v0 = new Vec2(x, y);
                    const vec = v1.sub(v0);
                    const rotation = vec.angle();
                    const length = vec.len();
                    workspace.setBoneVector(bone, v0, rotation, length);
                }
            }
        }
    }

    onMouseUp(workspace: WorkspaceSkeleton): void {
        if (this.draggingBone) {
            workspace.confirmSetBoneVector(this.draggingBone);
        }
    }

    private static toScreenCoord(workspace: WorkspaceSkeleton, x: number, y: number) {
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

    private static isMouseIn(workspace: WorkspaceSkeleton, bone: Bone, mouse: Vec2) {
        if (!bone.position || !bone.visible || !bone.boneVisible) {
            return false;
        }
        const v0o = bone.position;
        const v1o = bone.position.add(new Vec2(1, 0).rotate(0, 0, bone.rotation).mul(bone.length));
        const v0 = CursorTool.toScreenCoord(workspace, v0o.x, v0o.y);
        const v1 = CursorTool.toScreenCoord(workspace, v1o.x, v1o.y);
        const radius = workspace.BONE_DISPLAY_RADIUS;
        if (v0.sub(mouse).sqLen() <= radius ** 2) {
            return true;
        }
        const tan = v1.sub(v0).scalarCross(-1).norm().mul(radius);
        const ta = v0.add(tan);
        const tb = v0.add(tan.negate());
        return isPointInTriangle(ta, tb, v1, mouse);
    }

    private static findClickedBone(workspace: WorkspaceSkeleton, bone: Bone, mouse: Vec2): Bone | undefined {
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
