import Vue from 'vue'

import BoneNode from './BoneNode.vue'
import BoneNodeClass from './BoneNode'

import Bone from '../../project/Bone'
import Layer from '../../project/Layer'
import LayerFolder from '../../project/LayerFolder'

export default class BoneTree extends Vue.extend({
    components: {
        BoneNode
    },
    props: {
        bones: Object as Vue.PropType<Bone>,
        selected: Object as Vue.PropType<Bone>,
        layers: Array as Vue.PropType<Array<Layer | LayerFolder>>,
        layerIdMap: Object as Vue.PropType<{ [id: number]: Layer | LayerFolder }>,
        readonly: Boolean
    },
    data() {
        return {
            dragging: null as BoneNodeClass | null,
            overNode: null as BoneNodeClass | null,
            dropPosition: null as string | null
        };
    },
    beforeDestroy() {
        this.onDragEnd();
    },
    methods: {
        getSelf() {
            return this;
        },
        onDragStart(node: BoneNodeClass) {
            if (this.readonly) {
                return;
            }
            this.dragging = node;
            document.body.addEventListener('mouseup', this.onDragEnd);
        },
        onDragEnd() {
            document.body.removeEventListener('mouseup', this.onDragEnd);
            if (this.dragging && this.overNode && this.overNode !== this.dragging && this.dropPosition) {
                this.$emit(
                    'move',
                    this.dragging.bone,
                    this.dropPosition,
                    this.overNode.bone
                );
            }
            this.updateDraggingIndicator(null);
            this.dragging = null;
            this.overNode = null;
        },
        onNodeMouseOver(node: BoneNodeClass, e: MouseEvent) {
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
        onNodeMouseMove(node: BoneNodeClass, e: MouseEvent) {
            if (this.dragging && this.dragging.bone !== this.selected) {
                this.dragging.select();
            }
            if (this.overNode === node) {
                this.updateDraggingIndicator(node, e);
            }
        },
        updateDraggingIndicator(node: BoneNodeClass | null, e?: MouseEvent) {
            if (this.overNode) {
                this.overNode.showDragIndicator1 = false;
                this.overNode.showDragIndicator2 = false;
                this.overNode.showDropIndicator = false;
            }
            if (node && e) {
                const rect = (<HTMLElement>node.$refs.bone).getBoundingClientRect();
                const mouseY = e.clientY;
                const middle1 = rect.height / 4 + rect.top;
                const middle2 = rect.height / 4 * 3 + rect.top;
                if (mouseY > middle2) {
                    if (node.bone.children.length && node.bone.expanded) {
                        this.dropPosition = 'inner';
                        node.showDragIndicator1 = false;
                        node.showDragIndicator2 = false;
                        node.showDropIndicator = true;
                    } else {
                        this.dropPosition = 'after';
                        node.showDragIndicator1 = false;
                        node.showDragIndicator2 = true;
                        node.showDropIndicator = false;
                    }
                } else if (mouseY > middle1) {
                    this.dropPosition = 'inner';
                    node.showDragIndicator1 = false;
                    node.showDragIndicator2 = false;
                    node.showDropIndicator = true;
                } else {
                    if (!node.bone.parent) {
                        this.dropPosition = null;
                        node.showDragIndicator1 = false;
                        node.showDragIndicator2 = false;
                        node.showDropIndicator = false;
                    } else {
                        this.dropPosition = 'before';
                        node.showDragIndicator1 = true;
                        node.showDragIndicator2 = false;
                        node.showDropIndicator = false;
                    }
                }
            } else {
                this.dropPosition = null;
            }
        },
        checkAbleToDrop(node: BoneNodeClass): boolean {
            if (this.dragging) {
                let bone = node.bone as Bone | undefined;
                while (bone) {
                    if (bone === this.dragging.bone) {
                        return false;
                    }
                    bone = bone.parent;
                }
            }
            return true;
        },
        setLayerId(bone: Bone, layerId: number) {
            this.$emit('setLayerId', bone, layerId);
        },
        setVisibility(bone: Bone, visible: boolean) {
            this.$emit('setVisibility', bone, visible);
        },
        setBoneVisibility(bone: Bone, visible: boolean) {
            this.$emit('setBoneVisibility', bone, visible);
        },
        setImageVisibility(bone: Bone, visible: boolean) {
            this.$emit('setImageVisibility', bone, visible);
        }
    }
}) {
}
