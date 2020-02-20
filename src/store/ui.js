/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import fetch from 'cross-fetch'

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
  themes: 'themes',
  local: 'local',
  currentLocal: 'currentLocal'
}
const MUTATIONS_NAMES = {
  setTheme: 'setTheme',
  setLocal: 'setLocal',
  setLoad: 'setLoad'
}
const ACTIONS_NAMES = {
  onLocal: 'onLocal'
}
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
    [STATE_NAMES.themes]: THEMES,
    [STATE_NAMES.local]: {},
    [STATE_NAMES.currentLocal]: 'en',
    [STATE_NAMES.loading]: true
  },
  mutations: {
    [MUTATIONS_NAMES.setTheme](state, theme) {
      if (state.themes.includes(theme)) {
        state.selectedTheme = theme
        document.body.setAttribute('theme', theme)
      }
    },
    [MUTATIONS_NAMES.setLocal](state, data) {
      const { currentLocal } = state

      if (!data || typeof data !== 'object') {
        return null
      } else if (!data[currentLocal]) {
        return null
      }

      state[STATE_NAMES.local] = data[currentLocal]
    },
    [MUTATIONS_NAMES.setLoad](state) {
      let spiner = document.querySelector('#spinner')
      let app = document.querySelector('#app')

      state[STATE_NAMES.loading] = !state[STATE_NAMES.loading]

      if (state.loading) {
        spiner.style.display = 'block'
        spiner.className = 'isLoad'
        app.style.filter = 'blur(5px)'
      } else {
        app.style.filter = null
        spiner.className = null
        spiner.style.display = 'none'
      }
    }
  },
  actions: {
    async [ACTIONS_NAMES.onLocal]({ commit }) {
      const res = await fetch('/localisation.json')
      const data = await res.json()

      commit(MUTATIONS_NAMES.setLocal, data)
    }
  },
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
