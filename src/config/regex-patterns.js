/* eslint-disable no-useless-escape */
/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
export const REGX_PATTERNS = {
  password: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])./,
  domain: /.*\w.zil/gm,
  // eslint-disable-next-line max-len
  url: /(?:(?:https?|http|ws|wss):\/\/)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/
}
