import './setupTests';
import { describe, it, expect, beforeAll } from "vitest";
import { GlobalState } from '../background/state';
import { BackgroundState } from '../background/storage/background';
import { STORAGE_V2 } from './data'; 
import { BrowserStorage } from '../lib/storage';

describe("test bg state with empty storage", () => {
    beforeAll(async () => {
        await BrowserStorage.clear();
    });

    it("should sync emtpy storage", async () => {
      const globalState = await GlobalState.fromStorage();
      expect(globalState.state).toStrictEqual(BackgroundState.default());
    });
});

describe("test bg state with storagev2", () => {
    beforeAll(async () => {
        await BrowserStorage.clear(); 
        await BrowserStorage.set(STORAGE_V2); 
    });

    it("should init from storage v2", async () => {
      const globalState = await GlobalState.fromStorage();
      console.log(globalState.state.wallets);
      expect(globalState.state.chains.length).toBe(1);
    });
});

