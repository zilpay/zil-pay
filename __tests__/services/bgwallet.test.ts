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
import { WalletTypes } from "../../config/wallet";
import type {
  IKeyPair,
  WalletFromBip39Params,
  WalletFromPrivateKeyParams,
} from "../../types/wallet";
import { FToken, IWalletSettingsState, WalletSettings } from "../../background/storage";
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

  describe("Mnemonic and Key Generation", () => {
    it("should generate a valid BIP39 mnemonic phrase", async () => {
      const wordCount = 12;
      const phrase = await generateBip39Words(wordCount, WORD_LIST);
      expect(typeof phrase).toBe("string");
      expect(phrase.split(" ")).toHaveLength(wordCount);
    });

    it("should validate a correct BIP39 checksum", async () => {
      const isValid = await validateBip39Checksum(WORDS, WORD_LIST);
      expect(isValid).toBe(true);
    });

    it("should reject an incorrect BIP39 checksum", async () => {
      const invalidPhrase = "rule hard brush glare magic east glimpse tank junk will media wrong";
      expect(
        await validateBip39Checksum(invalidPhrase, WORD_LIST)
      ).toBe(false);
    });

    it("should generate a key pair for Zilliqa", async () => {
      const keyPair = await generateKeyPair(ZILLIQA);
      expect(keyPair).toHaveProperty("address");
      expect(keyPair.address).toMatch(/^zil1/);
      expect(keyPair).toHaveProperty("privateKey");
      expect(keyPair).toHaveProperty("publicKey");
      expect(keyPair.slip44).toBe(ZILLIQA);
    });

    it("should generate a key pair for Ethereum", async () => {
      const keyPair = await generateKeyPair(ETHEREUM);
      expect(keyPair).toHaveProperty("address");
      expect(keyPair.address).toMatch(/^0x/);
      expect(keyPair).toHaveProperty("privateKey");
      expect(keyPair).toHaveProperty("publicKey");
      expect(keyPair.slip44).toBe(ETHEREUM);
    });
  });

  describe("Wallet Creation", () => {
    const baseSettings: IWalletSettingsState = {
      gasOption: GasSpeed.Market,
      cipherOrders: [CipherOrders.AESGCM256],
      hashFnParams: {
        memory: 64,
        iterations: 1,
        threads: 1,
        secret: "",
        hashType: HashTypes.Argon2,
        hashSize: ShaAlgorithms.sha256,
      },
      currencyConvert: "btc",
      ipfsNode: null,
      ensEnabled: false,
      tokensListFetcher: false,
      nodeRankingEnabled: false,
      maxConnections: 10,
      requestTimeoutSecs: 30,
      ratesApiOptions: 0,
      sessionTime: 60,
    };
    const keyPairZilliqa: IKeyPair = {
      privateKey: IMPORTED_KEY,
      publicKey:
        "0232970d0472220180c1779610f0ffae5a1ad79048b4f01f366c52d99317534024",
      address: "zil14at57zaj4pe3tuy734usy2xnlquapkd4d0ne43",
      slip44: ZILLIQA,
    };

    it("should create a new wallet from a private key", async () => {
      const params: WalletFromPrivateKeyParams = {
        key: keyPairZilliqa,
        walletName: "My Imported Wallet",
        accountName: "Imported Account",
        chain: CHAINS[0],
        password: PASSWORD,
        settings: new WalletSettings(baseSettings),
      };

      let state = await walletFromPrivateKey(params);

      expect(state.wallets).toHaveLength(1);
      const wallet = state.wallets[0];
      expect(wallet.walletName).toBe("My Imported Wallet");
      expect(wallet.walletType).toBe(WalletTypes.SecretKey);
      expect(wallet.accounts).toHaveLength(1);
      expect(wallet.accounts[0].name).toBe("Imported Account");
      expect(wallet.accounts[0].addr).toBe(keyPairZilliqa.address);
      expect(state.selectedWallet).toBe(0);

      state = await logout(0);
      expect(state.selectedWallet).toBe(-1);
      state = await unlockWallet(PASSWORD, 0);
      expect(state.selectedWallet).toBe(0);
    });

    it("test create scilla tx", async () => {
      const params: WalletFromPrivateKeyParams = {
        key: keyPairZilliqa,
        walletName: "My Imported Wallet",
        accountName: "Imported Account",
        chain: CHAINS[0],
        password: PASSWORD,
        settings: new WalletSettings(baseSettings),
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

      const confirm = state.wallets[0].confirm[0];
      const account = state.wallets[0].accounts[0];

      expect(confirm.metadata.chainHash).toBe(account.chainHash);
      expect(confirm.metadata.token.name).toBe(token.name);
      expect(confirm.metadata.token.symbol).toBe(token.symbol);
      expect(confirm.metadata.token.addr).toBe(token.addr);
      expect(confirm.metadata.token.value).toBe(txParams.amount);
      expect(confirm.metadata.token.recipient).toBe(txParams.to);

      expect(confirm.evm).toBeUndefined();
      expect(confirm.signMessageScilla).toBeUndefined();
      expect(confirm.signPersonalMessageEVM).toBeUndefined();
      expect(confirm.signTypedDataJsonEVM).toBeUndefined();

      expect(confirm.scilla.chainId).toBe(1);
      expect(confirm.scilla.toAddr).toBe("77e27c39ce572283b848e2cdf32cce761e34fa49");
      expect(confirm.scilla.amount).toBe('1');
    });

    it("test create EVM wallet, send tokens", async () => {
      const ethNetConfig = createEthConfig();
      const params: WalletFromPrivateKeyParams = {
        key: keyPairZilliqa,
        walletName: "My ETH Wallet",
        accountName: "ETH 0",
        chain: ethNetConfig,
        password: PASSWORD,
        settings: new WalletSettings(baseSettings),
      };

      let state = await walletFromPrivateKey(params);
      const token = state.wallets[0].tokens[0];

      const txParams: BuildTokenTransferParams = {
        walletIndex: 0,
        accountIndex: 0,
        tokenAddr: token.addr,
        to: '0xEC6bB19886c9D5f5125DfC739362Bf54AA23d51F',
        amount: '1',
      };

      await buildTokenTransfer(txParams);
      state = await getGlobalState();
      const confirm = state.wallets[0].confirm[0];
      const account = state.wallets[0].accounts[0];

      expect(confirm.metadata.chainHash).toBe(account.chainHash);
      expect(confirm.metadata.token.name).toBe(ethNetConfig.ftokens[0].name);
      expect(confirm.metadata.token.symbol).toBe(ethNetConfig.ftokens[0].symbol);
      expect(confirm.metadata.token.addr).toBe(ethNetConfig.ftokens[0].addr);
      expect(confirm.metadata.token.value).toBe(txParams.amount);
      expect(confirm.metadata.token.recipient).toBe(txParams.to);

      expect(confirm.scilla).toBeUndefined();
      expect(confirm.signMessageScilla).toBeUndefined();
      expect(confirm.signPersonalMessageEVM).toBeUndefined();
      expect(confirm.signTypedDataJsonEVM).toBeUndefined();

      expect(confirm.evm.chainId).toBe(1);
      expect(confirm.evm.to).toBe(txParams.to);
      expect(confirm.evm.value).toBe(txParams.amount);
    });

    it("should create a new wallet from a BIP39 mnemonic", async () => {
      const bip39Params: WalletFromBip39Params = {
        mnemonic: WORDS,
        bip39WordList: WORD_LIST,
        walletName: "My BIP39 Wallet",
        accounts: [{ index: 0, name: "Main Account" }],
        verifyCheckSum: true,
        chain: CHAINS[0],
        password: PASSWORD,
        settings: new WalletSettings(baseSettings),
      };

      let state = await walletFromBip39Mnemonic(bip39Params);

      expect(state.wallets).toHaveLength(1);
      let wallet = state.wallets[0];
      expect(wallet.walletName).toBe("My BIP39 Wallet");
      expect(wallet.walletType).toBe(WalletTypes.SecretPhrase);
      expect(wallet.accounts).toHaveLength(1);
      expect(wallet.accounts[0].name).toBe("Main Account");
      expect(wallet.accounts[0].addr).toBe(
        "zil1ntrynx04349sk6py7uyata03gka6qswg7um95y"
      );
      expect(wallet.accounts[0].slip44).toBe(state.chains[0].slip44);
      expect(wallet.accounts[0].chainId).toBe(state.chains[0].chainId);
      expect(wallet.accounts[0].chainHash).toBe(state.chains[0].hash());
      expect(state.selectedWallet).toBe(0);
      expect(state.chains[0].testnet).toBeFalsy();
      expect(state.chains[0].fallbackEnabled).toBeTruthy();
      expect(state.chains[0].ftokens.length).toBe(2);
      expect(state.chains[0].slip44).toBe(313);
      expect(state.chains[0].chainIds).toEqual([32769, 1]);
      expect(state.chains[0].chainId).toBe(32769);

      await globalState.wallet.setGlobalState(state, () => null);

      const zlp = new FToken({
        name: 'ZilPay wallet',
        symbol: 'ZLP',
        decimals: 18,
        addr: 'zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4',
        addrType: 0,
        logo: '',
        balances: {},
        rate: 0,
        default_: false,
        native: false,
        chainHash: 208425510
      });

      wallet.tokens.push(zlp);
      await globalState.wallet.setGlobalState(state, () => null);

      state = await getGlobalState();

      state.chains.push(CHAINS[1]);
      await globalState.wallet.setGlobalState(state, () => null);
      state = await changeChainProvider(0, 1);
      wallet = state.wallets[0];

      
      expect(wallet.accounts[0].chainHash).toBe(state.chains[1].hash());
      expect(wallet.accounts[0].chainId).toBe(state.chains[1].chainId);
      expect(wallet.defaultChainHash).toBe(state.chains[0].hash());
      expect(wallet.tokens[0]).equals(state.chains[1].ftokens[0]);
      expect(wallet.tokens[0].chainHash).equals(wallet.accounts[0].chainHash);
      expect(wallet.tokens[0].default_).toBeTruthy();
      expect(wallet.tokens[0].native).toBeTruthy();

      state = await changeChainProvider(0, 0);

      const params: BuildTokenTransferParams = {
        walletIndex: 0,
        accountIndex: 0,
        tokenAddr: zlp.addr,
        to: 'zil1wl38cwww2u3g8wzgutxlxtxwwc0rf7jf27zace',
        amount: '1',
      };

      await buildTokenTransfer(params);

      state = await getGlobalState();

      expect(state.wallets[0].confirm).toHaveLength(1);

      const confirm = state.wallets[0].confirm[0];
      const account = state.wallets[0].accounts[0];

      expect(confirm.metadata.chainHash).toBe(account.chainHash);
      expect(confirm.metadata.token.name).toBe(zlp.name);
      expect(confirm.metadata.token.symbol).toBe(zlp.symbol);
      expect(confirm.metadata.token.addr).toBe("zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4");
      expect(confirm.metadata.token.value).toBe(params.amount);
      expect(confirm.metadata.token.recipient).toBe(params.to);

      expect(confirm.evm).toBeUndefined();
      expect(confirm.signMessageScilla).toBeUndefined();
      expect(confirm.signPersonalMessageEVM).toBeUndefined();
      expect(confirm.signTypedDataJsonEVM).toBeUndefined();

      expect(confirm.scilla.chainId).toBe(1);
      expect(confirm.scilla.toAddr).toBe("fbd07e692543d3064b9cf570b27faabfd7948da4");
      expect(confirm.scilla.amount).toBe('0');
      expect(confirm.scilla.data).toBe('{"_tag":"Transfer","params":[{"vname":"to","type":"ByStr20","value":"0x77e27c39ce572283b848e2cdf32cce761e34fa49"},{"vname":"amount","type":"Uint128","value":"1"}]}');

      await rejectConfirm(0, 0);
      state = await getGlobalState();

      expect(state.wallets[0].confirm).toHaveLength(0);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
