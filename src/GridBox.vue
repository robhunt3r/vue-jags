<template>
    <div :class="classes" :style="style" :id="boxId" v-bind="coords"
         @mousedown="drag" @touchstart.stop="drag"
         v-if="registered">
        <div class="box-content">
            <slot></slot>
        </div>
        <div class="resize-handle" @mousedown="resize" @touchstart.stop="resize"></div>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    name: 'GridBox',
    props: {
        boxId: {
            required: true
        },
        priority: {
            type: Array,
            default: () => {
                return ['top', 'right', 'left', 'bottom']
            },
            required: false
        },
        customClass: {
            type: String,
            default: 'grid-box'
        }
    },
    data () {
        return {
            registered: false,
            container: null,
            dragging: false,
            resizing: false,
            zIndex: 1,
            mouseStart: {
                x: 0,
                y: 0
            },
            coords: {
                x: 0,
                y: 0,
                w: 1,
                h: 1
            },
            placeholder: {
                x: 0,
                y: 0,
                w: 1,
                h: 1
            },
            hidden: false
        }
    },
    watch: {
        isMoving (value) {
            this.zIndex = value ? 2 : 1
        }
    },
    computed: {
        isMoving () {
            return this.dragging || this.resizing
        },
        editable () {
            return this.container && this.container.editable
        },
        style () {
            if (this.container && !this.hidden) {
                const pixelPosition = this.container.cellToPixel(this.coords)
                return {
                    display: 'block',
                    width: pixelPosition.w + 'px',
                    height: pixelPosition.h + 'px',
                    transform: `translate3d(${pixelPosition.x}px, ${pixelPosition.y}px, 0)`,
                    zIndex: this.zIndex
                }
            }

            return {
                display: 'none'
            }
        },
        classes () {
            const classes = {
                'editable': this.editable,
                'dragging': this.dragging,
                'resizing': this.resizing
            }
            classes[this.customClass] = true
            return classes
        }
    },
    methods: {
        move (newCoords, force = false) {
            if (!force) {
                newCoords = this.container.validatePosition({ ...this.coords, ...newCoords })
            }

            if (_.isEqual({ ...this.coords }, newCoords)) return
            this.coords = newCoords
        },
        drag (event) {
            if (this.editable) {
                this.dragging = true
                this.mousedown(event)
            }
        },
        resize (event) {
            if (this.editable) {
                this.resizing = true
                this.mousedown(event)
            }
        },
        mousedown (event) {
            if (!this.editable) return

            this.placeholder = { ...this.coords }
            this.mouseStart = { x: event.pageX, y: event.pageY }

            document.addEventListener('mousemove', this.documentMouseMove)
            document.addEventListener('touchmove', this.documentMouseMove)

            document.addEventListener('mouseup', this.documentMouseUp)
            document.addEventListener('touchend', this.documentMouseUp)
        },
        documentMouseMove (event) {
            if (!this.editable && (!this.dragging || !this.resize)) return
            const evt = event.touches ? event.touches[0] : event

            const distanceX = evt.pageX - this.mouseStart.x
            const distanceY = evt.pageY - this.mouseStart.y
            const shift = this.container.pixelToCell({ x: distanceX, y: distanceY })

            if (this.dragging) {
                const shiftX = this.placeholder.x + shift.x
                const shiftY = this.placeholder.y + shift.y

                this.move({ ...this.placeholder, x: shiftX, y: shiftY })
            }

            if (this.resizing) {
                const shiftW = this.placeholder.w + shift.x
                const shiftH = this.placeholder.h + shift.y

                this.move({ ...this.placeholder, w: shiftW, h: shiftH })
            }
        },
        documentMouseUp () {
            this.dragging = false
            this.resizing = false

            document.removeEventListener('mousemove', this.documentMouseMove)
            document.removeEventListener('touchmove', this.documentMouseMove)

            document.removeEventListener('mouseup', this.documentMouseUp)
            document.removeEventListener('touchend', this.documentMouseUp)
        },
        log (subject, ...args) {
            console.info(`GridBox:${this.boxId}:${subject} >>> `, args)
        }
    }
}
</script>

<style lang="scss">
    .grid-box {
        position: absolute;
        box-sizing: border-box;
        overflow: hidden;
        transform: translate3d(0px, 0px, 0px);
        &.dragging,
        &.resizing {
            z-index: 2;
            opacity: 0.7;
            background: blue;
        }

        &.colliding {
            background: red;
        }

        &:not(.dragging):not(.resizing) {
            transition: transform 800ms ease;
        }

        &.editable {
            .box-content {
                pointer-events: none;
                user-select: none;
            }
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.27);
            border: 1px solid rgba(255, 255, 255, 0.4);
        }
        &:not(.editable) {
            .resize-handle {
                display: none;
            }
        }

        .box-content {
            position: relative;
            width: auto;
            height: 100%;
        }

        .resize-handle {
            position: absolute;
            right: 0;
            bottom: 0;
            border-style: solid;
            border-width: 0 0 15px 15px;
            border-color: transparent transparent #007bff transparent;
            cursor: se-resize;
        }
    }
</style>
