import { Runtime } from "./extensionizer";

export function getExtensionURL(content: string) {
  return Runtime.runtime.getURL(content);
}

