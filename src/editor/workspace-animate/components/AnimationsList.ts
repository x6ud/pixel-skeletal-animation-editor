import Vue from 'vue'

import AnimationsListItem from './AnimationsListItem.vue'
import AnimationsListItemClass from './AnimationsListItem'

import Animation from '../../project/Animation'

export default class AnimationsList extends Vue.extend({
    components: {AnimationsListItem},
    props: {
        animations: Array as Vue.PropType<Array<Animation>>,
        selected: Object as Vue.PropType<Animation>
    },
    data() {
        return {
            dragging: null as AnimationsListItemClass | null,
            overItem: null as AnimationsListItemClass | null,
            dropPosition: null as String | null
        };
    },
    beforeDestroy() {
        this.onDragEnd();
    },
    methods: {
        select(animation: Animation) {
            this.$emit('select', animation);
        },
        onItemDragStart(item: AnimationsListItemClass) {
            this.dragging = item;
            document.body.addEventListener('mouseup', this.onDragEnd);
        },
        onDragEnd() {
            document.body.removeEventListener('mouseup', this.onDragEnd);
            if (this.dragging && this.overItem && this.dragging !== this.overItem && this.dropPosition) {
                const oldIndex = this.animations.indexOf(this.dragging.animation);
                this.$emit(
                    'move',
                    this.dragging.animation,
                    this.dropPosition,
                    this.overItem.animation
                );
            }
            this.updateDraggingIndicator(null);
            this.dragging = null;
            this.overItem = null;
        },
        onItemMouseOver(item: AnimationsListItemClass, e: MouseEvent) {
            if (this.dragging) {
                this.updateDraggingIndicator(item, e);
                this.overItem = item;
            }
        },
        onItemMouseMove(item: AnimationsListItemClass, e: MouseEvent) {
            if (this.overItem === item) {
                this.updateDraggingIndicator(item, e);
            }
        },
        updateDraggingIndicator(item: AnimationsListItemClass | null, e?: MouseEvent) {
            if (this.overItem) {
                this.overItem.showDragIndicator1 = false;
                this.overItem.showDragIndicator2 = false;
            }
            if (item && e) {
                const rect = (item.$refs.animation as HTMLElement).getBoundingClientRect();
                const mouseY = e.clientY;
                const middle = rect.height / 2 + rect.top;
                if (mouseY > middle) {
                    item.showDragIndicator1 = false;
                    item.showDragIndicator2 = true;
                    this.dropPosition = 'after';
                } else {
                    item.showDragIndicator1 = true;
                    item.showDragIndicator2 = false;
                    this.dropPosition = 'before';
                }
            } else {
                this.dropPosition = null;
            }
        }
    }
}) {
}
