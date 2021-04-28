import Vue from 'vue'

import BaseDropdown from '../../components/BaseDropdown.vue'
import BaseDropdownClass from '../../components/BaseDropdown'
import SelectLayerTreeNode from './SelectLayerTreeNode.vue'

import Layer from '../../project/Layer'
import LayerFolder from '../../project/LayerFolder'

export default class SelectLayer extends Vue.extend({
    components: {
        BaseDropdown,
        SelectLayerTreeNode
    },
    props: {
        value: Number,
        layers: Array as Vue.PropType<Array<Layer | LayerFolder>>,
        layerIdMap: Object as Vue.PropType<{ [id: number]: Layer | LayerFolder }>,
        readonly: Boolean
    },
    computed: {
        layer(): Layer | LayerFolder | undefined {
            if (!this.layerIdMap || this.value == null) {
                return undefined;
            }
            return this.layerIdMap[this.value];
        },
        empty(): boolean {
            return !this.layer;
        },
        text(): string {
            return this.layer && this.layer.name || 'empty';
        }
    },
    methods: {
        getSelf() {
            return this;
        },
        select(layer: Layer | LayerFolder) {
            (this.$refs.dropdown as BaseDropdownClass).hideDropdown();
            this.$emit('input', layer.id);
        }
    }
}) {
}
