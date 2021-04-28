import Vue from 'vue'
import Pen from './Pen'

export default class BrushToolProperties extends Vue.extend({
    props: {
        tool: Object as Vue.PropType<Pen>
    },
    methods: {
        setMode(e: Event) {
            this.$emit('set-properties', {mode: Number((e.target as HTMLInputElement).value)});
        },
        setSize(size: number) {
            this.$emit('set-properties', {size});
        },
        setShape(shape: number) {
            this.$emit('set-properties', {shape});
        }
    }
}) {
}
