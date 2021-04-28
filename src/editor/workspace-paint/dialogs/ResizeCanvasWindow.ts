import Vue from 'vue'

import PopupWindow from '../../components/PopupWindow.vue'
import PopupWindowClass from '../../components/PopupWindow'
import InputNumber from '../../components/InputNumber.vue'

import Project from '../../project/Project'

const project = Project.instance();

interface CanvasSizeWindowProperties {
    width: number;
    height: number;
    align: string;
}

export default class ResizeCanvasWindow extends Vue.extend({
    components: {PopupWindow, InputNumber},
    data() {
        return {
            width: 0 as number,
            height: 0 as number,
            align: 'center' as string,
            callback: undefined as undefined | ((arg?: CanvasSizeWindowProperties) => void)
        };
    },
    methods: {
        show(): Promise<CanvasSizeWindowProperties | undefined> {
            this.width = project.state.width;
            this.height = project.state.height;
            this.align = 'center';
            (this.$refs.window as PopupWindowClass).show();
            return new Promise((resolve) => {
                this.callback = resolve;
            });
        },
        onOk() {
            (this.$refs.window as PopupWindowClass).close();
            this.callback && this.callback({
                width: this.width,
                height: this.height,
                align: this.align
            });
        },
        onClose() {
            this.callback && this.callback();
        }
    }
}) {
}
