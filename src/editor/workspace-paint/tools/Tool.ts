import Vue from 'vue'
import Class from '../../../utils/Class'
import WorkspacePaint from '../WorkspacePaint'

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
    /**
     * Whether tool can be used on layer folder.
     */
    canBeUsedOnFolder: boolean;
    /**
     * Whether editing can be undone by clicking another mouse button.
     */
    cancelable: boolean;
    /**
     * Tool properties vue component.
     */
    propertiesComponent?: Class<Vue>;

    /**
     * Mouse down on canvas. Start drawing.
     */
    onMouseDown(paint: WorkspacePaint, button: number, x: number, y: number): void;

    /**
     * Mouse move on canvas.
     */
    onMouseMove(paint: WorkspacePaint, x: number, y: number): void;

    /**
     * Mouse up. Apply editing result.
     */
    onMouseUp(paint: WorkspacePaint, button: number): void;

    /**
     * Mouse down with a different button. Undo last editing result.
     */
    cancel(paint: WorkspacePaint): void;

}
