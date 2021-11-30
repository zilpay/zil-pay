/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { Runtime } from 'lib/runtime';
import { Common } from 'config/common'

export default {
  linkToDomain(domain: string) {
    if (!domain.includes('http')) {
      domain = `http://${domain}`;
    }
  
    Runtime.tabs.create({ url: domain });
  }
};

export function linksExpand(url = '') {
  Runtime.tabs.create({ url: Common.PROMT_PAGE + `#${url}` });
  window.close();
}

export function openTab(url: string) {
  Runtime.tabs.create({ url });
}
