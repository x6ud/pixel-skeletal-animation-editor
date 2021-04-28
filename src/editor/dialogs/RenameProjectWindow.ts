import Vue from 'vue'

import PopupWindow from '../components/PopupWindow.vue'
import PopupWindowClass from '../components/PopupWindow'

interface RenameProjectWindowProperties {
    name: string
}

export default class CreateNewProjectWindow extends Vue.extend({
    components: {PopupWindow},
    data() {
        return {
            name: '' as string,
            callback: undefined as undefined | ((arg?: RenameProjectWindowProperties) => void)
        };
    },
    methods: {
        show(name?: string): Promise<RenameProjectWindowProperties | undefined> {
            this.name = name || 'Untitled';
            (this.$refs.window as PopupWindowClass).show();
            return new Promise((resolve) => {
                this.callback = resolve;
            });
        },
        onOk() {
            (this.$refs.window as PopupWindowClass).close();
            this.callback && this.callback({
                name: this.name
            });
        },
        onClose() {
            this.callback && this.callback();
        }
    }
}) {
}
