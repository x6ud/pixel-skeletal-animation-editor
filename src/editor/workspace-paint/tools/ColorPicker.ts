import WorkspacePaint from '../WorkspacePaint'
import Tool from './Tool'
import ColorPickerProperties from './ColorPickerProperties.vue'
import icon from '../../../assets/editor/paint/tools/picker.png'
import cursor from '../../../assets/editor/paint/cursor/picker.png'
import Layer from '../../project/Layer'
import Color from '../../../utils/Color'

export default class ColorPicker implements Tool {

    id = 'color-picker';
    name = 'Color Picker';
    icon = icon;
    cursor = `url("${cursor}") 2 22, auto`;
    canBeUsedOnFolder = false;
    cancelable = false;
    propertiesComponent = ColorPickerProperties;

    referAllVisibleLayers: boolean = true;

    onMouseDown(paint: WorkspacePaint, button: number, x: number, y: number): void {
    }

    onMouseMove(paint: WorkspacePaint, x: number, y: number): void {
        const project = paint.project;
        const width = project.state.width;
        const height = project.state.height;
        if (x < 0 || y < 0 || x >= width || y >= height) {
            paint.brushOpacity = 0;
            return;
        }
        if (!paint.renderResult) {
            throw new Error('Failed to load render result');
        }
        let r: number = 0;
        let g: number = 0;
        let b: number = 0;
        let a: number = 0;
        if (this.referAllVisibleLayers) {
            const color = project.getPixel(paint.renderResult, x, y);
            a = Math.round(color[3] / 0xff * 100);
            const rec = 0xff / color[3];
            r = Math.max(0, Math.min(0xff, Math.round(color[0] * rec)));
            g = Math.max(0, Math.min(0xff, Math.round(color[1] * rec)));
            b = Math.max(0, Math.min(0xff, Math.round(color[2] * rec)));
        } else {
            const color = project.getPixel(project.getLayerImageData(paint.currentLayer as Layer), x, y);
            r = color[0];
            g = color[1];
            b = color[2];
            a = Math.round(color[3] / 0xff * 100);
        }
        if (a > 0) {
            paint.setCurrentColor(Color.rgb(r, g, b));
        }
        paint.brushOpacity = a;
    }

    onMouseUp(paint: WorkspacePaint, button: number): void {
    }

    cancel(paint: WorkspacePaint): void {
    }

}
