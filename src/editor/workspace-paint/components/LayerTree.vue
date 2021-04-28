<template>
    <div class="layers">
        <layer-node v-for="layer in layers"
                    :key="layer.id"
                    :layer="layer"
                    :deep="deep"
                    :root="root || getSelf()"
                    :selected="selected"
                    ref="layer"
        />
    </div>
</template>

<script lang="ts">
    import LayerTree from './LayerTree'

    export default LayerTree;
</script>

<style lang="scss" scoped>
    .layers {
        display: flex;
        flex-direction: column;
        width: 100%;
    }
</style>
