import Vue from 'vue'

import addGlobalDragListener from '../../utils/add-global-drag-listener'

export default class PopupWindow extends Vue.extend({
    props: {
        modal: Boolean,
        title: String,
        width: String,
        height: String,
        closable: Boolean
    },
    data() {
        return {
            x: 0,
            y: 0,
            visible: false
        };
    },
    computed: {
        windowStyle() {
            const style = {} as { [style: string]: any };
            style.left = Math.round(this.x) + 'px';
            style.top = Math.round(this.y) + 'px';
            if (this.width) {
                style.width = this.width;
            }
            if (this.height) {
                style.height = this.height;
            }
            return style;
        }
    },
    methods: {
        show() {
            this.x = 0;
            this.y = 0;
            this.visible = true;

            this.$nextTick(() => {
                const documentRect = document.body.getBoundingClientRect();
                const dom = this.$refs.window as HTMLElement;
                const rect = dom.getBoundingClientRect();

                this.x = (documentRect.width - rect.width) / 2;
                this.y = (documentRect.height - rect.height) / 2;
            });
        },
        close() {
            this.visible = false;
        },
        onBtnCloseClick() {
            this.close();
            this.$emit('close');
        },
        onWindowTitleMouseDown(e: MouseEvent) {
            const xStart = e.clientX;
            const yStart = e.clientY;
            const x0 = this.x;
            const y0 = this.y;
            addGlobalDragListener(
                e,
                (e: MouseEvent) => {
                    const dx = e.clientX - xStart;
                    const dy = e.clientY - yStart;
                    const documentRect = document.body.getBoundingClientRect();
                    const dom = this.$refs.window as HTMLElement;
                    const rect = dom.getBoundingClientRect();
                    this.x = Math.max(0, Math.min(documentRect.width - rect.width, x0 + dx));
                    this.y = Math.max(0, Math.min(documentRect.height - rect.height, y0 + dy));
                }
            );
        }
    }
}) {
}
