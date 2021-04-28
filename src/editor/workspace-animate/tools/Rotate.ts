import Tool from './Tool'
import WorkspaceAnimate from '../WorkspaceAnimate'
import icon from '../../../assets/editor/animate/tools/rotate.png'
import cursor from '../../../assets/editor/animate/cursor/rotate.png'

import Vec2 from '../../../utils/Vec2'
import BoneTransform from '../../project/BoneTransform'
import CursorTool from './CursorTool'

export default class Rotate implements Tool {

    id = 'rotate';
    name = 'Rotate';
    icon = icon;
    cursor = `url("${cursor}"), auto`;

    private lastX: number = 0;
    private lastY: number = 0;
    private transform: BoneTransform = new BoneTransform();
    private rotateCenter: Vec2 = new Vec2();

    onMouseDown(workspace: WorkspaceAnimate, x: number, y: number): void {
        if (workspace.displayBones) {
            const mouse = CursorTool.toScreenCoord(workspace, x, y);
            if (!(workspace.currentBone && CursorTool.isMouseIn(workspace, workspace.currentBone, mouse))) {
                const clickedBone = CursorTool.findClickedBone(workspace, workspace.project.state.bones, mouse);
                workspace.selectBone(clickedBone || workspace.project.state.bones);
            }
        }

        this.lastX = x;
        this.lastY = y;
        const project = workspace.project;
        const animation = workspace.currentAnimation;
        const bone = workspace.currentBone;
        if (!animation || !bone || !bone.position) {
            return;
        }
        const transform = project.getFrameBoneTransform(animation, workspace.timelineCurrent, bone);
        this.transform.translateX = transform.translateX;
        this.transform.translateY = transform.translateY;
        this.transform.rotate = transform.rotate;
        this.rotateCenter = project.getFrameBoneWorldVec(animation, workspace.timelineCurrent, bone)[0];
    }

    onMouseMove(workspace: WorkspaceAnimate, x: number, y: number): void {
        const animation = workspace.currentAnimation;
        const bone = workspace.currentBone;
        if (!animation || !bone || !bone.position || bone.id <= 0) {
            return;
        }
        const center = this.rotateCenter;
        const x0 = this.lastX - center.x;
        const y0 = this.lastY - center.y;
        const x1 = x - center.x;
        const y1 = y - center.y;
        const angle = Math.atan2(x0 * y1 - y0 * x1, x0 * x1 + y0 * y1);

        const transform = this.transform;
        const newRotate = (transform.rotate + angle) % (Math.PI * 2);
        workspace.setCurrentKeyframeTransform(
            transform.translateX,
            transform.translateY,
            newRotate
        );

        this.lastX = x;
        this.lastY = y;
        this.transform.rotate = newRotate;
    }

    onMouseUp(workspace: WorkspaceAnimate): void {
        workspace.confirmSetCurrentKeyframeTransform();
    }

}
