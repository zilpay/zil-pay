import type { IChainConfigState } from "background/storage";
import { Common } from "config/common";
import { Runtime } from "lib/runtime";

export function linksExpand(url = '') {
  Runtime.tabs.create({ url: Common.PROMT_PAGE + `#${url}` });
  window.close();
}

export function openAddressInExplorer(address: string, chainConfig: IChainConfigState) {
  if (!chainConfig.explorers || chainConfig.explorers.length === 0) {
    return;
  }

  const explorer = chainConfig.explorers[0];
  const baseUrl = explorer.url.endsWith('/') 
    ? explorer.url.slice(0, -1) 
    : explorer.url;
  
  const url = `${baseUrl}/address/${address}`;
  Runtime.tabs.create({ url });
}
