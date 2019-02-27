import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home'
import Create from './views/Create'
import LockPage from './views/LockPage'
import Settings from './views/Settings'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'lockpage',
      component: LockPage
    },
    {
      path: '/create',
      name: 'create',
      component: Create
    },
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
})
