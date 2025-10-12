import { describe, it, beforeEach, afterEach, vi } from "vitest";
import { GlobalState } from "../../background/state";
import { startBackground } from "../../background/background";
import { BrowserStorage } from "../../lib/storage";
import '../setupTests';
import { messageManager } from "../setupTests";

describe("WalletService through background messaging with tx service", () => {
  let globalState: GlobalState;

  beforeEach(async () => {
    await BrowserStorage.clear();
    messageManager.onMessage.clearListeners();
    globalState = await GlobalState.fromStorage();
    startBackground(globalState);
  });

  describe("transaction service", () => {
    it("should generate a valid BIP39 mnemonic phrase", async () => {
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
