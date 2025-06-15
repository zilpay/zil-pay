import { describe, it, expect } from "vitest";
import {
  Wallet,
  WalletTypes,
  AuthMethod,
} from "../../background/storage/wallet";
import {
  RatesApiOptions,
  WalletSettings,
} from "../../background/storage/settings";
import { ChainConfig } from "../../background/storage/chain";
import { WORD_LIST } from "../crypto/word_list";
import { CHAINS, PASSWORD } from "../data";
import { CipherOrders } from "../../crypto/keychain";
import { ShaAlgorithms } from "../../config/pbkdf2";
import { utils } from "aes-js";
import { uint8ArrayToBase64 } from "../../crypto/b64";
import { randomBytes } from "../../crypto/random";

describe("Wallet", () => {
  const MNEMONIC =
    "green process gate doctor slide whip priority shrug diamond crumble average help";
  const settings = new WalletSettings({
    cipherOrders: [CipherOrders.NTRUP761],
    hashFnParams: {
      memory: 4096,
      iterations: 3,
      threads: 1,
      secret: new Uint8Array(0),
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
  });
  const chain = new ChainConfig(CHAINS[0]);
  const bip32Accounts = [{ index: 0, name: "account 0" }];
  const SK_KEY = new Uint8Array(
    utils.hex.toBytes(
      "e93c035175b08613c4b0251ca92cd007026ca032ba53bafa3c839838f8b52d04",
    ),
  );
  const PK_KEY = new Uint8Array(
    utils.hex.toBytes(
      "03150a7f37063b134cde30070431a69148d60b252f4c7b38de33d813d329a7b7da",
    ),
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
        utils.utf8.toBytes(PASSWORD),
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
        wallet.revealMnemonic(utils.utf8.toBytes(PASSWORD), wrongChain),
      ).rejects.toThrow("invlid chain");
    });

    it("throws error for non-SecretPhrase wallet", async () => {
      const wallet = new Wallet({
        walletType: WalletTypes.SecretKey,
        walletName: "Test Wallet",
        authType: AuthMethod.None,
        accounts: [],
        selectedAccount: 0,
        tokens: [],
        settings,
        defaultChainHash: chain.hash(),
        uuid: "test-uuid",
        vault: "",
      });

      await expect(
        wallet.revealMnemonic(utils.utf8.toBytes(PASSWORD), chain),
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

      await wallet.unlock(utils.utf8.toBytes(PASSWORD));
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

      await wallet.unlock(utils.utf8.toBytes(PASSWORD));
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
        selectedAccount: 0,
        tokens: [],
        settings,
        defaultChainHash: chain.hash(),
        uuid: "test-uuid",
        vault: uint8ArrayToBase64(randomBytes(220)), // Invalid vault content
      });

      await expect(
        wallet.unlock(utils.utf8.toBytes(PASSWORD)),
      ).rejects.toThrow();
    });
  });
});
