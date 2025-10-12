import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import { GlobalState } from "../../background/state";
import { startBackground } from "../../background/background";
import { BrowserStorage } from "../../lib/storage";
import '../setupTests';
import { messageManager } from "../setupTests";
import type { IKeyPair, WalletFromPrivateKeyParams } from "types/wallet";
import { BASE_SETTINGS, createZilliqaConfig, createZilliqaTestnetConfig, IMPORTED_KEY, PASSWORD } from "__tests__/data";
import { ZILLIQA } from "config/slip44";
import { WalletSettings } from "background/storage";
import { getGlobalState, walletFromPrivateKey } from "popup/background/wallet";
import type { BuildTokenTransferParams } from "types/tx";
import { buildTokenTransfer, estimateGas } from "popup/background/transactions";

describe("WalletService through background messaging with tx service", () => {
  let globalState: GlobalState;
    const keyPairZilliqa: IKeyPair = {
      privateKey: IMPORTED_KEY,
      publicKey:
        "0232970d0472220180c1779610f0ffae5a1ad79048b4f01f366c52d99317534024",
      address: "zil14at57zaj4pe3tuy734usy2xnlquapkd4d0ne43",
      slip44: ZILLIQA,
    };


  beforeEach(async () => {
    await BrowserStorage.clear();
    messageManager.onMessage.clearListeners();
    globalState = await GlobalState.fromStorage();
    startBackground(globalState);
  });

  describe("transaction service", () => {
    it("test build scilla tx transfer", async () => {
      const zilConfig = createZilliqaTestnetConfig();
      const params: WalletFromPrivateKeyParams = {
        key: keyPairZilliqa,
        walletName: "My Imported Wallet",
        accountName: "Imported Account",
        chain: zilConfig,
        password: PASSWORD,
        settings: new WalletSettings(BASE_SETTINGS),
      };

      let state = await walletFromPrivateKey(params);

      const token = state.wallets[0].tokens[1];
      const txParams: BuildTokenTransferParams = {
        walletIndex: 0,
        accountIndex: 0,
        tokenAddr: token.addr,
        to: 'zil1wl38cwww2u3g8wzgutxlxtxwwc0rf7jf27zace',
        amount: '1',
      };

      await buildTokenTransfer(txParams);
      state = await getGlobalState();

      const gas = await estimateGas(0, 0,0);

      expect(gas.blobBaseFee).toBe(0n);
      expect(gas.gasPrice).toBe(2000000016n);
      expect(gas.txEstimateGas).toBe(50n);
      expect(gas.maxPriorityFee).toBe(0n);
      expect(gas.blobBaseFee).toBe(0n);
      expect(gas.feeHistory.baseFee).toBe(0n);
      expect(gas.feeHistory.maxFee).toBe(0n);
      expect(gas.feeHistory.priorityFee).toBe(0n);
    });

    it("should generate a valid BIP39 mnemonic phrase", async () => {
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
