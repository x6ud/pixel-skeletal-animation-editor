<template>
    <base-dropdown class="select-layer"
                   ref="dropdown"
                   :readonly="readonly"
    >
        <div slot="trigger"
             class="text"
             :class="{empty, readonly}"
             :title="readonly ? undefined : 'Select image'"
        >
            {{text}}
        </div>
        <div slot="dropdown" class="drop">
            <select-layer-tree-node v-for="child in layers"
                                    :key="child.id"
                                    :layer="child"
                                    :deep="0"
                                    :selected="layer"
                                    :root="getSelf()"
            />
        </div>
    </base-dropdown>
</template>

<script lang="ts">
    import SelectLayer from './SelectLayer'

    export default SelectLayer;
</script>

<style lang="scss" scoped>
    .select-layer {
        .text {
            user-select: none;
            cursor: default;

            &:not(.readonly):hover {
                text-decoration: underline;
            }

            &.empty {
                opacity: .75;
            }
        }
    }
</style>
