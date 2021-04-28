import Vue from 'vue'

import BoneTreeClass from './BoneTree'
import SelectLayer from './SelectLayer.vue'

import Bone from '../../project/Bone'
import Layer from '../../project/Layer'
import LayerFolder from '../../project/LayerFolder'

export default class BoneNode extends Vue.extend({
    components: {SelectLayer},
    name: 'bone-node',
    props: {
        bone: Object as Vue.PropType<Bone>,
        deep: {
            type: Number,
            default: 0
        },
        selected: Object as Vue.PropType<Bone>,
        root: Object as Vue.PropType<BoneTreeClass>,
        layers: Array as Vue.PropType<Array<Layer | LayerFolder>>,
        layerIdMap: Object as Vue.PropType<{ [id: number]: Layer | LayerFolder }>,
        readonly: Boolean
    },
    data() {
        return {
            showNameInput: false,
            nameInputValue: '',
            showDragIndicator1: false,
            showDragIndicator2: false,
            showDropIndicator: false
        };
    },
    methods: {
        onNameDbClick() {
            if (this.bone.id < 0) {
                return;
            }
            this.nameInputValue = this.bone.name;
            this.showNameInput = true;
            this.$nextTick(() => {
                const dom = <HTMLInputElement>this.$refs.inputName;
                dom.focus();
                dom.select();
            });
        },
        onNameInputLostFocus() {
            this.showNameInput = false;
            if (this.nameInputValue) {
                this.root.$emit('setName', this.bone, this.nameInputValue);
            }
        },
        onNameInputKeyDown(e: KeyboardEvent) {
            if (e.key === 'Enter') {
                this.onNameInputLostFocus();
            }
        },
        select() {
            this.root.$emit('select', this.bone);
        },
        onDragStart() {
            this.root.onDragStart(this);
        },
        onMouseOver(e: MouseEvent) {
            this.root.onNodeMouseOver(this, e);
        },
        onMouseMove(e: MouseEvent) {
            this.root.onNodeMouseMove(this, e);
        },
        setLayerId(id: number) {
            this.root.setLayerId(this.bone, id);
        },
        toggleVisibility() {
            this.root.setVisibility(this.bone, !this.bone.visible);
        },
        toggleBoneVisibility() {
            this.root.setBoneVisibility(this.bone, !this.bone.boneVisible);
        },
        toggleImageVisibility() {
            this.root.setImageVisibility(this.bone, !this.bone.imageVisible);
        }
    }
}) {
}
