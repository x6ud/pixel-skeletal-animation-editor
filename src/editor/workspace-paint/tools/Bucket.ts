import WorkspacePaint from '../WorkspacePaint'
import Tool from './Tool'
import BucketProperties from './BucketProperties.vue'
import icon from '../../../assets/editor/paint/tools/bucket.png'
import cursor from '../../../assets/editor/paint/cursor/bucket.png'
import Layer from '../../project/Layer'
import Project from '../../project/Project'
import {MouseButton} from '../../../utils/MouseButton'

export default class Bucket implements Tool {

    id = 'bucket';
    name = 'Fill';
    icon = icon;
    cursor = `url("${cursor}") 4 19, auto`;
    canBeUsedOnFolder = false;
    cancelable = true;
    propertiesComponent = BucketProperties;

    contiguous: boolean = true;
    referAllVisibleLayers: boolean = false;

    private layerData?: Uint8Array;

    onMouseDown(paint: WorkspacePaint, button: number, x: number, y: number): void {
        const width = paint.projectState.width;
        const height = paint.projectState.height;
        if (x < 0 || y < 0 || x >= width || y >= height) {
            return;
        }
        const project = paint.project;
        const layer = paint.currentLayer as Layer;
        const data = project.getLayerImageData(layer).slice();
        if (!paint.renderResult) {
            throw new Error('Failed to load render result');
        }
        const refer = this.referAllVisibleLayers ? paint.renderResult : project.getLayerImageData(layer);
        const color = button === MouseButton.LEFT ?
            [paint.currentColor.r, paint.currentColor.g, paint.currentColor.b, Math.round(paint.brushOpacity / 100 * 0xff)]
            : [0, 0, 0, 0];
        if (this.contiguous) {
            Bucket.floodFill(color, project, x, y, width, height, refer, data);
        } else {
            Bucket.replaceColor(color, project, x, y, width, height, refer, data);
        }
        this.layerData = data;
        paint.editingLayerTextureCache.setData(data, width);
        project.markLayerAsShouldReRender(layer);
    }

    onMouseMove(paint: WorkspacePaint, x: number, y: number): void {
    }

    onMouseUp(paint: WorkspacePaint, button: number): void {
        const layer = paint.currentLayer as Layer;
        if (this.layerData) {
            paint.applyLayerDataModification(layer, this.layerData);
        }
        this.layerData = undefined;
    }

    cancel(paint: WorkspacePaint): void {
        this.layerData = undefined;
    }

    private static replaceColor(
        color: ArrayLike<number>,
        project: Project,
        x: number,
        y: number,
        width: number,
        height: number,
        refer: Uint8Array,
        data: Uint8Array
    ) {
        const target = project.getPixel(refer, x, y);
        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {
                const pixel = project.getPixel(refer, x, y);
                if (pixel[0] === target[0]
                    && pixel[1] === target[1]
                    && pixel[2] === target[2]
                    && pixel[3] === target[3]) {
                    project.setPixel(data, x, y, color);
                }
            }
        }
    }

    private static floodFill(
        color: ArrayLike<number>,
        project: Project,
        x: number,
        y: number,
        width: number,
        height: number,
        refer: Uint8Array,
        data: Uint8Array
    ) {
        const target = project.getPixel(refer, x, y);
        const visited: { [index: number]: boolean } = {};
        const stack: Array<{ x: number, y: number }> = [];
        stack.push({x, y});

        for (; ;) {
            const arg = stack.pop();
            if (!arg) {
                break;
            }
            const x = arg.x;
            const y = arg.y;
            if (x < 0 || y < 0 || x >= width || y >= height) {
                continue;
            }
            const index = y * width + x;
            if (visited[index]) {
                continue;
            }
            visited[index] = true;
            const pixel = project.getPixel(refer, x, y);
            if (!(pixel[0] === target[0]
                && pixel[1] === target[1]
                && pixel[2] === target[2]
                && pixel[3] === target[3])) {
                continue;
            }
            project.setPixel(data, x, y, color);

            stack.push({x: x - 1, y});
            stack.push({x: x + 1, y});
            stack.push({x, y: y - 1});
            stack.push({x, y: y + 1});
        }
    }

}
