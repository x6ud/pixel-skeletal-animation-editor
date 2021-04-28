import Vue from 'vue'

import PopupWindow from '../components/PopupWindow.vue'
import PopupWindowClass from '../components/PopupWindow'
import InputNumber from '../components/InputNumber.vue'

interface CreateNewProjectWindowProperties {
    name: string,
    width: number;
    height: number;
}

export default class CreateNewProjectWindow extends Vue.extend({
    components: {PopupWindow, InputNumber},
    data() {
        return {
            name: '' as string,
            width: 0 as number,
            height: 0 as number,
            callback: undefined as undefined | ((arg?: CreateNewProjectWindowProperties) => void)
        };
    },
    methods: {
        show(): Promise<CreateNewProjectWindowProperties | undefined> {
            this.name = 'Untitled';
            this.width = 64;
            this.height = 64;
            (this.$refs.window as PopupWindowClass).show();
            return new Promise((resolve) => {
                this.callback = resolve;
            });
        },
        onOk() {
            (this.$refs.window as PopupWindowClass).close();
            this.callback && this.callback({
                name: this.name,
                width: this.width,
                height: this.height
            });
        },
        onClose() {
            this.callback && this.callback();
        }
    }
}) {
}
