import Vue from 'vue'
import ColorPicker from './ColorPicker'

export default class BucketProperties extends Vue.extend({
    props: {
        tool: Object as Vue.PropType<ColorPicker>
    },
    methods: {
        setReferAllVisibleLayers(e: Event) {
            this.$emit('set-properties', {referAllVisibleLayers: (e.target as HTMLInputElement).checked});
        }
    }
}) {
}
