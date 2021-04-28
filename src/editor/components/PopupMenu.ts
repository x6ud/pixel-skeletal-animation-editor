import Vue from 'vue'

import MenuItemClass from './MenuItem'

export default class PopupMenu extends Vue.extend({
    data() {
        return {
            display: false,
            style: {} as { [name: string]: any },
            scrollable: false
        };
    },
    mounted() {
        const dom = this.$refs.dom as HTMLElement;
        dom.parentNode && dom.parentNode.removeChild(dom);
        document.body.appendChild(dom);
    },
    beforeDestroy() {
        this.hide();
        const dom = this.$refs.dom as HTMLElement;
        dom.parentNode && dom.parentNode.removeChild(dom);
    },
    methods: {
        onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                this.hideAll();
            }
        },
        show(target: HTMLElement, position: string = 'right', zIndex?: number, parentMenuItem?: MenuItemClass, root?: PopupMenu) {
            const popupMenu = this as PopupMenu;
            popupMenu.root = root;
            popupMenu.zIndex = zIndex || 1000;
            popupMenu.parentMenuItem = parentMenuItem;

            if (parentMenuItem) {
                parentMenuItem.subMenuDisplay = true;
            }

            const windowRect = document.body.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const maxRight = windowRect.width;
            const maxBottom = windowRect.height;

            this.style = {left: 0, top: 0, width: 'auto', height: 'auto'};
            this.scrollable = false;
            this.display = true;
            this.$nextTick(() => {
                document.body.addEventListener('mousedown', this.hideDropdown);
                (<HTMLElement>this.$refs.dom).focus();

                const rect = (<HTMLElement>this.$refs.dom).getBoundingClientRect();
                let x = 0;
                let y = 0;
                const width = rect.right - rect.left;
                const height = rect.bottom - rect.top;

                switch (position) {
                    case 'right':
                        x = targetRect.right;
                        y = targetRect.top;
                        break;
                    case 'bottom':
                        x = targetRect.left;
                        y = targetRect.bottom;
                        break;
                    default:
                        x = targetRect.right;
                        y = targetRect.top;
                        break;
                }

                this.scrollable = true;
                const style = this.style = {
                    width: Math.floor(width) + 'px',
                    height: Math.floor(height) + 'px',
                    overflow: 'hidden',
                    'z-index': popupMenu.zIndex
                } as { [name: string]: any };

                if (x + width > maxRight) {
                    style.right = 0;
                } else {
                    style.left = Math.floor(x) + 'px';
                }

                if (y + height > maxBottom) {
                    const top = Math.floor(Math.max(0, maxBottom - height));
                    style.top = top + 'px';
                    style.height = Math.floor(maxBottom - top) + 'px';
                } else {
                    style.top = Math.floor(y) + 'px';
                }
            });
        },
        hide() {
            const popupMenu = this as PopupMenu;
            document.body.removeEventListener('mousedown', this.hideDropdown);
            this.display = false;
            if (popupMenu.subMenu) {
                popupMenu.subMenu.hide();
            }
            if (popupMenu.parentMenuItem) {
                popupMenu.parentMenuItem.subMenuDisplay = false;
            }
        },
        hideAll() {
            const popupMenu = this as PopupMenu;
            if (popupMenu.root) {
                popupMenu.root.hide();
            } else {
                this.hide();
            }
        },
        hideDropdown() {
            this.hide();
        },
        onMenuItemMouseOver(menuItem: MenuItemClass) {
            const popupMenu = this as PopupMenu;
            if (popupMenu.subMenu) {
                popupMenu.subMenu.hide();
            }
            const subMenu = menuItem.getPopupMenu() as PopupMenu | undefined;
            popupMenu.subMenu = subMenu;
            if (subMenu) {
                subMenu.show(
                    menuItem.$refs.dom as HTMLElement,
                    'right',
                    (popupMenu.zIndex || 0) + 1,
                    menuItem,
                    popupMenu.root || this,
                );
            }
        }
    }
}) {
    root?: PopupMenu;
    zIndex?: number;
    parentMenuItem?: MenuItemClass;
    subMenu?: PopupMenu;
}
