import { Common } from "config/common";
import { Runtime } from "lib/runtime";

export function linksExpand(url = '') {
  Runtime.tabs.create({ url: Common.PROMT_PAGE + `#${url}` });
  window.close();
}
