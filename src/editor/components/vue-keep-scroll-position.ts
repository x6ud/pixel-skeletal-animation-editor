import Vue, {VNode} from 'vue'
import {DirectiveBinding} from 'vue/types/options'

const ATTR_NAME = 'last-scroll-position';

const VueKeepScrollPositionPlugin = {
    install() {
        Vue.directive('keep-scroll-position', {
            bind(el: HTMLElement, binding: DirectiveBinding, vnode: VNode, oldVnode: VNode) {
                const onScroll = (event: Event) => {
                    const target = event.target as HTMLElement;
                    target && target.setAttribute(ATTR_NAME, target.scrollLeft + '-' + target.scrollTop);
                };
                el.addEventListener('scroll', onScroll);

                if (vnode.context) {
                    vnode.context.$on('hook:activated', function () {
                        document.querySelectorAll(`[${ATTR_NAME}]`).forEach(element => {
                            const attr = element.getAttribute(ATTR_NAME);
                            if (!attr) {
                                return;
                            }
                            const offset = attr.split('-');
                            if (!offset) {
                                return;
                            }
                            element.scrollTop = Number.parseFloat(offset[1]);
                            element.scrollLeft = Number.parseFloat(offset[0]);
                        })
                    });
                }
            }
        });
    }
};

export default VueKeepScrollPositionPlugin;
