import Vue from 'vue'
import Router from 'vue-router'
import Storage from './stroe/storage'


Vue.use(Router);


function guard(to, from, next) {
  if (Storage.state.isReady && Storage.state.isEnable) {
    next();
  } else {
    next(false);
  }
}


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
      beforeEnter: guard,
      component: () => import('./views/Home')
    },
    {
      path: '/settings',
      name: 'settings',
      beforeEnter: guard,
      component: () => import('./views/Settings')
    },
    {
      path: '/send',
      name: 'send',
      beforeEnter: guard,
      component: () => import('./views/Send')
    },
    {
      path: '/confirm',
      name: 'confirmation',
      beforeEnter: guard,
      component: () => import('./views/Confirmation')
    },
    {
      path: '/export/:type',
      name: 'export',
      beforeEnter: guard,
      component: () => import('./views/Export')
    }
  ]
})
