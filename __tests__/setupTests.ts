import { vi } from "vitest";
import sinonChrome from "sinon-chrome";
import { EXTENSION_ID } from "./data";

global.chrome = sinonChrome;
global.chrome.runtime.id = EXTENSION_ID;

const mockGetRandomValues = (array: Uint8Array): Uint8Array => {
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
};

(global as any).window = {
  crypto: {
    getRandomValues: vi.fn(mockGetRandomValues),
  },
};
