<template>
    <div class="color" @click="rgbMode = !rgbMode">
        <template v-if="!rgbMode">
            <div class="h"><span>{{ht}}</span></div>
            <div class="s"><span>{{st}}</span></div>
            <div class="v"><span>{{vt}}</span></div>
        </template>
        <template v-if="rgbMode">
            <div class="r"><span>{{value.r}}</span></div>
            <div class="g"><span>{{value.g}}</span></div>
            <div class="b"><span>{{value.b}}</span></div>
        </template>
    </div>
</template>

<script lang="ts">
    import ColorValues from './ColorValues'

    export default ColorValues;
</script>

<style lang="scss" scoped>
    .color {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 8px;
        user-select: none;

        .h, .s, .v, .r, .g, .b {
            display: flex;
            align-items: center;
            min-width: 0;

            &:not(:last-child) {
                margin-right: 1em;
            }

            span {
                display: inline-block;
                width: 3em;
                text-align: right;
            }

            &:before {
                content: '';
                display: block;
                width: 8px;
                height: 8px;
                line-height: 8px;
                vertical-align: top;
                text-align: center;
                border: solid 1px #222;
                overflow: hidden;
                color: #999;
                background: #444;
            }
        }

        .h:before {
            content: 'H';
        }

        .s:before {
            content: 'S';
        }

        .v:before {
            content: 'V';
        }

        .r:before {
            background: darkred;
        }

        .g:before {
            background: green;
        }

        .b:before {
            background: blue;
        }
    }
</style>
