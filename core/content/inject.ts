/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { getExtensionURL, Runtime } from 'lib/runtime';

const { document } = globalThis;

export async function inject(name: string) {
  // const s = document.createElement('script');
  // s.src = getExtensionURL(`/${name}`);
  // s.type = "module";
  // s.onload = () => s.remove();
  // console.log(s.src);
  // (document.head || document.documentElement).append(s);

  // chrome.scripting
  //   .executeScript({
  //     target: { tabId: getTabId() },
  //     files: ["inpage.js"],
  //   })
  //   .then(() => console.log("script injected"));
}
