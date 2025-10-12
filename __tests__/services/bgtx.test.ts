import type { BuildTokenTransferParams } from '../../types/tx';
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  generateBip39Words,
  generateKeyPair,
  getGlobalState,
  logout,
  unlockWallet,
  validateBip39Checksum,
  walletFromBip39Mnemonic,
  walletFromPrivateKey,
} from "../../popup/background/wallet";
import { GasSpeed } from '../../config/gas';
import { changeChainProvider } from "../../popup/background/provider";
import { buildTokenTransfer, rejectConfirm } from "../../popup/background/transactions";
import { GlobalState } from "../../background/state";
import { startBackground } from "../../background/background";
import { BrowserStorage } from "../../lib/storage";
import {
  CHAINS,
  createEthConfig,
  IMPORTED_KEY,
  PASSWORD,
  WORDS,
} from "../data";
import { WORD_LIST } from '../crypto/word_list';
import { ZILLIQA, ETHEREUM } from "../../config/slip44";
import { AddressType, WalletTypes } from "../../config/wallet";
import type {
  IKeyPair,
  WalletFromBip39Params,
  WalletFromPrivateKeyParams,
} from "../../types/wallet";
import { FToken, type IWalletSettingsState, WalletSettings } from "../../background/storage";
import { CipherOrders } from "../../crypto/keychain";
import { HashTypes } from "../../background/storage";
import { ShaAlgorithms } from "../../config/pbkdf2";
import '../setupTests';
import { messageManager } from "../setupTests";

describe("WalletService through background messaging", () => {
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
