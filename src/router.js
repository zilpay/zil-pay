import Vue from 'vue'
import Router from 'vue-router'
import Wallet from './stores/wallet'

Vue.use(Router)

function guard(to, from, next) {
  if (Wallet.state.isReady && Wallet.state.isEnable) {
    next();
  } else if (!Wallet.state.isReady) {
    next('create');
  } else if (Wallet.state.isReady && !Wallet.state.isEnable) {
    next('lock');
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
      name: 'First',
      component: () => import('./views/FirstStart')
    },
    {
      path: '/create',
      name: 'Create',
      component: () => import('./views/CreateAcc')
    },
    {
      path: '/lock',
      name: 'Lock',
      component: () => import('./views/LockScreen')
    },
    {
      path: '/home',
      name: 'Home',
      beforeEnter: guard,
      component: () => import('./views/Home')
    },
    {
      path: '/receive',
      name: 'Receive',
      beforeEnter: guard,
      component: () => import('./views/Receive')
    },
    {
      path: '/send',
      name: 'Send',
      beforeEnter: guard,
      component: () => import('./views/Send')
    },
    {
      path: '/accounts',
      name: 'Accounts',
      beforeEnter: guard,
      component: () => import('./views/Accounts')
    },
    {
      path: '/export/:type',
      name: 'Export',
      beforeEnter: guard,
      component: () => import('./views/Export')
    },
    {
      path: '/dapps',
      name: 'DAPP',
      beforeEnter: guard,
      component: () => import('./views/Dapp')
    },
    {
      path: '/popup',
      name: 'Popup',
      beforeEnter: guard,
      component: () => import('./views/Popup')
    },
    {
      path: '/restore',
      name: 'Restore',
      component: () => import('./views/Restore')
    },
    {
      path: '/accounts/import',
      name: 'Import',
      beforeEnter: guard,
      component: () => import('./views/Import')
    },
    {
      path: '/connect',
      name: 'Connect',
      beforeEnter: guard,
      component: () => import('./views/Connect')
    },
    {
      path: '/setting',
      name: 'Setting',
      beforeEnter: guard,
      component: () => import('./views/Setting')
    },
    {
      path: '/setting/general',
      name: 'General',
      beforeEnter: guard,
      component: () => import('./views/General')
    },
    {
      path: '/setting/networks',
      name: 'Networks',
      beforeEnter: guard,
      component: () => import('./views/Networks')
    },
    {
      path: '/setting/advanced',
      name: 'Advanced',
      beforeEnter: guard,
      component: () => import('./views/Advanced')
    },
    {
      path: '/setting/security',
      name: 'Security',
      beforeEnter: guard,
      component: () => import('./views/Security')
    },
    {
      path: '/setting/about',
      name: 'About',
      beforeEnter: guard,
      component: () => import('./views/About')
    }
  ]
})
