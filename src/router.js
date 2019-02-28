import Vue from 'vue'
import Router from 'vue-router'


Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'lock',
      component: () => import('./views/Lock')
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
