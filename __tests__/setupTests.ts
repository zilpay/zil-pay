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
  let store = {}; 

  return {
    get: vi.fn(async (keys) => {
      if (!keys) {
        return Promise.resolve(store);
      }

      const result = {};
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

const matchMediaMock = vi.fn().mockImplementation(query => ({
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
  sendResponse: (response?: any) => void
) => boolean | undefined;

let listeners: MessageListener[] = [];

export const messageManager = {
  sendMessage: vi.fn(async (message: any, callback?: (response: any) => void) => {
    const sender: chrome.runtime.MessageSender = { id: EXTENSION_ID };
    
    await new Promise(resolve => setTimeout(resolve, 0));

    for (const listener of listeners) {
      const sendResponse = (response: any) => {
        if (callback) {
          callback(response);
        }
      };
      
      listener(message, sender, sendResponse);
    }
  }),
  
  onMessage: {
    addListener: vi.fn((listener: MessageListener) => {
      listeners.push(listener);
    }),
    removeListener: vi.fn((listenerToRemove: MessageListener) => {
      listeners = listeners.filter(listener => listener !== listenerToRemove);
    }),
    clearListeners: () => {
      listeners = [];
    },
  },
};

sinonChrome.runtime.getManifest.returns({ manifest_version: 3 });

Object.defineProperty(global.chrome.runtime, "sendMessage", {
  value: messageManager.sendMessage,
});

Object.defineProperty(global.chrome.runtime, "onMessage", {
  value: messageManager.onMessage,
});
