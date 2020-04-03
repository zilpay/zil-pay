/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import fetch from 'cross-fetch'
import { TypeChecker } from 'lib/type'

import { CURRENCIES } from '@/config'
import { changeTheme } from '@/services'

const { document } = global
const THEMES = [
  'auto',
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
    [STATE_NAMES.loading]: false,
    [STATE_NAMES.isConnect]: true,
    [STATE_NAMES.conversionRate]: {
      [CURRENCIES.BTC]: 0,
      [CURRENCIES.USD]: 0
    },
    [STATE_NAMES.selectedTheme]: THEMES[0],
    [STATE_NAMES.themes]: THEMES,
    [STATE_NAMES.local]: {},
    [STATE_NAMES.currentLocal]: 'en'
  },
  mutations: {
    [MUTATIONS_NAMES.setTheme](state, theme) {
      if (state.themes.includes(theme)) {
        state.selectedTheme = theme

        if (theme === THEMES[0]) {
          const hours = new Date().getHours()
          const detected = hours >= 20 ? THEMES[2] : THEMES[1]

          document.body.setAttribute('theme', detected)

          changeTheme(theme)

          return null
        }

        document.body.setAttribute('theme', theme)
        changeTheme(theme)
      }
    },
    [MUTATIONS_NAMES.setLocal](state, data) {
      const { currentLocal } = state

      if (!data || !new TypeChecker(data).isObject) {
        return null
      } else if (!data[currentLocal]) {
        return null
      }

      state[STATE_NAMES.local] = data[currentLocal]
    },
    [MUTATIONS_NAMES.setLoad](state) {
      let spiner = document.querySelector('#spinner')
      let app = document.querySelector('#app')

      if (!spiner || !app) {
        return null
      }

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
