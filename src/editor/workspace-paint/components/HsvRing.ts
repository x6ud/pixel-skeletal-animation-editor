import Vue from 'vue'

import hueRingFrag from '../../../shaders/hue-ring.frag'
import svRectFrag from '../../../shaders/sv-rect.frag'

import Color from '../../../utils/Color'
import Renderer from '../../../utils/Renderer'
import addGlobalDragListener from '../../../utils/add-global-drag-listener'

const renderer = Renderer.instance();

const hueRingShader = renderer.createShader(undefined, hueRingFrag);
const svRectShader = renderer.createShader(undefined, svRectFrag);

const RING_SIZE = 160;
const RECT_WRAPPER_SIZE = 132;
const RECT_SIZE = 86;

export default class HsvRing extends Vue.extend({
    props: {
        value: Object as Vue.PropType<Color>
    },
    data() {
        return {
            ringSize: RING_SIZE,
            rectSize: RECT_SIZE
        };
    },
    computed: {
        hueRingStyle() {
            return {
                width: RING_SIZE + 'px',
                height: RING_SIZE + 'px'
            };
        },
        hueRingHandlerStyle() {
            const color = this.value || Color.BLACK;
            return {
                height: RING_SIZE / 2 + 'px',
                left: RING_SIZE / 2 + 'px',
                transform: `rotate(${Math.round(color.h * 360) - 60}deg)`,
                'transform-origin': `0 ${RING_SIZE / 2}px`
            };
        },
        svRectWrapperStyle() {
            return {
                width: RECT_WRAPPER_SIZE + 'px',
                height: RECT_WRAPPER_SIZE + 'px',
                left: (RING_SIZE - RECT_WRAPPER_SIZE) / 2 + 'px',
                top: (RING_SIZE - RECT_WRAPPER_SIZE) / 2 + 'px'
            };
        },
        svRectStyle() {
            return {
                width: RECT_SIZE + 'px',
                height: RECT_SIZE + 'px',
                'margin-left': (RECT_WRAPPER_SIZE - RECT_SIZE) / 2 + 'px',
                'margin-top': (RECT_WRAPPER_SIZE - RECT_SIZE) / 2 + 'px'
            };
        },
        svRectHandlerStyle() {
            const color = this.value || Color.BLACK;
            return {
                left: Math.round(RECT_SIZE * color.s) + 'px',
                top: Math.round(RECT_SIZE * (1 - color.v)) + 'px'
            };
        }
    },
    watch: {
        'value.h'() {
            this.updateSvRect();
        }
    },
    mounted() {
        renderer.resizeCanvas(RING_SIZE, RING_SIZE, true);
        renderer.useShader(hueRingShader);
        renderer.clear();
        renderer.draw(undefined, 0, 0, RING_SIZE, RING_SIZE, 0, 0, 0, false, true);

        const canvasHueRing = <HTMLCanvasElement>this.$refs.canvasHueRing;
        const ctx = <CanvasRenderingContext2D>canvasHueRing.getContext('2d');
        ctx.clearRect(0, 0, RING_SIZE, RING_SIZE);
        renderer.copyTo(ctx);

        this.updateSvRect();
    },
    methods: {
        onHueRingMouseDown(e: MouseEvent) {
            const r = RING_SIZE / 2;
            const rect = (<HTMLElement>this.$refs.canvasHueRing).getBoundingClientRect();
            const x = e.clientX - rect.left - r;
            const y = e.clientY - rect.top - r;
            if (x * x + y * y > r * r) {
                return;
            }
            addGlobalDragListener(
                e,
                (e: MouseEvent) => {
                    const color = this.value || Color.BLACK;
                    const r = RING_SIZE / 2;
                    const rect = (<HTMLElement>this.$refs.canvasHueRing).getBoundingClientRect();
                    const x = e.clientX - rect.left - r;
                    const y = e.clientY - rect.top - r;
                    const angle = (Math.atan2(y, x) / Math.PI * 180 + 360 * 2 + 90 + 60) % 360;

                    this.$emit('input', Color.hsv(angle / 360, color.s, color.v));
                }
            );
        },
        updateSvRect() {
            const color = this.value || Color.BLACK;
            renderer.resizeCanvas(RECT_SIZE, RECT_SIZE, true);
            renderer.useShader(svRectShader);
            renderer.setUniforms({u_hue: color.h});
            renderer.clear();
            renderer.draw(undefined, 0, 0, RECT_SIZE, RECT_SIZE, 0, 0, 0, false, true);

            const canvas = <HTMLCanvasElement>this.$refs.canvasSvRect;
            const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
            ctx.clearRect(0, 0, RECT_SIZE, RECT_SIZE);
            renderer.copyTo(ctx);
        },
        onSvRectMouseDown(e: MouseEvent) {
            addGlobalDragListener(
                e,
                (e: MouseEvent) => {
                    const color = this.value || Color.BLACK;

                    const rect = (<HTMLElement>this.$refs.canvasSvRect).getBoundingClientRect();
                    const x = Math.min(Math.max(e.clientX - rect.left, 0), RECT_SIZE) / RECT_SIZE;
                    const y = Math.min(Math.max(e.clientY - rect.top, 0), RECT_SIZE) / RECT_SIZE;

                    this.$emit('input', Color.hsv(color.h, x, 1 - y));
                }
            );
        }
    }
}) {
}
