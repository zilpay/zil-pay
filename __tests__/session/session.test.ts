import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Session } from '../../background/secure/session';
import { utils } from 'aes-js';
import { Runtime } from '../../lib/runtime';

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

(globalThis as any).chrome.storage.session = sessionStorageMock; 

describe('Session', () => {
  const vaultContent = utils.utf8.toBytes('test vault');
  const sessionTime = 60; 

  it('setSession stores and getVault retrieves content', async () => {
    const session = new Session();
    await session.setSession(sessionTime, vaultContent);
    const result = await session.getVault();
    expect(result).toEqual(vaultContent);
  });

  it('clearSession removes all data', async () => {
    const session = new Session();
    await session.setSession(sessionTime, vaultContent);
    await session.clearSession();
    const result = await session.getVault();
    expect(result).toBeNull();
  });

  it('getVault returns null after session expires', async () => {
    const session = new Session();
    await session.setSession(1, vaultContent); // 1 second
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    const result = await session.getVault();
    expect(result).toBeNull();
    const data = await Runtime.storage.session.get();
    expect(data).toEqual({});
  });
});
