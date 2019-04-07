import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import Dropdown from 'bootstrap-vue/es/components/dropdown'
import Tooltip from 'bootstrap-vue/es/components/tooltip'


Vue.use(Tooltip)
Vue.use(Dropdown)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
