<template>
    <div class="node">
        <div class="layer"
             :class="{selected: layer === selected}"
        >
            <div class="padding" :style="{'padding-right': deep * 20 + 'px'}"></div>
            <div class="icon"
                 :class="{expanded: layer.expanded, folder: !!layer.children}"
                 @click="layer.expanded = !layer.expanded"
            ></div>
            <div class="name"
                 @click="select"
            >
                {{layer.name}}
            </div>
        </div>

        <div class="children"
             v-if="layer.children && layer.children.length"
             :style="{display: layer.expanded ? 'block' : 'none'}"
        >
            <select-layer-tree-node v-for="child in layer.children"
                                    :key="child.id"
                                    :layer="child"
                                    :deep="deep + 1"
                                    :selected="selected"
                                    :root="root"
            />
        </div>
    </div>
</template>

<script lang="ts">
    import SelectLayerTreeNode from './SelectLayerTreeNode'

    export default SelectLayerTreeNode;
</script>

<style lang="scss" scoped>
    .node {
        .layer {
            display: flex;
            align-items: center;
            height: 26px;
            min-width: 160px;

            &:hover, &.selected {
                background-color: #666;
            }

            .icon {
                width: 26px;
                height: 100%;
                background: url("../../../assets/editor/paint/layer/layer.png") center center no-repeat;

                &.folder {
                    background: url("../../../assets/editor/paint/layer/folder-closed.png") center center no-repeat;

                    &.expanded {
                        background: url("../../../assets/editor/paint/layer/folder-opened.png") center center no-repeat;
                    }
                }
            }

            .name {
                flex: 1 1;
                min-width: 60px;
                height: 26px;
                line-height: 26px;
                white-space: nowrap;
                cursor: pointer;
            }
        }
    }
</style>
