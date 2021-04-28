import Vue from 'vue'

import Color from '../../../utils/Color'

export default class ColorValues extends Vue.extend({
    data() {
        return {
            rgbMode: true
        };
    },
    props: {
        value: Object as Vue.PropType<Color>
    },
    computed: {
        ht() {
            return Math.round(this.value.h * 360);
        },
        st() {
            return Math.round(this.value.s * 100);
        },
        vt() {
            return Math.round(this.value.v * 100);
        }
    }
}) {
}
