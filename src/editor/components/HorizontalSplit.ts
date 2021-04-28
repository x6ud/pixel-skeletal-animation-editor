import Vue from 'vue'

import addGlobalDragListener from '../../utils/add-global-drag-listener'

export default class HorizontalSplit extends Vue.extend({
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
            xStart: 0
        };
    },
    methods: {
        onMouseDown(e: MouseEvent) {
            if (this.fixed) {
                return;
            }
            this.sizeStart = this.size;
            this.xStart = e.clientX;

            addGlobalDragListener(
                e,
                (e: MouseEvent) => {
                    let detX = e.clientX - this.xStart;
                    if (this.reverse) {
                        detX *= -1;
                    }
                    const size = Math.min(this.maxSize || 0, Math.max(this.minSize || 0, this.sizeStart - detX));
                    this.$emit('update:size', size);
                });
        }
    }
}) {
}
