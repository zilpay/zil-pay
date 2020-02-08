/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { CURRENCIES } from '@/config'

const { document } = global
const THEMES = [
  'light',
  'dark'
]
const STORE_NAME = 'ui'
const STATE_NAMES = {
  loading: 'loading',
  isConnect: 'isConnect',
  conversionRate: 'conversionRate',
  selectedTheme: 'selectedTheme',
  themes: 'themes'
}
const MUTATIONS_NAMES = {
  setTheme: 'setTheme'
}
const ACTIONS_NAMES = { }
const GETTERS_NAMES = { }
const STORE = {
  namespaced: true,
  state: {
    [STATE_NAMES.loading]: true,
    [STATE_NAMES.isConnect]: true,
    [STATE_NAMES.conversionRate]: {
      [CURRENCIES.BTC]: 0,
      [CURRENCIES.USD]: 0
    },
    [STATE_NAMES.selectedTheme]: THEMES[0],
    [STATE_NAMES.themes]: THEMES
  },
  mutations: {
    [MUTATIONS_NAMES.setTheme](state, theme) {
      if (state.themes.includes(theme)) {
        state.selectedTheme = theme
        document.body.setAttribute('theme', theme)
      }
    }
  },
  actions: {},
  getters: {}
}

export default {
  STORE_NAME,
  STORE,
  STATE_NAMES,
  MUTATIONS_NAMES,
  ACTIONS_NAMES,
  GETTERS_NAMES
}
