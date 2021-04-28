import Vue from 'vue'

import addGlobalDragListener from '../../utils/add-global-drag-listener'

export default class VerticalSplit extends Vue.extend({
    props: {
        fixed: Boolean,
        size: {type: Number, required: false},
        maxSize: {type: Number, required: false},
        minSize: {type: Number, required: false},
        reverse: Boolean
    },
    data() {
        return {
            sizeStart: 0,
            yStart: 0
        };
    },
    methods: {
        onMouseDown(e: MouseEvent) {
            if (this.fixed) {
                return;
            }
            this.sizeStart = this.size;
            this.yStart = e.clientY;

            addGlobalDragListener(
                e,
                (e: MouseEvent) => {
                    let detY = e.clientY - this.yStart;
                    if (this.reverse) {
                        detY *= -1;
                    }
                    const size = Math.min(this.maxSize || 0, Math.max(this.minSize || 0, this.sizeStart + detY));
                    this.$emit('update:size', size);
                });
        }
    }
}) {
}
