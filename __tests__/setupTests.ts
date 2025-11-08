import { vi } from "vitest";
import sinonChrome from "sinon-chrome";
import { EXTENSION_ID } from "./data";
import mainnetChains from "../public/chains/mainnet.json";
import testnetChains from "../public/chains/testnet.json";

global.chrome = sinonChrome as any;
global.chrome.runtime.id = EXTENSION_ID;

const sessionStorageMock = (() => {
  let store: { [key: string]: any } = {};

  return {
    set: vi.fn(async (items: { [key: string]: any }) => {
      store = { ...store, ...items };
    }),
    get: vi.fn(async (keys?: string | string[] | null) => {
      if (!keys) return store;
      if (typeof keys === "string") return { [keys]: store[keys] };
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
    setAccessLevel: vi.fn(
      async ({ accessLevel: level }: { accessLevel: string }) => {
        if (
          level !== "TRUSTED_CONTEXTS" &&
          level !== "TRUSTED_AND_UNTRUSTED_CONTEXTS"
        ) {
          throw new Error("Invalid access level");
        }
      },
    ),
  };
})();

const createLocalStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    get: vi.fn(async (keys) => {
      if (!keys) {
        return Promise.resolve(store);
      }

      const result: Record<string, string> = {};
      const keyList = Array.isArray(keys) ? keys : [keys];

      for (const key of keyList) {
        if (store.hasOwnProperty(key)) {
          result[key] = store[key];
        }
      }

      return Promise.resolve(result);
    }),

    set: vi.fn(async (items) => {
      store = { ...store, ...items };
      return Promise.resolve();
    }),

    clear: vi.fn(async () => {
      store = {};
      return Promise.resolve();
    }),
  };
};

const mockGetRandomValues = (array: Uint8Array): Uint8Array => {
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
};

const matchMediaMock = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

const localStorageMock = createLocalStorageMock();

(global as any).window = {
  crypto: {
    getRandomValues: vi.fn(mockGetRandomValues),
  },
  matchMedia: matchMediaMock,
};
globalThis.matchMedia = matchMediaMock;

(globalThis as any).chrome.storage.session = sessionStorageMock;
Object.defineProperty(global.chrome.storage, "local", {
  value: localStorageMock,
  writable: true,
});

type MessageListener = (
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
) => boolean | undefined;

let listeners: MessageListener[] = [];

export const messageManager = {
  sendMessage: vi.fn(
    async (message: any, callback?: (response: any) => void) => {
      const sender: chrome.runtime.MessageSender = { id: EXTENSION_ID };

      await new Promise((resolve) => setTimeout(resolve, 0));

      for (const listener of listeners) {
        const sendResponse = (response: any) => {
          if (callback) {
            callback(response);
          }
        };

        listener(message, sender, sendResponse);
      }
    },
  ),

  onMessage: {
    addListener: vi.fn((listener: MessageListener) => {
      listeners.push(listener);
    }),
    removeListener: vi.fn((listenerToRemove: MessageListener) => {
      listeners = listeners.filter((listener) => listener !== listenerToRemove);
    }),
    clearListeners: () => {
      listeners = [];
    },
  },
};

sinonChrome.runtime.getManifest.returns({ manifest_version: 2 });

Object.defineProperty(global.chrome.runtime, "sendMessage", {
  value: messageManager.sendMessage,
});

Object.defineProperty(global.chrome.runtime, "onMessage", {
  value: messageManager.onMessage,
});

const tabsManager = {
  query: vi.fn(async (_queryInfo: chrome.tabs.QueryInfo) => {
    const mockTab: chrome.tabs.Tab = {
      id: 1,
      index: 0,
      pinned: false,
      highlighted: false,
      windowId: 1,
      active: true,
      incognito: false,
      selected: true,
      discarded: false,
      autoDiscardable: false,
      groupId: -1,
      url: "https://test.example.com",
      frozen: false,
    };
    return Promise.resolve([mockTab]);
  }),
  sendMessage: vi.fn(async (_tabId: number, _message: any) => {
    return Promise.resolve();
  }),
};

Object.defineProperty(global.chrome, "tabs", {
  value: tabsManager,
  writable: true,
});

const nativeFetch = globalThis.fetch;
(globalThis as any).fetch = vi.fn((url: string, options: any) => {
  if (url.endsWith("/chains/mainnet.json")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mainnetChains),
    } as Response);
  }

  if (url.endsWith("/chains/testnet.json")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(testnetChains),
    } as Response);
  }

  return nativeFetch(url, options);
});
