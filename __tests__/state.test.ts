import './setupTests';
import { describe, it, expect } from "vitest";
import { GlobalState } from '../background/state';
import { BackgroundState } from '../background/storage/background';

describe("test bg state", () => {
    it("should sync emtpy storage", async () => {
      const globalState = await GlobalState.fromStorage();
      expect(globalState.state).toStrictEqual(BackgroundState.default());
    });
});
