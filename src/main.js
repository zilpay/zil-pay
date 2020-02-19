/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Vue from 'vue'
import App from '@/App.vue'
import router from './router'
import store from './store'
import Tooltip from 'vue-directive-tooltip'
import TreeView from 'vue-json-tree-view'
import vueBemCn from 'vue-bem-cn'

import { BEM_CONFIG } from '@/config'

Vue.config.productionTip = false

Vue.use(vueBemCn, { delimiters: BEM_CONFIG })
Vue.use(Tooltip)
Vue.use(TreeView)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
