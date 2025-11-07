import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
    getGlobalState,
  setGlobalState,
  walletFromPrivateKey,
} from "../../popup/background/wallet";
import { GlobalState } from "../../background/state";
import { startBackground } from "../../background/background";
import { BrowserStorage } from "../../lib/storage";
import {
    BASE_SETTINGS,
  createBscConfig,
  createZilliqaTestnetConfig,
  IMPORTED_KEY,
  PASSWORD,
} from "../data";
import { ZILLIQA } from "../../config/slip44";
import type {
  IKeyPair,
  WalletFromPrivateKeyParams,
} from "../../types/wallet";
import { WalletSettings } from "../../background/storage";
import '../setupTests';
import { messageManager } from "../setupTests";
import { AddressType } from "config/wallet";
import { changeChainProvider } from "popup/background/provider";

describe("WalletService through background messaging", () => {
  let globalState: GlobalState;

  beforeEach(async () => {
    await BrowserStorage.clear();
    messageManager.onMessage.clearListeners();
    globalState = await GlobalState.fromStorage();
    startBackground(globalState);
  });

  describe("Wallet change network", () => {
    const keyPairZilliqa: IKeyPair = {
      privateKey: IMPORTED_KEY,
      publicKey:
        "0232970d0472220180c1779610f0ffae5a1ad79048b4f01f366c52d99317534024",
      address: "zil14at57zaj4pe3tuy734usy2xnlquapkd4d0ne43",
      slip44: ZILLIQA,
    };
    const ZIL_CHAIN = createZilliqaTestnetConfig();
    const BSC_CHAIN = createBscConfig();

    it("should create a new wallet from a private key", async () => {
      const params: WalletFromPrivateKeyParams = {
        key: keyPairZilliqa,
        walletName: "My Imported Wallet",
        accountName: "Imported Account",
        chain: ZIL_CHAIN,
        password: PASSWORD,
        settings: new WalletSettings(BASE_SETTINGS),
      };

      let state = await walletFromPrivateKey(params);
      expect(state.wallets[0].tokens).toHaveLength(2);
      expect(state.wallets[0].accounts).toHaveLength(1);
      expect(state.wallets[0].selectedAccount).toBe(0);

      let wallet = state.wallets[state.selectedWallet];
      let account = wallet.accounts[wallet.selectedAccount];

      expect(account.addr).toBe("zil14at57zaj4pe3tuy734usy2xnlquapkd4d0ne43:0x709678c07cfCAFB4bb49a6b1d57b1db378e27825");
      expect(account.addrType).toBe(AddressType.Bech32);
      expect(account.pubKey).toBe(keyPairZilliqa.publicKey);
      expect(account.chainHash).toBe(ZIL_CHAIN.hash());
      expect(account.chainId).toBe(ZIL_CHAIN.chainId);
      expect(account.slip44).toBe(ZIL_CHAIN.slip44);

      state = await getGlobalState();

      state.chains.push(BSC_CHAIN);

      await setGlobalState();

      expect(state.chains).toHaveLength(2);

      await changeChainProvider(0, 1);

      state = await getGlobalState();
      wallet = state.wallets[state.selectedWallet];
      account = wallet.accounts[wallet.selectedAccount];

      expect(state.wallets[0].tokens).toHaveLength(1);
      expect(account.addr).toBe("0x709678c07cfCAFB4bb49a6b1d57b1db378e27825");
      expect(account.addrType).toBe(AddressType.EthCheckSum);
      expect(account.pubKey).toBe(keyPairZilliqa.publicKey);
      expect(account.chainHash).toBe(BSC_CHAIN.hash());
      expect(account.chainId).toBe(BSC_CHAIN.chainId);
      expect(account.slip44).toBe(BSC_CHAIN.slip44);

      await changeChainProvider(0, 0);

      state = await getGlobalState();
      wallet = state.wallets[state.selectedWallet];
      account = wallet.accounts[wallet.selectedAccount];

      expect(state.wallets[0].tokens).toHaveLength(2);

      expect(account.addr).toBe("zil14at57zaj4pe3tuy734usy2xnlquapkd4d0ne43:0x709678c07cfCAFB4bb49a6b1d57b1db378e27825");
      expect(account.addrType).toBe(AddressType.Bech32);
      expect(account.pubKey).toBe(keyPairZilliqa.publicKey);
      expect(account.chainHash).toBe(ZIL_CHAIN.hash());
      expect(account.chainId).toBe(ZIL_CHAIN.chainId);
      expect(account.slip44).toBe(ZIL_CHAIN.slip44);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
