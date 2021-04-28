import Vue from 'vue'

import Layer from '../../project/Layer'
import LayerFolder from '../../project/LayerFolder'

import SelectLayerClass from './SelectLayer'

export default class SelectLayerTreeNode extends Vue.extend({
    name: 'select-layer-tree-node',
    props: {
        layer: Object as Vue.PropType<Layer | LayerFolder>,
        deep: Number,
        selected: Object as Vue.PropType<Layer | LayerFolder>,
        root: Object as Vue.PropType<SelectLayerClass>
    },
    methods: {
        select() {
            this.root.select(this.layer);
        }
    }
}) {
}
