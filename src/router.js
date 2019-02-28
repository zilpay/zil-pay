import Vue from 'vue'
import Router from 'vue-router'
import LockPage from './views/LockPage'


Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'lock',
      component: LockPage
    },
    {
      path: '/create',
      name: 'create',
      component: () => import('./views/Create')
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('./views/Home')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('./views/Settings')
    }
  ]
})
