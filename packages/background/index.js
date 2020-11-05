/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import extension from 'extensionizer'

import { Background } from './background'

new Background()

extension.webRequest.onBeforeRequest.addListener(
  (req) => {
    console.log(req)

    return {
      redirectUrl: 'http://dragoneth.com/'
    }
  },
  {
    urls: ['<all_urls>'],
    types: ['main_frame']
  }
)
