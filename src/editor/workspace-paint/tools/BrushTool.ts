import WorkspacePaint from '../WorkspacePaint'
import Tool from './Tool'
import BrushToolProperties from './BrushToolProperties.vue'
import cursor from '../../../assets/editor/paint/cursor/brush.png'
import {BrushShapeType} from '../brush/BrushShapeType'
import getBrushIndicatorTexture from '../brush/get-brush-indicator-texture'

export default class BrushTool implements Tool {

    size: number = 0;
    shape: BrushShapeType = BrushShapeType.RECT;

    id: string = '';
    name: string = '';
    icon: string = '';
    cursor = `url("${cursor}") 11 11, auto`;
    canBeUsedOnFolder = false;
    cancelable = true;
    propertiesComponent = BrushToolProperties;

    onMouseDown(paint: WorkspacePaint, button: number, x: number, y: number): void {
    }

    onMouseMove(paint: WorkspacePaint, x: number, y: number): void {
    }

    onMouseUp(paint: WorkspacePaint, button: number): void {
    }

    cancel(paint: WorkspacePaint): void {
    }

    getIndicatorTexture(): WebGLTexture {
        return getBrushIndicatorTexture(this.size, this.shape);
    }

}
