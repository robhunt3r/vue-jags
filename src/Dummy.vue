<template>
    <div>
        <div class="head">
            <h1>Grid Container test</h1>
            <button type="button" :class="{ editable: editGrid }" @click="editGrid = !editGrid">Edit</button>
        </div>

        <GridContainer
                ref="grid"
                :editable="editGrid"
                :layout="layout"
                :tile-size="cellSize"
                :columns="columns"
                :rows="rows"
                :default-size="defaultSize"
                :margin="margin">
            <GridBox v-for="(idx, i) in 3" :key="idx" :box-id="i">
                <h1>{{ i }}</h1>
            </GridBox>
        </GridContainer>
    </div>
</template>

<script>
    import GridContainer from './GridContainer'
    import GridBox from './GridBox'
    export default {
        name: "Dummy.vue",
        components: { GridContainer, GridBox },
        data() {
            return {
                boxes: 2,
                editGrid: false,
                cellSize: {
                    w: 10,
                    h: 10
                },
                defaultSize: {
                    w: 10,
                    h: 10
                },
                columns: Infinity,
                rows: Infinity,
                margin: 5,
                layout: JSON.parse(localStorage.getItem('layout')) || []
            }
        },
    }
</script>

<style lang="scss" scoped>
    .head {
        margin-bottom: 20px;
        h1 {
            color: #777;
            font-family: Helvetica;
        }
    }
    button {
        border: 1px solid rgba(239, 0, 68, 0.4);
        background: rgba(239, 0, 68, 0.2);
        box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.07);
        color: #777;
        font-weight: 900;
        font-size: 12px;
        padding: 4px;
        width: 100px;
        text-align: center;
        &.editable {
            border: 1px solid rgba(0, 239, 0, 0.4);
            background: rgba(0, 239, 0, 0.2);
        }
    }
</style>
