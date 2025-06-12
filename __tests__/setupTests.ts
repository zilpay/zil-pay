import { vi } from "vitest";
import sinonChrome from "sinon-chrome";
import { EXTENSION_ID } from "./data";

global.chrome = sinonChrome;
global.chrome.runtime.id = EXTENSION_ID;

const sessionStorageMock = (() => {
  let store: { [key: string]: any } = {};

  return {
    set: vi.fn(async (items: { [key: string]: any }) => {
      store = { ...store, ...items };
    }),
    get: vi.fn(async (keys?: string | string[] | null) => {
      if (!keys) return store;
      if (typeof keys === 'string') return { [keys]: store[keys] };
      if (Array.isArray(keys)) {
        const result: { [key: string]: any } = {};
        for (const key of keys) {
          result[key] = store[key];
        }
        return result;
      }
      return {};
    }),
    clear: vi.fn(async () => {
      store = {};
    }),
    setAccessLevel: vi.fn(async ({ accessLevel: level }: { accessLevel: string }) => {
      if (level !== 'TRUSTED_CONTEXTS' && level !== 'TRUSTED_AND_UNTRUSTED_CONTEXTS') {
        throw new Error('Invalid access level');
      }
    }),
  };
})();

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

(globalThis as any).chrome.storage.session = sessionStorageMock; 

