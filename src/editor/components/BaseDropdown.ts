import Vue from 'vue'

export default class BaseDropdown extends Vue.extend({
    props: {
        readonly: Boolean
    },
    data() {
        return {
            displayDrop: false,
            dropStyle: {} as { [key: string]: any }
        };
    },
    beforeDestroy() {
        this.hideDropdown();
    },
    methods: {
        showDropdown() {
            if (this.readonly) {
                return;
            }
            if (this.displayDrop) {
                this.displayDrop = false;
                return;
            }
            this.displayDrop = true;
            this.dropStyle = {
                left: 0,
                top: 0
            };
            this.$nextTick(() => {
                document.body.addEventListener('mousedown', this.hideDropdown);

                const trigger = this.$refs.trigger as HTMLElement;
                const drop = this.$refs.drop as HTMLElement;
                drop.focus();

                const triggerRect = trigger.getBoundingClientRect();
                const dropRect = drop.getBoundingClientRect();
                const windowRect = document.body.getBoundingClientRect();

                const style = {} as { [key: string]: any };

                if (triggerRect.left + dropRect.width <= windowRect.right) {
                    style.left = triggerRect.left + 'px';
                    style['max-width'] = Math.round(windowRect.width - triggerRect.left) + 'px';
                } else if (triggerRect.right - dropRect.width >= 0) {
                    style.left = Math.round(triggerRect.right - dropRect.width) + 'px';
                    style['max-width'] = triggerRect.right + 'px';

                } else if (windowRect.width - triggerRect.left >= triggerRect.right) {
                    style.left = triggerRect.left + 'px';
                    style['max-width'] = Math.round(windowRect.width - triggerRect.left) + 'px';
                } else {
                    style.right = Math.round(windowRect.width - triggerRect.right) + 'px';
                    style['max-width'] = triggerRect.right + 'px';
                }

                if (triggerRect.bottom + dropRect.height <= windowRect.bottom) {
                    style.top = triggerRect.bottom + 'px';
                    style['max-height'] = Math.round(windowRect.height - triggerRect.bottom) + 'px';
                } else if (triggerRect.top - dropRect.height >= 0) {
                    style.top = Math.round(triggerRect.top - dropRect.height) + 'px';
                    style['max-height'] = triggerRect.top + 'px';
                } else if (windowRect.height - triggerRect.bottom >= triggerRect.top) {
                    style.top = triggerRect.bottom + 'px';
                    style['max-height'] = Math.round(windowRect.height - triggerRect.bottom) + 'px';
                } else {
                    style.bottom = Math.round(windowRect.height - triggerRect.top) + 'px';
                    style['max-height'] = triggerRect.top + 'px';
                }

                this.dropStyle = style;
            });
        },
        hideDropdown() {
            document.body.removeEventListener('mousedown', this.hideDropdown);
            this.displayDrop = false;
        }
    }
}) {
}
