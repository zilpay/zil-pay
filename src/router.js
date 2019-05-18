import Vue from 'vue'
import Router from 'vue-router'


Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Lock',
      component: () => import('./views/LockScreen')
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('./views/Home')
    },
    {
      path: '/setting',
      name: 'Setting',
      component: () => import('./views/Setting')
    },
    {
      path: '/receive',
      name: 'Receive',
      component: () => import('./views/Receive')
    }
  ]
})
