<template>
    <div class="timeline"
         ref="wrapper"
         @wheel="onWheel"
         @mousedown="onMouseDown"
    >
        <canvas :width="canvasWidth"
                :height="canvasHeight"
                ref="canvas"
        ></canvas>
    </div>
</template>

<script lang="ts">
    import AnimationTimeline from './AnimationTimeline'

    export default AnimationTimeline;
</script>

<style lang="scss" scoped>
    .timeline {
        height: 60px;
    }
</style>
