import { describe, it, expect } from "vitest";
import {
  Wallet,
} from "../../background/storage/wallet";
import {
  WalletSettings,
} from "../../background/storage/settings";
import { AddressType, AuthMethod, WalletTypes } from "../../config/wallet";
import { RatesApiOptions } from "../../config/api";
import { ChainConfig } from "../../background/storage/chain";
import { WORD_LIST } from "../crypto/word_list";
import { CHAINS, PASSWORD } from "../data";
import { CipherOrders } from "../../crypto/keychain";
import { ShaAlgorithms } from "../../config/pbkdf2";
import { uint8ArrayToBase64 } from "../../crypto/b64";
import { randomBytes } from "../../crypto/random";
import { KeyPair } from "../../crypto/keypair";
import { hexToUint8Array } from '../../lib/utils/hex';
import { utf8ToUint8Array } from '../../lib/utils/utf8';
import { GasSpeed } from '../../config/gas';
import { Address } from "crypto/address";

describe("Wallet", () => {
  const MNEMONIC =
    "green process gate doctor slide whip priority shrug diamond crumble average help";
  const settings = new WalletSettings({
    cipherOrders: [CipherOrders.NTRUP761],
    hashFnParams: {
      memory: 4096,
      iterations: 3,
      threads: 1,
      secret: "",
      hashType: 0,
      hashSize: ShaAlgorithms.Sha512,
    },
    currencyConvert: "btc",
    ipfsNode: null,
    ensEnabled: false,
    tokensListFetcher: false,
    nodeRankingEnabled: false,
    maxConnections: 10,
    requestTimeoutSecs: 30,
    ratesApiOptions: RatesApiOptions.CoinGecko,
    sessionTime: 3600,
    gasOption: GasSpeed.Market,
  });
  const chain = new ChainConfig(CHAINS[0]);
  const bip32Accounts = [{ index: 0, name: "account 0" }];
  const SK_KEY = hexToUint8Array(
      "e93c035175b08613c4b0251ca92cd007026ca032ba53bafa3c839838f8b52d04",
  );
  const PK_KEY = hexToUint8Array(
      "03150a7f37063b134cde30070431a69148d60b252f4c7b38de33d813d329a7b7da",
  );

  describe("revealMnemonic", () => {
    it("reveals mnemonic for SecretPhrase wallet with correct password", async () => {
      const wallet = await Wallet.fromBip39(
        MNEMONIC,
        true,
        "Test Wallet",
        bip32Accounts,
        settings,
        chain,
        PASSWORD,
        WORD_LIST,
      );

      const mnemonic = await wallet.revealMnemonic(
        utf8ToUint8Array(PASSWORD),
        chain,
      );
      expect(mnemonic).toBe(MNEMONIC);
    });

    it("throws error for invalid chain hash", async () => {
      const wallet = await Wallet.fromBip39(
        MNEMONIC,
        true,
        "Test Wallet",
        bip32Accounts,
        settings,
        chain,
        PASSWORD,
        WORD_LIST,
      );
      const wrongChain = new ChainConfig(CHAINS[2]);

      await expect(
        wallet.revealMnemonic(utf8ToUint8Array(PASSWORD), wrongChain),
      ).rejects.toThrow("invlid chain");
    });

    it("throws error for non-SecretPhrase wallet", async () => {
      const wallet = new Wallet({
        walletType: WalletTypes.SecretKey,
        walletName: "Test Wallet",
        authType: AuthMethod.None,
        accounts: [],
        history: [],
        nft: [],
        confirm: [],
        selectedAccount: 0,
        tokens: [],
        settings,
        defaultChainHash: chain.hash(),
        uuid: "test-uuid",
        vault: "",
      });

      await expect(
        wallet.revealMnemonic(utf8ToUint8Array(PASSWORD), chain),
      ).rejects.toThrow(
        `Invalid wallet type ${WalletTypes[WalletTypes.SecretKey]}`,
      );
    });
  });

  describe("revealKeypair", () => {
    it("reveals keypair for SecretPhrase wallet", async () => {
      const wallet = await Wallet.fromBip39(
        MNEMONIC,
        true,
        "Test Wallet",
        bip32Accounts,
        settings,
        chain,
        PASSWORD,
        WORD_LIST,
      );

      await wallet.unlock(utf8ToUint8Array(PASSWORD));
      const keypair = await wallet.revealKeypair(0, chain);

      expect(keypair.pubKey).toEqual(PK_KEY);
      expect(keypair.privateKey).toEqual(SK_KEY);
    });

    it("throws error for invalid chain hash", async () => {
      const wallet = await Wallet.fromBip39(
        MNEMONIC,
        true,
        "Test Wallet",
        bip32Accounts,
        settings,
        chain,
        PASSWORD,
        WORD_LIST,
      );
      const wrongChain = new ChainConfig(CHAINS[2]);

      await expect(wallet.revealKeypair(0, wrongChain)).rejects.toThrow(
        "invlid chain",
      );
    });

    it("throws error for invalid wallet type", async () => {
      const wallet = new Wallet({
        walletType: WalletTypes.Ledger,
        walletName: "Test Wallet",
        authType: AuthMethod.None,
        accounts: [],
        history: [],
        nft: [],
        confirm: [],
        selectedAccount: 0,
        tokens: [],
        settings,
        defaultChainHash: chain.hash(),
        uuid: "test-uuid",
        vault: "",
      });

      await expect(wallet.revealKeypair(0, chain)).rejects.toThrow(
        `Invalid wallet type ${WalletTypes[WalletTypes.Ledger]}`,
      );
    });
  });

  describe("unlock", () => {
    it("unlocks SecretPhrase wallet and sets session", async () => {
      const wallet = await Wallet.fromBip39(
        MNEMONIC,
        true,
        "Test Wallet",
        bip32Accounts,
        settings,
        chain,
        PASSWORD,
        WORD_LIST,
      );

      await wallet.unlock(utf8ToUint8Array(PASSWORD));
      const keypair = await wallet.revealKeypair(0, chain);

      expect(keypair.pubKey).toEqual(PK_KEY);
      expect(keypair.privateKey).toEqual(SK_KEY);
    });

    it("throws error for invalid vault type", async () => {
      const wallet = new Wallet({
        walletType: WalletTypes.SecretPhrase,
        walletName: "Test Wallet",
        authType: AuthMethod.None,
        accounts: [],
        history: [],
        nft: [],
        confirm: [],
        selectedAccount: 0,
        tokens: [],
        settings,
        defaultChainHash: chain.hash(),
        uuid: "test-uuid",
        vault: uint8ArrayToBase64(randomBytes(220)),
      });

      await expect(
        wallet.unlock(utf8ToUint8Array(PASSWORD)),
      ).rejects.toThrow();
    });
  });

  describe("fromPrivateKey", () => {
    it("creates a wallet from a private key", async () => {
      const keyPair = await KeyPair.fromPrivateKey(SK_KEY, chain.slip44);
      const wallet = await Wallet.fromPrivateKey(
        keyPair,
        "My SK Wallet",
        "Primary Account",
        settings,
        chain,
        PASSWORD,
      );

      expect(wallet.walletName).toBe("My SK Wallet");
      expect(wallet.walletType).toBe(WalletTypes.SecretKey);
      expect(wallet.accounts.length).toBe(1);

      const account = wallet.accounts[0];
      expect(account.name).toBe("Primary Account");

      const address = await keyPair.address();
      const evmAddr = await Address.fromPubKeyType(keyPair.pubKey, AddressType.EthCheckSum);
      
      expect(account.addr).toBe(`${await address.toZilBech32()}:${await evmAddr.toEthChecksum()}`);
    });

    it("fails to unlock and reveal keypair due to incorrect wallet type", async () => {
      const keyPair = await KeyPair.fromPrivateKey(SK_KEY, chain.slip44);
      const wallet = await Wallet.fromPrivateKey(
        keyPair,
        "My SK Wallet",
        "Primary Account",
        settings,
        chain,
        PASSWORD,
      );
      
      await expect(wallet.revealMnemonic(utf8ToUint8Array(PASSWORD), chain)).rejects.toThrow(
        "Invalid wallet type SecretKey",
      );
    });
  });
});
