import Vue from 'vue'

export default class NumberRange extends Vue.extend({
    props: {
        value: Number,
        min: Number,
        max: Number,
        step: {
            type: Number,
            default: 1
        }
    },
    methods: {
        onInput(e: Event) {
            const target = e.target as HTMLInputElement;
            this.$emit('input', Number(target.value));
        }
    }
}) {
}
