import Vue from 'vue'
import addGlobalDragListener from '../../../utils/add-global-drag-listener'

export default class OpacityRange extends Vue.extend({
    props: {value: Number},
    computed: {
        handlerStyle(): { [style: string]: any } {
            return {
                left: this.percent + '%'
            };
        },
        coverStyle(): { [style: string]: any } {
            return {
                left: this.percent + '%'
            };
        },
        percent() {
            return Math.round(this.value || 0);
        }
    },
    methods: {
        onMouseDown(e: MouseEvent) {
            addGlobalDragListener(
                e,
                (e: MouseEvent) => {
                    const rect = (<HTMLElement>this.$refs.bar).getBoundingClientRect();
                    const width = rect.right - rect.left;
                    const x = Math.max(0, Math.min(width, e.clientX - rect.left));
                    this.$emit('input', Math.round(x / width * 100));
                }
            );
        },
        onKeyDown(e: KeyboardEvent) {
            let val = this.value;
            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowDown':
                case '-':
                    val -= 1;
                    break;
                case 'ArrowRight':
                case 'ArrowUp':
                case '=':
                    val += 1;
                    break;
            }
            val = Math.max(0, Math.min(100, val));
            this.$emit('input', val);
        }
    }
}) {
}
