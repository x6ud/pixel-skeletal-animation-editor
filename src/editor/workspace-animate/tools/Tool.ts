import WorkspaceAnimate from '../WorkspaceAnimate'

export default interface Tool {

    /**
     * Unique ID for each tool type.
     */
    id: string;
    /**
     * Tool's display name.
     */
    name: string;
    /**
     * Icon image url.
     */
    icon: string;
    /**
     * Cursor css on canvas.
     */
    cursor: string;

    onMouseDown(workspace: WorkspaceAnimate, x: number, y: number): void;

    onMouseMove(workspace: WorkspaceAnimate, x: number, y: number): void;

    onMouseUp(workspace: WorkspaceAnimate): void;

}
