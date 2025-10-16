import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  generateBip39Words,
  generateKeyPair,
  getAllAddressesByChain,
  logout,
  setGlobalState,
  unlockWallet,
  validateBip39Checksum,
  walletFromBip39Mnemonic,
  walletFromPrivateKey,
} from "../../popup/background/wallet";
import { GlobalState } from "../../background/state";
import { startBackground } from "../../background/background";
import { BrowserStorage } from "../../lib/storage";
import {
    BASE_SETTINGS,
  CHAINS,
  createBscConfig,
  createEthConfig,
  createZilliqaTestnetConfig,
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
import { WalletSettings } from "../../background/storage";
import '../setupTests';
import { messageManager } from "../setupTests";
import { AddressCategory } from "config/common";
import { Address } from "crypto/address";
import { hexToUint8Array } from "lib/utils/hex";

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
        settings: new WalletSettings(BASE_SETTINGS),
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

    it("should create a new wallet from a BIP39 mnemonic", async () => {
      const bip39Params: WalletFromBip39Params = {
        mnemonic: WORDS,
        bip39WordList: WORD_LIST,
        walletName: "My BIP39 Wallet",
        accounts: [{ index: 0, name: "Main Account" }],
        verifyCheckSum: true,
        chain: CHAINS[0],
        password: PASSWORD,
        settings: new WalletSettings(BASE_SETTINGS),
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
    });
  });

  describe("getAllAddressesByChain", () => {
    it("should retrieve all addresses for the same chain across multiple wallets and address book", async () => {
      const settings = new WalletSettings(BASE_SETTINGS);
  
      const bscChain = createBscConfig();
      const ethChain = createEthConfig();
      const zilChain = createZilliqaTestnetConfig();
  
      let state = await walletFromBip39Mnemonic({
        mnemonic: await generateBip39Words(12, WORD_LIST),
        bip39WordList: WORD_LIST,
        walletName: "BSC Wallet",
        accounts: [
          { index: 0, name: "BSC Account 1" },
          { index: 1, name: "BSC Account 2" },
          { index: 2, name: "BSC Account 3" }
        ],
        verifyCheckSum: true,
        chain: bscChain,
        password: PASSWORD,
        settings,
      });

      state = await walletFromBip39Mnemonic({
        mnemonic: await generateBip39Words(12, WORD_LIST),
        bip39WordList: WORD_LIST,
        walletName: "ETH Wallet",
        accounts: [
          { index: 0, name: "ETH Account 1" },
          { index: 1, name: "ETH Account 2" },
          { index: 2, name: "ETH Account 3" }
        ],
        verifyCheckSum: true,
        chain: ethChain,
        password: PASSWORD,
        settings,
      });

      state = await walletFromBip39Mnemonic({
        mnemonic: await generateBip39Words(12, WORD_LIST),
        bip39WordList: WORD_LIST,
        walletName: "ZIL Wallet",
        accounts: [
          { index: 0, name: "ZIL Account 1" },
          { index: 1, name: "ZIL Account 2" },
          { index: 2, name: "ZIL Account 3" }
        ],
        verifyCheckSum: true,
        chain: zilChain,
        password: PASSWORD,
        settings,
      });

      state.book.push(
        {
          name: "BSC Friend",
          address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          addrType: AddressType.EthCheckSum
        },
        {
          name: "ETH Contact",
          address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
          addrType: AddressType.EthCheckSum
        },
        {
          name: "ZIL Contact",
          address: "zil1v9xf3hvy72gwx5c27h7u43qpvj69xnrzl0fc2z",
          addrType: AddressType.Bech32
        }
      );
      await setGlobalState();

      expect(state.wallets).toHaveLength(3);

      const bscAddresses = await getAllAddressesByChain(0, 0);
      expect(bscAddresses).toHaveLength(4);

      bscAddresses.forEach((acc) => {
        expect(acc.addrType).toBe(AddressType.EthCheckSum);
      });
    
      const bscWalletAddresses = bscAddresses.filter(a => a.category === AddressCategory.Wallet);

      bscWalletAddresses.forEach((acc) => {
        expect(acc.walletName).toBe(state.wallets[0].walletName);
      });
    
      const bscBookEntry = bscAddresses.filter(a => a.category === AddressCategory.AddressBook);
      expect(bscBookEntry).toHaveLength(2);
      expect(bscBookEntry[0].addr).toEqual(state.book[0].address);
      expect(bscBookEntry[1].addr).toEqual(state.book[1].address);

      const ethAddresses = await getAllAddressesByChain(1, 0);
      expect(ethAddresses).toHaveLength(4);

      ethAddresses.forEach((acc) => {
        expect(acc.addrType).toBe(AddressType.EthCheckSum);
      });

      const ethAddressesAddresses = ethAddresses.filter(a => a.category === AddressCategory.Wallet);

      ethAddressesAddresses.forEach((acc) => {
        expect(acc.walletName).toBe(state.wallets[1].walletName);
      });

      const ethBookEntry = ethAddresses.filter(a => a.category === AddressCategory.AddressBook);
      expect(ethBookEntry).toHaveLength(2);
      expect(ethBookEntry[0].addr).toEqual(state.book[0].address);
      expect(ethBookEntry[1].addr).toEqual(state.book[1].address);
    
      const zilAddresses = await getAllAddressesByChain(2, 0);

      expect(zilAddresses).toHaveLength(4);
      expect(zilAddresses[0].addr).toBe(state.book[2].address);
      expect(zilAddresses[1].addr).toBe(state.wallets[2].accounts[1].addr);
      expect(zilAddresses[2].addr).toBe(state.wallets[2].accounts[2].addr);
      expect(zilAddresses[3].category).toBe(AddressCategory.ZILExchangeLegacy);
      expect(zilAddresses[3].addr).toBe(await ((await Address.fromPubKeyType(hexToUint8Array(state.wallets[2].accounts[0].pubKey), AddressType.EthCheckSum)).toEthChecksum()));
    
      const zilWalletAddresses = zilAddresses.filter(a => a.category === AddressCategory.Wallet);

      expect(zilWalletAddresses).toHaveLength(2);
      zilWalletAddresses.forEach((acc) => {
        expect(acc.walletName).toBe(state.wallets[2].walletName);
      });

      const zilBookEntry = zilAddresses.filter(a => a.category === AddressCategory.AddressBook);
      expect(zilBookEntry).toHaveLength(1);
      expect(zilBookEntry[0].addr).toEqual(state.book[2].address);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
