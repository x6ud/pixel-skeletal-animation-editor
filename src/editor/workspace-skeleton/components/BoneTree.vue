<template>
    <div class="bone-tree">
        <bone-node :bone="bones"
                   :deep="0"
                   :selected="selected"
                   :root="getSelf()"
                   :layers="layers"
                   :layerIdMap="layerIdMap"
                   :readonly="readonly"
        />
    </div>
</template>

<script lang="ts">
    import BoneTree from './BoneTree'

    export default BoneTree;
</script>

<style lang="scss" scoped>
    .bone-tree {
        border-top: solid 1px #444;
        border-bottom: solid 1px #444;
    }
</style>
