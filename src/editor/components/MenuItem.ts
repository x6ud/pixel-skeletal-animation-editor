import Vue from 'vue'

import PopupMenuClass from './PopupMenu'

export default class MenuItem extends Vue.extend({
    props: {
        name: String,
        disabled: Boolean,
        sep: Boolean,
        popup: Boolean
    },
    data() {
        return {
            mouseOver: false,
            subMenuDisplay: false
        };
    },
    computed: {
        hasChild(): boolean {
            const defaultSlot = (<any>this).$slots.default;
            return defaultSlot != null;
        }
    },
    methods: {
        getPopupMenu() {
            const defaultSlot = (<any>this).$slots.default;
            return defaultSlot && defaultSlot[0].child;
        },
        onMouseOver(e: MouseEvent) {
            if (this.disabled || this.sep) {
                return;
            }
            (<PopupMenuClass>this.$parent).onMenuItemMouseOver(this);
        },
        onClick(e: MouseEvent) {
            if (this.disabled || this.sep) {
                return;
            }
            (<PopupMenuClass>this.$parent).hideAll();
            this.$emit('click');
        }
    }
}) {
}
