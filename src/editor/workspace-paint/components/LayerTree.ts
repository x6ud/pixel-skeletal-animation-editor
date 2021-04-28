import Vue from 'vue'

import LayerNode from './LayerNode.vue'
import LayerNodeClass from './LayerNode'

import Layer from '../../project/Layer'
import LayerFolder from '../../project/LayerFolder'

const DROP_POSITION = {
    AFTER: 1,
    BEFORE: 2
};

export default class LayerTree extends Vue.extend({
    name: 'layer-tree',
    beforeCreate() {
        this.$options.components && (this.$options.components.LayerNode = LayerNode);
    },
    props: {
        layers: Array as Vue.PropType<Array<Layer | LayerFolder>>,
        deep: {type: Number, default: 0},
        root: Object as Vue.PropType<LayerTree>,
        selected: Object
    },
    data() {
        return {
            dragging: null as LayerNodeClass | null,
            overNode: null as LayerNodeClass | null,
            dropPosition: null as number | null
        }
    },
    beforeDestroy() {
        this.onDragEnd();
    },
    methods: {
        getSelf() {
            return this;
        },
        onDragStart(node: LayerNodeClass) {
            this.dragging = node;
            document.body.addEventListener('mouseup', this.onDragEnd);
        },
        onDragEnd() {
            document.body.removeEventListener('mouseup', this.onDragEnd);
            if (this.dragging && this.overNode && this.overNode !== this.dragging && this.dropPosition) {
                this.$emit(
                    'moveLayer',
                    this.dragging.layer,
                    this.dropPosition === DROP_POSITION.AFTER ? 'after' : 'before',
                    this.overNode.layer
                );
            }
            this.updateDraggingIndicator(null);
            this.dragging = null;
            this.overNode = null;
        },
        onLayerNodeMouseOver(node: LayerNodeClass, e: MouseEvent) {
            if (this.dragging) {
                if (this.checkAbleToDrop(node)) {
                    this.updateDraggingIndicator(node, e);
                    this.overNode = node;
                } else {
                    this.updateDraggingIndicator(null);
                    this.overNode = null;
                }
            }
        },
        onLayerNodeMouseMove(node: LayerNodeClass, e: MouseEvent) {
            if (this.dragging && this.dragging !== this.selected) {
                this.dragging.selectLayer();
            }
            if (this.overNode === node) {
                this.updateDraggingIndicator(node, e);
            }
        },
        updateDraggingIndicator(node: LayerNodeClass | null, e?: MouseEvent) {
            if (this.overNode) {
                this.overNode.showDragIndicator1 = false;
                this.overNode.showDragIndicator2 = false;
                this.overNode.showDropFolderIndicator = false;
            }
            if (node && e) {
                const rect = (<HTMLElement>node.$refs.layer).getBoundingClientRect();
                const mouseY = e.clientY;
                const middle = rect.height / 2 + rect.top;
                if (mouseY > middle) {
                    this.dropPosition = DROP_POSITION.AFTER;
                    node.showDragIndicator1 = false;
                    node.showDragIndicator2 = true;
                    node.showDropFolderIndicator = node.layer instanceof LayerFolder;
                } else {
                    this.dropPosition = DROP_POSITION.BEFORE;
                    node.showDragIndicator1 = true;
                    node.showDragIndicator2 = false;
                    node.showDropFolderIndicator = false;
                }
            } else {
                this.dropPosition = null;
            }
        },
        checkAbleToDrop(node: LayerNodeClass) {
            if (node === this.dragging) {
                return false;
            }
            if ((this.dragging && this.dragging.layer) instanceof LayerFolder) {
                for (let curr: Vue = node; curr; curr = <Vue>curr.$parent) {
                    const name = curr.$options.name;
                    if (name === 'layer-node') {
                        const comp = <LayerNodeClass>curr;
                        if (comp.layer === (this.dragging && this.dragging.layer)) {
                            return false;
                        }
                    } else if (name === 'layer-tree') {
                        // do nothing
                    } else {
                        break;
                    }
                }
            }
            return true;
        }
    }
}) {
}
