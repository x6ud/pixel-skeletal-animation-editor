<template>
    <div class="wrapper">
        <canvas ref="canvas"
                :width="canvasWidth"
                :height="canvasHeight"
        ></canvas>
        <div class="range">
            <input type="range" v-model="rotation" min="0" max="360">
            <span>{{rotation}}</span>
        </div>
    </div>
</template>

<script lang="ts">
    import RotSprite from './RotSprite'

    export default RotSprite;
</script>

<style lang="scss" scoped>
    .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: #f2f2f2;

        canvas {
            margin: auto;
        }

        .range {
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;

            input {
                width: 400px;
            }
        }

    }
</style>
