import Vue from 'vue'
import Bucket from './Bucket'

export default class BucketProperties extends Vue.extend({
    props: {
        tool: Object as Vue.PropType<Bucket>
    },
    methods: {
        setContiguous(e: Event) {
            this.$emit('set-properties', {contiguous: (e.target as HTMLInputElement).checked});
        },
        setReferAllVisibleLayers(e: Event) {
            this.$emit('set-properties', {referAllVisibleLayers: (e.target as HTMLInputElement).checked});
        }
    }
}) {
}
