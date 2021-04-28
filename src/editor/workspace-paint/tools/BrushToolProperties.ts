import Vue from 'vue'
import BrushTool from './BrushTool'

export default class BrushToolProperties extends Vue.extend({
    props: {
        tool: Object as Vue.PropType<BrushTool>
    },
    methods: {
        setSize(size: number) {
            this.$emit('set-properties', {size});
        },
        setShape(shape: number) {
            this.$emit('set-properties', {shape});
        }
    }
}) {
}
