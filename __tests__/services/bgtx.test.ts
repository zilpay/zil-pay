import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import { GlobalState } from "../../background/state";
import { startBackground } from "../../background/background";
import { BrowserStorage } from "../../lib/storage";
import '../setupTests';
import { messageManager } from "../setupTests";
import type { IKeyPair, WalletFromPrivateKeyParams } from "types/wallet";
import { BASE_SETTINGS, createBscTestNetConfig, createZilliqaConfig, createZilliqaTestnetConfig, IMPORTED_KEY, PASSWORD, ZLP } from "__tests__/data";
import { ETHEREUM, ZILLIQA } from "config/slip44";
import { FToken, WalletSettings } from "background/storage";
import { getGlobalState, setGlobalState, walletFromPrivateKey } from "popup/background/wallet";
import type { BuildTokenTransferParams } from "types/tx";
import { buildTokenTransfer, estimateGas, rejectConfirm } from "popup/background/transactions";
import { KeyPair } from "crypto/keypair";
import { hexToUint8Array } from "lib/utils/hex";
import { ftBalanceUpdate } from "popup/background/provider";

describe("WalletService through background messaging with tx service", async () => {
  let globalState: GlobalState;
  const privateKey = hexToUint8Array(IMPORTED_KEY);
  const zilliqaKeyPair: IKeyPair = await (await KeyPair.fromPrivateKey(privateKey, ZILLIQA)).toJSON();
  const bscKeyPair: IKeyPair = await (await KeyPair.fromPrivateKey(privateKey, ETHEREUM)).toJSON();

  beforeEach(async () => {
    await BrowserStorage.clear();
    messageManager.onMessage.clearListeners();
    const statePromise = GlobalState.fromStorage();
    globalState = await statePromise;
    startBackground(statePromise);
  });

  describe("transaction service ZIlliqa network", () => {
    it("test build scilla tx transfer", async () => {
      const zilConfig = createZilliqaTestnetConfig();
      const params: WalletFromPrivateKeyParams = {
        key: zilliqaKeyPair,
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
      const ZIL_CONFIG = createZilliqaConfig();
      const params: WalletFromPrivateKeyParams = {
        key: zilliqaKeyPair,
        walletName: "ZIL Wallet",
        accountName: "ZIL 0",
        chain: ZIL_CONFIG,
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
        logo: '',
        balances: {},
        rate: 0,
        default_: false,
        native: false,
        chainHash: ZIL_CONFIG.hash(),
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
      await ftBalanceUpdate(0);
      state = await getGlobalState();
      const nativeTransferGas = await estimateGas(0, 0,0);

      expect(nativeTransferGas.feeHistory.baseFee).toBe(0n);
      expect(nativeTransferGas.feeHistory.maxFee).greaterThan(0);
      expect(nativeTransferGas.feeHistory.priorityFee).greaterThan(0);
      expect(nativeTransferGas.nonce).toBe(0);
      expect(nativeTransferGas.gasPrice).toBe(4761904800000n);
      expect(nativeTransferGas.txEstimateGas).toBe(21000n);
      expect(nativeTransferGas.maxPriorityFee).toBe(4761904800000n);

      await rejectConfirm(0, 0);
      state = await getGlobalState();

      const txParamsgZIL: BuildTokenTransferParams = {
        walletIndex: 0,
        accountIndex: 0,
        tokenAddr: gZIL.addr,
        to: '0xEC6bB19886c9D5f5125DfC739362Bf54AA23d51F',
        amount: '0',
      };
      await buildTokenTransfer(txParamsgZIL);
      state = await getGlobalState();
      const gzilTransferGas = await estimateGas(0, 0,0);

      expect(gzilTransferGas.feeHistory.baseFee).toBe(0n);
      expect(gzilTransferGas.feeHistory.maxFee).greaterThan(0);
      expect(gzilTransferGas.feeHistory.priorityFee).greaterThan(0);
      expect(gzilTransferGas.nonce).toBe(0);
      expect(gzilTransferGas.gasPrice).toBe(4761904800000n);
      expect(gzilTransferGas.txEstimateGas).toBe(49371n);
      expect(gzilTransferGas.maxPriorityFee).toBe(4761904800000n);
    });
  });

  describe("transaction service binance network", () => {
    it("testing fetch evm gas token trasnfer ERC20 Legacy", async () => {
      const BSC_CONFIG = createBscTestNetConfig();
      const params: WalletFromPrivateKeyParams = {
        key: bscKeyPair,
        walletName: "BSC Wallet",
        accountName: "BSC 0",
        chain: BSC_CONFIG,
        password: PASSWORD,
        settings: new WalletSettings(BASE_SETTINGS),
      };

      let state = await walletFromPrivateKey(params);

      const BUSD = new FToken({
        name: 'Binance USD',
        symbol: 'BUSD',
        decimals: 18,
        addr: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
        addrType: 1,
        logo: '',
        balances: {},
        rate: 0,
        default_: false,
        native: false,
        chainHash: BSC_CONFIG.hash(),
      });
      const txParamsBUSD: BuildTokenTransferParams = {
        walletIndex: 0,
        accountIndex: 0,
        tokenAddr: BUSD.addr,
        to: '0xEC6bB19886c9D5f5125DfC739362Bf54AA23d51F',
        amount: '100',
      };

      state.wallets[0].tokens.push(BUSD);
      await setGlobalState();

      await buildTokenTransfer(txParamsBUSD);
      await ftBalanceUpdate(0);
      state = await getGlobalState();
      const gasBUSD = await estimateGas(0, 0,0);

      expect(gasBUSD.feeHistory.baseFee).toBe(0n);
      expect(gasBUSD.nonce).toBe(1);
      expect(gasBUSD.gasPrice).toBe(100000000n);
      expect(gasBUSD.txEstimateGas).toBe(59808n);
      expect(gasBUSD.maxPriorityFee).toBe(100000000n);
    }, 20000);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
