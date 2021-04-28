import Vue from 'vue'

export default class InputNumber extends Vue.extend({
    props: {
        value: Number,
        min: Number,
        max: Number
    },
    methods: {
        onBlur(e: Event) {
            const target = e.target as HTMLInputElement;
            target.value = this.onInput(e) + '';
        },
        onInput(e: Event) {
            const target = e.target as HTMLInputElement;
            let value = Number(target.value) || 0;
            if (this.min != null) {
                value = Math.max(this.min, value);
            }
            if (this.max != null) {
                value = Math.min(this.max, value);
            }
            this.$emit('input', value);
            return value;
        }
    }
}) {
}
