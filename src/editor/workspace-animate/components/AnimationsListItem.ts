import Vue from 'vue'

import Animation from '../../project/Animation'

export default class AnimationsListItem extends Vue.extend({
    props: {
        animation: Object as Vue.PropType<Animation>,
        selected: Object as Vue.PropType<Animation>
    },
    data() {
        return {
            showInput: false,
            inputValue: '',
            showDragIndicator1: false,
            showDragIndicator2: false
        };
    },
    methods: {
        select() {
            this.$emit('select', this.animation);
        },
        onNameDbClick() {
            this.inputValue = this.animation.name;
            this.showInput = true;
            this.$nextTick(() => {
                const dom = <HTMLInputElement>this.$refs.input;
                dom.focus();
                dom.select();
            });
        },
        onInputLostFocus() {
            this.showInput = false;
            if (this.inputValue) {
                this.$emit('setName', this.animation, this.inputValue);
            }
        },
        onInputKeyDown(e: KeyboardEvent) {
            if (e.key === 'Enter') {
                this.onInputLostFocus();
            }
        },
        onDragStart() {
            this.$emit('dragStart', this);
        },
        onMouseOver(e: MouseEvent) {
            this.$emit('mouseOver', this, e);
        },
        onMouseMove(e: MouseEvent) {
            this.$emit('mouseMove', this, e);
        }
    }
}) {
}
