import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import { GlobalState } from "../../background/state";
import { startBackground } from "../../background/background";
import { BrowserStorage } from "../../lib/storage";
import '../setupTests';
import { messageManager } from "../setupTests";
import type { IKeyPair, WalletFromPrivateKeyParams } from "types/wallet";
import { BASE_SETTINGS, createZilliqaConfig, createZilliqaTestnetConfig, IMPORTED_KEY, PASSWORD, ZLP } from "__tests__/data";
import { ZILLIQA } from "config/slip44";
import { FToken, WalletSettings } from "background/storage";
import { getGlobalState, setGlobalState, walletFromPrivateKey } from "popup/background/wallet";
import type { BuildTokenTransferParams } from "types/tx";
import { buildTokenTransfer, estimateGas, rejectConfirm } from "popup/background/transactions";
import { fetchFTMeta } from "popup/background/provider";

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
        walletName: "ZIL Wallet",
        accountName: "ZIL 0",
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

      await rejectConfirm(0, 0);
      state = await getGlobalState();

      state.wallets[0].tokens.push(ZLP);
      await setGlobalState();
      state = await getGlobalState();

      const txParamsZLP: BuildTokenTransferParams = {
        walletIndex: 0,
        accountIndex: 0,
        tokenAddr: ZLP.addr,
        to: 'zil1wl38cwww2u3g8wzgutxlxtxwwc0rf7jf27zace',
        amount: '1',
      };

      await buildTokenTransfer(txParamsZLP);
      state = await getGlobalState();

      expect(state.wallets[0].confirm[0].scilla?.gasLimit).toBe(5000);
      const zlpTransferGas = await estimateGas(0, 0,0);

      expect(zlpTransferGas.blobBaseFee).toBe(0n);
      expect(zlpTransferGas.gasPrice).toBe(2000000016n);
      expect(zlpTransferGas.txEstimateGas).toBe(5000n);
      expect(zlpTransferGas.maxPriorityFee).toBe(0n);
      expect(zlpTransferGas.blobBaseFee).toBe(0n);
      expect(zlpTransferGas.feeHistory.baseFee).toBe(0n);
      expect(zlpTransferGas.feeHistory.maxFee).toBe(0n);
      expect(zlpTransferGas.feeHistory.priorityFee).toBe(0n);
    });

    it("testing fetch evm gas token trasnfer ERC20 Legacy", async () => {
      const zilConfig = createZilliqaConfig();
      const params: WalletFromPrivateKeyParams = {
        key: keyPairZilliqa,
        walletName: "ZIL Wallet",
        accountName: "ZIL 0",
        chain: zilConfig,
        password: PASSWORD,
        settings: new WalletSettings(BASE_SETTINGS),
      };

      let state = await walletFromPrivateKey(params);
      const gZIL = new FToken({
        name: 'Governance ZIL',
        symbol: 'gZIL',
        decimals: 15,
        addr: '0x03A79429acc808e4261a68b0117aCD43Cb0FdBfa',
        addrType: 1,
        logo: 'https://raw.githubusercontent.com/zilpay/tokens_meta/refs/heads/master/ft/zilliqa/%{contract_address}%/%{dark,light}%.webp',
        balances: {},
        rate: 0,
        default_: false,
        native: false,
        chainHash: zilConfig.hash(),
      });

      state.wallets[0].tokens.push(gZIL);
      await setGlobalState();
      const zilToken = state.wallets[0].tokens[0];
      const txParams: BuildTokenTransferParams = {
        walletIndex: 0,
        accountIndex: 0,
        tokenAddr: zilToken.addr,
        to: '0xEC6bB19886c9D5f5125DfC739362Bf54AA23d51F',
        amount: '1',
      };
      await buildTokenTransfer(txParams);
      state = await getGlobalState();
      const nativeTransferGas = await estimateGas(0, 0,0);

      expect(nativeTransferGas.feeHistory.baseFee).toBe(0n);
      expect(nativeTransferGas.feeHistory.maxFee).toBe(0n);
      expect(nativeTransferGas.feeHistory.priorityFee).toBe(0n);
      expect(nativeTransferGas.nonce).toBe(0);
      expect(nativeTransferGas.gasPrice).toBe(4761904800000n);
      expect(nativeTransferGas.txEstimateGas).toBe(21640n);
      expect(nativeTransferGas.maxPriorityFee).toBe(0n);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
