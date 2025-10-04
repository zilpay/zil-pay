import { describe, it, expect, beforeEach } from "vitest";
import {
  generateBip39Words,
  generateKeyPair,
  getGlobalState,
  logout,
  setGlobalState,
  unlockWallet,
  validateBip39Checksum,
  walletFromBip39Mnemonic,
  walletFromPrivateKey,
} from "../../popup/background/wallet";
import { changeChainProvider } from "../../popup/background/provider";
import { GlobalState } from "../../background/state";
import { startBackground } from "../../background/background";
import { BrowserStorage } from "../../lib/storage";
import {
  CHAINS,
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
import { WalletSettings } from "../../background/storage";
import { CipherOrders } from "../../crypto/keychain";
import { HashTypes } from "../../background/storage";
import { ShaAlgorithms } from "../../config/pbkdf2";
import '../setupTests';

describe("WalletService through background messaging", () => {
  let globalState: GlobalState;

  beforeEach(async () => {
    await BrowserStorage.clear();
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
    const baseSettings = {
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

    it("should create a new wallet from a private key", async () => {
      const keyPair: IKeyPair = {
        privateKey: IMPORTED_KEY,
        publicKey:
          "0232970d0472220180c1779610f0ffae5a1ad79048b4f01f366c52d99317534024",
        address: "zil14at57zaj4pe3tuy734usy2xnlquapkd4d0ne43",
        slip44: ZILLIQA,
      };

      const params: WalletFromPrivateKeyParams = {
        key: keyPair,
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
      expect(wallet.accounts[0].addr).toBe(keyPair.address);
      expect(state.selectedWallet).toBe(0);

      state = await logout(0);
      expect(state.selectedWallet).toBe(-1);
      state = await unlockWallet(PASSWORD, 0);
      expect(state.selectedWallet).toBe(0);
    });

    it("should create a new wallet from a BIP39 mnemonic", async () => {
      const params: WalletFromBip39Params = {
        mnemonic: WORDS,
        bip39WordList: WORD_LIST,
        walletName: "My BIP39 Wallet",
        accounts: [{ index: 0, name: "Main Account" }],
        verifyCheckSum: true,
        chain: CHAINS[0],
        password: PASSWORD,
        settings: new WalletSettings(baseSettings),
      };

      let state = await walletFromBip39Mnemonic(params);

      expect(state.wallets).toHaveLength(2);
      const wallet = state.wallets[1];
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
      expect(state.selectedWallet).toBe(1);
      expect(state.chains[0].testnet).toBeTruthy();
      expect(state.chains[0].fallbackEnabled).toBeTruthy();
      expect(state.chains[0].ftokens.length).toBe(2);
      expect(state.chains[0].slip44).toBe(313);
      expect(state.chains[0].chainIds).toEqual([ 32770, 2 ]);
      expect(state.chains[0].chainId).toBe(32770);

      state.chains.push(CHAINS[1]);
      await globalState.wallet.setGlobalState(state, () => null);

      await changeChainProvider(0, 1);

      state = await getGlobalState();

      // console.log(state);
    });
  });
});
