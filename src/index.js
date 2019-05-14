import GridContainer from './GridContainer'
import GridBox from './GridBox'

export default {
    install (Vue) {
        Vue.component('GridContainer', GridContainer)
        Vue.component('GridBox', GridBox)
    }
}
