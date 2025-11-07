import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
    getGlobalState,
  setGlobalState,
  walletFromLedger,
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
import { ETHEREUM, ZILLIQA } from "../../config/slip44";
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

  describe("Keypair Wallet change network", () => {
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

  describe("ledger scilla legacy Wallet change network", () => {
    const ZIL_CHAIN = createZilliqaTestnetConfig();
    const BSC_CHAIN = createBscConfig();
    const LEDGER_PAYLOAD = {
      walletName: "Ledger wallet",
      accounts: [{
        pubAddr: "0x709678c07cfCAFB4bb49a6b1d57b1db378e27825",
        publicKey: keyPairZilliqa.publicKey,
        index: 0,
        name: "nano x 1",
        slip44: ETHEREUM,
      }],
      chain: ZIL_CHAIN,
        settings: new WalletSettings(BASE_SETTINGS),
    };

    it("should test swich network for ledger wallet", async () => {
      let state = await walletFromLedger(LEDGER_PAYLOAD);

      expect(state.wallets[0].tokens).toHaveLength(1);
      expect(state.wallets[0].accounts).toHaveLength(1);
      expect(state.wallets[0].selectedAccount).toBe(0);

      let wallet = state.wallets[state.selectedWallet];
      let account = wallet.accounts[wallet.selectedAccount];

      expect(account.addrType).toBe(AddressType.EthCheckSum);
      expect(account.chainHash).toBe(ZIL_CHAIN.hash());
      expect(account.chainId).toBe(ZIL_CHAIN.chainId);
      expect(account.slip44).toBe(ETHEREUM);
      expect(account.index).toBe(0);

      state.chains.push(BSC_CHAIN);
      await setGlobalState();
      await changeChainProvider(0, 1);

      state = await getGlobalState();
      wallet = state.wallets[state.selectedWallet];
      account = wallet.accounts[wallet.selectedAccount];

      expect(account.addrType).toBe(AddressType.EthCheckSum);
      expect(account.chainHash).toBe(BSC_CHAIN.hash());
      expect(account.chainId).toBe(BSC_CHAIN.chainId);
      expect(account.slip44).toBe(ETHEREUM);
      expect(account.index).toBe(0);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
