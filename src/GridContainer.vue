<template>
    <div :class="classes" :style="style">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: 'GridContainer',
    props: {
        editable: {
            type: Boolean,
            default: false
        },
        layout: {
            type: Object,
            default () {
                return {}
            }
        },
        defaultSize: {
            type: Object,
            required: false,
            default () {
                return {
                    w: 1,
                    h: 1
                }
            }
        },
        tileSize: {
            type: Object,
            default () {
                return {
                    w: 100,
                    h: 100
                }
            }
        }
    },
    data () {
        return {
            mounted: false,
            layoutCompleted: false,
            cells: new Set()
        }
    },
    computed: {
        layoutSize () {
            let maxRow = this.layoutBoxes.reduce((height, box) => {
                return box.hidden ? height : Math.max(height, box.coords.y + box.coords.h)
            }, 0)

            const maxColumn = this.$el.clientWidth / this.tileSize.w

            if (!maxRow && this.$el.clientHeight) {
                maxRow = this.$el.clientHeight / this.tileSize.h
            }

            return { cols: maxColumn, rows: maxRow, w: maxColumn * this.tileSize.w, h: maxRow * this.tileSize.h }
        },
        classes () {
            return {
                'dnd-grid-container': true,
                'editable': this.editable
            }
        },
        style () {
            if (!this.editable || !this.mounted) {
                return
            }

            let width = `${this.layoutSize.w}px`
            let height = `${this.layoutSize.h}px`

            if (this.layoutSize.h === 0) {
                height = '100%'
            }

            return {
                minWidth: width,
                minHeight: height,
                backgroundSize: `${this.tileSize.w}px ${this.tileSize.h}px`
            }
        },
        /**
         * Returns array of Boxes
         * @returns {Vue[]}
         */
        layoutBoxes () {
            return this.$children.filter(box => box.boxId)
        }
    },
    methods: {
        getLayout () {
            const layout = {}
            this.$children.forEach(box => {
                layout[box.boxId] = box.coords
            })
            return layout
        },
        validatePosition (position) {
            let overColumn, overWidth

            if (position.w > this.layoutSize.cols) {
                position.w = this.layoutSize.cols
            }

            overColumn = (position.x + position.w > this.layoutSize.cols)
            if (overColumn) {
                position.x = this.layoutSize.cols - position.w
            }

            overWidth = (position.x + position.w)> this.layoutSize.cols
            if (overWidth) {
                position.w = this.layoutSize.cols - (position.x + position.w - 1)
            }

            if (position.w < 1) {
                position.w = 1
            }

            if (position.h < 1) {
                position.h = 1
            }

            if (position.y < 0) {
                position.y = 0
            }

            if (position.x < 0) {
                position.x = 0
            }

            return position
        },
        pixelToCell (pixels) {
            return {
                x: Math.floor(pixels.x / this.tileSize.w),
                y: Math.floor(pixels.y / this.tileSize.h)
            }
        },
        cellToPixel (position) {
            return {
                x: (position.x * this.tileSize.w),
                y: (position.y * this.tileSize.h),
                w: (position.w * this.tileSize.w),
                h: (position.h * this.tileSize.h)
            }
        },
        async registerBox (box) {
            box.container = this
            const storedCoords = this.layout[box.boxId]
            if (storedCoords) {
                box.move(storedCoords.coords)
            } else {
                box.move({ ...box.coords, ...this.defaultSize }, true)
            }
            box.registered = true
        }
    },
    mounted () {
        this.$nextTick(() => {
            this.mounted = true
            this.layoutBoxes.forEach(box => {
                this.registerBox(box).then(() => {
                    this.cells.add(box)
                })
            })
        })
    }
}
</script>

<style lang="scss">
    .dnd-grid-container {
        position: relative;
        transition: min-width ease-out 0.1s, min-height ease-out 0.1s;

        &.editable {
            background-image: linear-gradient(to right, rgba(255, 255, 255, .05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, .1) 1px, transparent 1px);
        }

        .dnd-grid-box.placeholder {
            border: 1px dashed #000;
            background: rgba(0, 0, 255, 0.3);
            z-index: 0;
            transition: none !important;
        }
    }
</style>
