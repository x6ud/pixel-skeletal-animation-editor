import Vue from 'vue'

import PopupWindow from '../components/PopupWindow.vue'
import PopupWindowClass from '../components/PopupWindow'

import Color from '../../utils/Color'

class CanvasBackgroundColors {
    color1: Color;
    color2: Color;

    constructor(color1: Color, color2: Color) {
        this.color1 = color1;
        this.color2 = color2;
    }
}

interface CanvasBackgroundWindowProperties {
    color1: Color,
    color2: Color
}

export default class CanvasBackgroundWindow extends Vue.extend({
    components: {PopupWindow},
    data() {
        return {
            colors: [
                new CanvasBackgroundColors(
                    Color.rgb(0xff, 0xff, 0xff),
                    Color.rgb(0xcc, 0xcc, 0xcc)
                ),
                new CanvasBackgroundColors(
                    Color.rgb(0xff, 0xff, 0xff),
                    Color.rgb(0xf5, 0xf5, 0xf5)
                ),
                new CanvasBackgroundColors(
                    Color.rgb(0x33, 0x33, 0x33),
                    Color.rgb(0x29, 0x29, 0x29)
                )
            ],
            selection: 0,
            callback: undefined as undefined | ((arg?: CanvasBackgroundWindowProperties) => void)
        };
    },
    methods: {
        show(): Promise<CanvasBackgroundWindowProperties | undefined> {
            (this.$refs.window as PopupWindowClass).show();
            return new Promise((resolve) => {
                this.callback = resolve;
            });
        },
        onOk() {
            (this.$refs.window as PopupWindowClass).close();
            const colors = this.colors[this.selection];
            this.callback && this.callback({
                color1: colors.color1,
                color2: colors.color2
            });
        },
        onClose() {
            this.callback && this.callback();
        }
    }
}) {
}
