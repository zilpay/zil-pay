import { ZILLIQA } from "config/slip44";
import { Runtime } from "lib/runtime";

const { document } = globalThis;

export function inject(name: string) {
  const container = document.head || document.documentElement;
  const scriptTag = document.createElement("script");
  const src = Runtime.runtime.getURL(`/${name}`);

  scriptTag.setAttribute("async", "false");
  scriptTag.src = src;
  container.insertBefore(scriptTag, container.children[0]);
  container.removeChild(scriptTag);
}

export function injectBySlip44(slip44?: number) {
  if (slip44) {
    switch (Number(slip44)) {
      case ZILLIQA:
        inject('injects/zilpay.js');
        break;
      default:
        break;
    }
  }
}
