/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { Runtime } from 'lib/runtime';

export default {
  linkToDomain(domain: string) {
    if (!domain.includes('http')) {
      domain = `http://${domain}`;
    }
  
    Runtime.tabs.create({ url: domain });
  }
};
