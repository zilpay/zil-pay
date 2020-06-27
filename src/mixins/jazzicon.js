/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Jazzicon from 'jazzicon'

const { window } = global

export default {
  methods: {
    jazziconCreate(id, address) {
      let ctx = window.document.getElementById(id)

      if (!ctx) {
        return null
      }

      let el = Jazzicon(30, this.jsNumberForAddress(address))

      if (ctx.children.length > 0) {
        ctx.children[0].remove()
      }

      ctx.appendChild(el)
    },
    jsNumberForAddress(address) {
      const addr = address.slice(2, 10)

      return parseInt(addr, 16)
    }
  }
}
