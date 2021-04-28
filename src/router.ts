import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '',
            name: 'editor',
            component: () => import('./editor/Editor.vue')
        },
        {
            path: '/testbed',
            name: 'testbed',
            component: () => import('./testbed/RotSprite.vue')
        }
    ]
});
