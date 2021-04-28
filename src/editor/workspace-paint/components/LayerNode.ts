import Vue from 'vue'

import LayerTree from './LayerTree.vue'
import LayerTreeClass from './LayerTree'

import Layer from '../../project/Layer'
import LayerFolder from '../../project/LayerFolder'

export default class extends Vue.extend({
    name: 'layer-node',
    beforeCreate() {
        this.$options.components && (this.$options.components.LayerTree = LayerTree);
    },
    props: {
        layer: Object as Vue.PropType<Layer | LayerFolder>,
        deep: Number,
        root: Object as Vue.PropType<LayerTreeClass>,
        selected: Object as Vue.PropType<Layer | LayerFolder>
    },
    filters: {
        percent(val: number) {
            return Math.round(val) + '%';
        }
    },
    data() {
        return {
            showInput: false,
            inputValue: '',
            showDragIndicator1: false,
            showDragIndicator2: false,
            showDropFolderIndicator: false
        };
    },
    methods: {
        onNameDbClick() {
            this.inputValue = this.layer.name;
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
                this.root.$emit('setName', this.layer, this.inputValue);
            }
        },
        onInputKeyDown(e: KeyboardEvent) {
            if (e.key === 'Enter') {
                this.onInputLostFocus();
            }
        },
        toggleVisibility() {
            this.root.$emit('setVisibility', this.layer, !this.layer.visible);
        },
        selectLayer() {
            this.root.$emit('select', this.layer);
        },
        onDragStart() {
            this.root.onDragStart(this);
        },
        onMouseOver(e: MouseEvent) {
            this.root.onLayerNodeMouseOver(this, e);
        },
        onMouseMove(e: MouseEvent) {
            this.root.onLayerNodeMouseMove(this, e);
        }
    }
}) {
}
