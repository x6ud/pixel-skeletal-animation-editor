<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({});
</script>

<style>
    html {
        width: 100%;
        height: 100%;
    }

    body {
        width: 100%;
        height: 100%;
        margin: 0;
    }

    #app {
        width: 100%;
        height: 100%;
        font-size: 14px;
    }

    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-corner {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, .1);
    }

    ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, .2);
    }
</style>
