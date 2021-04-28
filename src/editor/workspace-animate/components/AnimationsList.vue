<template>
    <div class="animations-list">
        <animations-list-item v-for="animation in animations"
                              :key="animation.id"
                             :animation="animation"
                             :selected="selected"
                              @select="select"
                              @dragStart="onItemDragStart"
                              @mouseOver="onItemMouseOver"
                              @mouseMove="onItemMouseMove"
        />
    </div>
</template>

<script lang="ts">
    import AnimationsList from './AnimationsList'

    export default AnimationsList;
</script>

<style lang="scss" scoped>
    .animations-list {
        font-size: 12px;
        user-select: none;

    }
</style>
