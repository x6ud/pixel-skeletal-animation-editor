import Vue from 'vue'

import addGlobalDragListener from '../../../utils/add-global-drag-listener'
import {MouseButton} from '../../../utils/MouseButton'

import Keyframe from '../../project/Keyframe'

const PREFER_TICKS_DISTANCE = 40;
const PADDING_LEFT = 12;
const LABEL_FONT_SIZE = 8;
const LABEL_MARGIN = 4;
const SMALL_TICK_MARGIN = 8;
const KEYFRAME_ICON_SIZE = 12;

export default class AnimationTimeline extends Vue.extend({
    props: {
        timeline: Array as Vue.PropType<Array<Keyframe>>,
        step: Number,
        position: Number,
        current: Number
    },
    data() {
        return {
            tid: null as any,
            canvasWidth: 0,
            canvasHeight: 0,

            dragging: null as number | null,
            dropPosition: null as number | null
        };
    },
    mounted() {
        const canvas = this.$refs.canvas as HTMLCanvasElement;
        (this as AnimationTimeline).ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.tid = setInterval(this.updateCanvasSize, 1000 / 30);
        this.updateCanvasSize();
    },
    beforeDestroy() {
        clearInterval(this.tid);
    },
    activated() {
        this.render();
    },
    computed: {
        scale() {
            const arr = [1, 5, 10, 20, 50, 100, 200, 400, 600, 800, 1000];
            for (let i = 0, len = arr.length; i < len; ++i) {
                if (arr[i] >= this.step) {
                    return arr[i];
                }
            }
            return arr[arr.length - 1];
        }
    },
    watch: {
        step() {
            this.render();
        },
        position() {
            this.render();
        },
        current() {
            this.render();
        }
    },
    methods: {
        onWheel(e: WheelEvent) {
            const det = e.deltaY / 100;
            const scale = this.scale;
            const position = Math.max(0, this.position + det * (scale >= 5 ? scale / 5 : 1));
            this.$emit('update:position', position);
        },
        onMouseDown(e: MouseEvent) {
            if (e.button !== MouseButton.LEFT) {
                return;
            }
            const wrapper = this.$refs.wrapper as HTMLElement;
            const rect = wrapper.getBoundingClientRect();
            const scale = this.scale;
            const tickDistance = Math.round(scale / this.step * PREFER_TICKS_DISTANCE);
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const keyframe = this.getClickedKeyframe(mouseX, mouseY);
            if (keyframe) {
                this.$emit('update:current', keyframe.frameIndex);
                this.dragging = keyframe.frameIndex;
                addGlobalDragListener(
                    e,
                    (e: MouseEvent) => {
                        const mouseX = e.clientX - rect.left;
                        if (mouseX >= 0 && mouseX <= rect.width) {
                            const x = (mouseX - PADDING_LEFT) / tickDistance * scale + this.position;
                            this.dropPosition = Math.round(Math.max(0, x));
                        }
                        this.render();
                    },
                    () => {
                        const dragging = this.dragging;
                        const dropPosition = this.dropPosition;
                        this.dragging = null;
                        this.dropPosition = null;
                        this.render();
                        if (dragging != null && dropPosition != null && dragging !== dropPosition) {
                            this.$emit('move', dragging, dropPosition);
                        }
                    }
                );
            } else {
                addGlobalDragListener(
                    e,
                    (e: MouseEvent) => {
                        const x = (e.clientX - rect.left - PADDING_LEFT) / tickDistance * scale + this.position;
                        this.$emit('update:current', Math.round(Math.max(0, x)));
                    }
                );
            }
        },
        getClickedKeyframe(mouseX: number, mouseY: number) {
            const timeline = this.timeline;
            const half = KEYFRAME_ICON_SIZE / 2;
            const y = LABEL_MARGIN * 2 + LABEL_FONT_SIZE + (this.canvasHeight - (LABEL_MARGIN * 2 + LABEL_FONT_SIZE)) / 2;
            const scale = this.scale;
            const tickDistance = Math.round(scale / this.step * PREFER_TICKS_DISTANCE);
            const min = this.position;
            for (let i = timeline.length - 1; i >= 0; --i) {
                const keyframe = timeline[i];
                const frameIndex = keyframe.frameIndex;
                const x = (frameIndex - min) / scale * tickDistance - 0.5 + PADDING_LEFT;
                if (Math.abs(mouseX - x) <= half && Math.abs(mouseY - y) <= half) {
                    return keyframe;
                }
            }
            return undefined;
        },
        scrollToCurrent() {
            const width = this.canvasWidth;
            const scale = this.scale;
            const tickDistance = Math.round(scale / this.step * PREFER_TICKS_DISTANCE);
            const range = width / tickDistance * scale;
            if (this.position > this.current) {
                this.$emit('update:position', this.current);
            } else if (this.position + (range - scale) < this.current) {
                this.$emit('update:position', Math.ceil(this.current - (range - scale)));
            }
        },
        scrollViewWindow() {
            const width = this.canvasWidth;
            const scale = this.scale;
            const tickDistance = Math.round(scale / this.step * PREFER_TICKS_DISTANCE);
            const range = width / tickDistance * scale;
            if (this.position > this.current || this.position + (range - scale) < this.current) {
                this.$emit('update:position', this.current);
            }
        },
        updateCanvasSize() {
            const wrapper = this.$refs.wrapper as HTMLElement;
            const rect = wrapper.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            if (width && height && (this.canvasWidth !== width || this.canvasHeight !== height)) {
                this.canvasWidth = width;
                this.canvasHeight = height;
                this.$nextTick(() => this.render());
            }
        },
        render() {
            const ctx = (this as AnimationTimeline).ctx;
            if (!ctx) {
                return;
            }
            const width = this.canvasWidth;
            const height = this.canvasHeight;
            if (!width || !height) {
                return;
            }

            ctx.clearRect(0, 0, width, height);

            ctx.strokeStyle = '#444';
            ctx.fillStyle = '#666';
            const scale = this.scale;
            const tickDistance = Math.round(scale / this.step * PREFER_TICKS_DISTANCE);
            const range = width / tickDistance * scale;
            const min = this.position;
            const max = min + range;

            // ticks
            for (let i = Math.floor(min / scale) * scale; i <= max; i += scale) {
                const x = Math.round((i - min) / scale * tickDistance) - 0.5 + PADDING_LEFT;

                ctx.beginPath();
                ctx.moveTo(x, LABEL_MARGIN * 2 + LABEL_FONT_SIZE);
                ctx.lineTo(x, height);
                ctx.stroke();
                const label = i.toString();
                const labelWidth = ctx.measureText(label).width;
                ctx.fillText(i.toString(), x - labelWidth / 2, LABEL_MARGIN + LABEL_FONT_SIZE);

                if (scale >= 5) {
                    for (let j = 1; j < 5; ++j) {
                        const dx = j * tickDistance / 5;
                        ctx.beginPath();
                        ctx.moveTo(x + dx, LABEL_MARGIN * 2 + LABEL_FONT_SIZE + SMALL_TICK_MARGIN);
                        ctx.lineTo(x + dx, height);
                        ctx.stroke();
                    }
                }
            }

            // current
            const currentX = (this.current - min) / scale * tickDistance - 0.5 + PADDING_LEFT;
            ctx.strokeStyle = '#0ff';
            ctx.fillStyle = '#0ff';
            ctx.beginPath();
            ctx.moveTo(currentX, LABEL_MARGIN * 2 + LABEL_FONT_SIZE);
            ctx.lineTo(currentX, height);
            ctx.stroke();
            const label = this.current.toString();
            const labelWidth = ctx.measureText(label).width;
            ctx.fillText(label, currentX - labelWidth / 2, LABEL_MARGIN + LABEL_FONT_SIZE);

            // keyframes
            const half = KEYFRAME_ICON_SIZE / 2;
            const y = LABEL_MARGIN * 2 + LABEL_FONT_SIZE + (height - (LABEL_MARGIN * 2 + LABEL_FONT_SIZE)) / 2;
            ctx.strokeStyle = '#aaa';
            this.timeline.forEach(keyframe => {
                if (keyframe.frameIndex === this.dragging) {
                    return;
                }
                const x = (keyframe.frameIndex - min) / scale * tickDistance - 0.5 + PADDING_LEFT;
                if (x + half > 0 || x - half < width) {
                    ctx.beginPath();
                    ctx.moveTo(x, y - half);
                    ctx.lineTo(x + half, y);
                    ctx.lineTo(x, y + half);
                    ctx.lineTo(x - half, y);
                    ctx.stroke();
                    ctx.fillStyle = keyframe.frameIndex === this.current ? '#0ff' : '#ddd';
                    ctx.fill();
                }
            });

            // drag indicator
            if (this.dropPosition != null && this.dragging != null) {
                ctx.fillStyle = ctx.strokeStyle = '#f0f';

                const x = (this.dropPosition - min) / scale * tickDistance - 0.5 + PADDING_LEFT;
                ctx.beginPath();
                ctx.moveTo(x, LABEL_MARGIN * 2 + LABEL_FONT_SIZE);
                ctx.lineTo(x, height);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(x, y - half);
                ctx.lineTo(x + half, y);
                ctx.lineTo(x, y + half);
                ctx.lineTo(x - half, y);
                ctx.stroke();
                ctx.fill();

                if (this.dropPosition !== this.current) {
                    const label = this.dropPosition.toString();
                    const labelWidth = ctx.measureText(label).width;
                    ctx.fillText(label, x - labelWidth / 2, LABEL_MARGIN + LABEL_FONT_SIZE);
                }
            }
        }
    }
}) {
    ctx: CanvasRenderingContext2D = undefined as any;
}
