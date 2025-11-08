import "../setupTests";
import { describe, it, expect } from "vitest";
import { migrateToV4 } from "../../background/secure/migrator";
import { Themes } from "../../config/theme";
import {
  BackgroundState,
} from "../../background/storage/background";
import { ChainConfig } from "../../background/storage/chain";
import { FToken } from "../../background/storage/ftoken";
import {
  Wallet,
} from "../../background/storage/wallet";
import { WalletTypes, AuthMethod, AddressType } from "../../config/wallet";
import { Account } from "../../background/storage/account";
import { WalletHashParams } from "../../background/storage/argon";
import { ShaAlgorithms } from "../../config/pbkdf2";
import { TypeOf } from "../../lib/types";
import { PASSWORD, STORAGE_V2, STORAGE_V3, WORDS } from "../data";
import { utils } from "aes-js";
import { HashTypes } from "config/argon2";
import { CipherOrders } from "config/keychain";

const createV4Storage = (): Record<string, unknown> => ({
  storageVersion: 4,
  wallets: [],
  notificationsGlobalEnabled: true,
  locale: "auto",
  appearances: "System",
  abbreviatedNumber: true,
  hideBalance: false,
  chains: [],
  selectedWallet: -1,
});

describe("migrateToV4", () => {
  it("should return BackgroundState with unchanged storage if already version 4", async () => {
    const storageV4 = createV4Storage();
    const result = await migrateToV4(storageV4 as any);

    expect(result).toBeInstanceOf(BackgroundState);
    expect(result.storageVersion).toBe(4);
    expect(result.wallets).toEqual([]);
    expect(result.notificationsGlobalEnabled).toBe(true);
    expect(result.locale).toBe("auto");
    expect(result.appearances).toBe("System");
    expect(result.abbreviatedNumber).toBe(true);
    expect(result.hideBalance).toBe(false);
    expect(result.chains).toEqual([]);
  });

  // Test case 2: Migration from version 2
  it("should correctly migrate from version 2", async () => {
    const result = await migrateToV4(STORAGE_V2 as any);

    // Top-level BackgroundState properties
    expect(result).toBeInstanceOf(BackgroundState);
    expect(result.storageVersion).toBe(4);
    expect(result.wallets).toHaveLength(2);
    expect(result.notificationsGlobalEnabled).toBe(true);
    expect(result.locale).toBe("auto");
    expect(result.appearances).toBe(Themes.System);
    expect(result.abbreviatedNumber).toBe(true);
    expect(result.hideBalance).toBe(false);
    expect(result.chains).toHaveLength(1);

    const walletbip39 = result.wallets[0];
    const walletKey = result.wallets[1];

    expect(walletbip39).toBeInstanceOf(Wallet);
    expect(walletbip39.walletType).toBe(WalletTypes.SecretPhrase);
    expect(walletbip39.walletName).toBe("Account 0");
    expect(walletbip39.authType).toBe(AuthMethod.None);
    expect(walletbip39.selectedAccount).toBe(0);
    expect(walletbip39.vault).toBe(STORAGE_V2.vault);
    expect(walletbip39.defaultChainHash).toBe(208425510);
    expect(walletbip39.uuid).toBeDefined();

    expect(walletKey).toBeInstanceOf(Wallet);
    expect(walletKey.walletType).toBe(WalletTypes.SecretKey);
    expect(walletKey.walletName).toBe("Imported 0");
    expect(walletKey.authType).toBe(AuthMethod.None);
    expect(walletKey.selectedAccount).toBe(0);
    expect(walletKey.vault).toBe(JSON.parse(STORAGE_V2["wallet-identities"]).identities.at(-1).privKey);
    expect(walletKey.defaultChainHash).toBe(208425510);
    expect(walletKey.uuid).toBeDefined();

    expect(walletbip39.accounts).toHaveLength(1);
    const account0 = walletbip39.accounts[0];
    expect(account0).toBeInstanceOf(Account);
    expect(account0.name).toBe("Account 0");
    expect(account0.addr).toBe("zil1ntrynx04349sk6py7uyata03gka6qswg7um95y:0xA2484462BB8E1BA3603E4CC248a34a9D9ABBc251");
    expect(account0.addrType).toBe(AddressType.Bech32);
    expect(account0.pubKey).toBe(
      "0316f2d913f13c6aa15ad5c80b58464d25b6363a1b9d997260e8061977a3f43e10",
    );
    expect(account0.chainHash).toBe(result.chains[0].hash());
    expect(account0.chainId).toBe(32769);
    expect(account0.slip44).toBe(313);
    expect(account0.index).toBe(0);

    const accountKey = walletKey.accounts[0];
    expect(accountKey).toBeInstanceOf(Account);
    expect(accountKey.name).toBe("Imported 0");
    expect(accountKey.addr).toBe("zil14at57zaj4pe3tuy734usy2xnlquapkd4d0ne43:0x709678c07cfCAFB4bb49a6b1d57b1db378e27825");
    expect(accountKey.addrType).toBe(AddressType.Bech32);
    expect(accountKey.pubKey).toBe(
      "0232970d0472220180c1779610f0ffae5a1ad79048b4f01f366c52d99317534024",
    );
    expect(accountKey.chainHash).toBe(result.chains[0].hash());
    expect(accountKey.chainId).toBe(32769);
    expect(accountKey.slip44).toBe(313);
    expect(accountKey.index).toBe(0);

    // Tokens
    result.wallets.forEach((w) => {
      expect(w.tokens).toHaveLength(3);
      expect(w.tokens[0].addr).toBe("0x0000000000000000000000000000000000000000");
      expect(w.tokens[0].name).toBe("EVM");
      expect(w.tokens[0].symbol).toBe("ZIL");
      expect(w.tokens[0].decimals).toBe(18);
      expect(w.tokens[0].native).toBe(true);
      expect(w.tokens[0].default_).toBe(true);
      expect(w.tokens[0].chainHash).toBe(walletbip39.defaultChainHash);

      expect(w.tokens[1].addr).toBe("zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz");
      expect(w.tokens[1].name).toBe("Scilla");
      expect(w.tokens[1].symbol).toBe("ZIL");
      expect(w.tokens[1].decimals).toBe(12);
      expect(w.tokens[1].native).toBe(true);
      expect(w.tokens[1].default_).toBe(true);
      expect(w.tokens[1].chainHash).toBe(walletbip39.defaultChainHash);

      expect(w.tokens[2].addr).toBe("zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4");
      expect(w.tokens[2].name).toBe("ZilPay wallet");
      expect(w.tokens[2].symbol).toBe("ZLP");
      expect(w.tokens[2].decimals).toBe(18);
      expect(w.tokens[2].native).toBe(false);
      expect(w.tokens[2].default_).toBe(false);
      expect(w.tokens[2].chainHash).toBe(walletbip39.defaultChainHash);
    });

    // Chain
    const chain = result.chains[0];
    expect(chain).toBeInstanceOf(ChainConfig);
    expect(chain.name).toBe("Zilliqa");
    expect(chain.chain).toBe("ZIL");
    expect(chain.chainId).toBe(32769);
    expect(chain.hash()).toBe(208425510);
    expect(chain.slip44).toBe(313);

    // Wallet settings
    expect(walletbip39.settings.currencyConvert).toBe("BTC");
    expect(walletbip39.settings.cipherOrders).toEqual([CipherOrders.AESCBC]);
    expect(walletbip39.settings.hashFnParams).toEqual({
      memory: 1024,
      iterations: 0,
      threads: 1,
      secret: "",
      hashType: HashTypes.Pbkdf2,
      hashSize: ShaAlgorithms.sha256,
    });
  });

  // Test case 3: Migration from version 3
  it("should correctly migrate from version 3", async () => {
    const result = await migrateToV4(STORAGE_V3 as any);

    // Top-level BackgroundState properties
    expect(result.storageVersion).toBe(4);
    expect(result.wallets).toHaveLength(2);
    expect(result.notificationsGlobalEnabled).toBe(true);
    expect(result.locale).toBe("auto");
    expect(result.appearances).toBe(Themes.System);
    expect(result.abbreviatedNumber).toBe(true);
    expect(result.hideBalance).toBe(false);
    expect(result.chains).toHaveLength(1);

    // Wallet properties
    const walletBip39 = result.wallets[0];
    const walletKey = result.wallets[1];
    expect(walletBip39.walletType).toBe(WalletTypes.SecretPhrase);
    expect(walletBip39.walletName).toBe("Account 0");
    expect(walletBip39.authType).toBe(AuthMethod.None);
    expect(walletBip39.selectedAccount).toBe(0);
    expect(walletBip39.vault).toBe(STORAGE_V3.vault);
    expect(walletBip39.defaultChainHash).toBe(result.chains[0].hash());
    expect(walletBip39.uuid).toBeDefined();

    expect(walletKey.walletType).toBe(WalletTypes.SecretKey);
    expect(walletKey.walletName).toBe("Imported 0");
    expect(walletKey.authType).toBe(AuthMethod.None);
    expect(walletKey.selectedAccount).toBe(0);
    expect(walletKey.vault).toBe(JSON.parse(STORAGE_V3["wallet-identities"]).identities.at(-1).privKey);
    expect(walletKey.defaultChainHash).toBe(result.chains[0].hash());
    expect(walletKey.uuid).toBeDefined();

    // Accounts
    expect(walletBip39.accounts).toHaveLength(1);
    const account0 = walletBip39.accounts[0];
    expect(account0.name).toBe("Account 0");
    expect(account0.addr).toBe("zil1ntrynx04349sk6py7uyata03gka6qswg7um95y:0xA2484462BB8E1BA3603E4CC248a34a9D9ABBc251");
    expect(account0.pubKey).toBe(
      "0316f2d913f13c6aa15ad5c80b58464d25b6363a1b9d997260e8061977a3f43e10",
    );
    expect(account0.index).toBe(0);

    const account1 = walletKey.accounts[0];
    expect(account1.name).toBe("Imported 0");
    expect(account1.addr).toBe("zil14at57zaj4pe3tuy734usy2xnlquapkd4d0ne43:0x709678c07cfCAFB4bb49a6b1d57b1db378e27825");
    expect(account1.pubKey).toBe(
      "0232970d0472220180c1779610f0ffae5a1ad79048b4f01f366c52d99317534024",
    );
    expect(account1.index).toBe(0);

    // Tokens
    expect(walletBip39.tokens).toHaveLength(4);
    expect(walletBip39.tokens[0].addr).toBe("0x0000000000000000000000000000000000000000");
    expect(walletBip39.tokens[0].name).toBe("EVM");
    expect(walletBip39.tokens[0].symbol).toBe("ZIL");
    expect(walletBip39.tokens[0].decimals).toBe(18);
    expect(walletBip39.tokens[0].native).toBe(true);
    expect(walletBip39.tokens[0].default_).toBe(true);
    expect(walletBip39.tokens[0].chainHash).toBe(walletBip39.defaultChainHash);

    expect(walletBip39.tokens[1].addr).toBe("zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz");
    expect(walletBip39.tokens[1].name).toBe("Scilla");
    expect(walletBip39.tokens[1].symbol).toBe("ZIL");
    expect(walletBip39.tokens[1].decimals).toBe(12);
    expect(walletBip39.tokens[1].native).toBe(true);
    expect(walletBip39.tokens[1].default_).toBe(true);
    expect(walletBip39.tokens[1].chainHash).toBe(walletBip39.defaultChainHash);

    expect(walletBip39.tokens[2].addr).toBe("zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4");
    expect(walletBip39.tokens[2].name).toBe("ZilPay wallet");
    expect(walletBip39.tokens[2].symbol).toBe("ZLP");
    expect(walletBip39.tokens[2].decimals).toBe(18);
    expect(walletBip39.tokens[2].native).toBe(false);
    expect(walletBip39.tokens[2].default_).toBe(false);
    expect(walletBip39.tokens[2].chainHash).toBe(walletBip39.defaultChainHash);

    // Chain
    const chain = result.chains[0];
    expect(chain.name).toBe("Zilliqa");
    expect(chain.chainId).toBe(chain.chainIds[0]);

    // Wallet settings
    expect(walletBip39.settings.currencyConvert).toBe("BTC");
    expect(walletBip39.settings.cipherOrders).toEqual([CipherOrders.AESGCM256]);
    expect(walletBip39.settings.hashFnParams).toEqual({
      memory: 1024,
      iterations: 442368,
      threads: 1,
      secret: "",
      hashType: HashTypes.Pbkdf2,
      hashSize: "SHA-512",
    });
  });

  it("test migrate and decrypt storage v2", async () => {
    const result = await migrateToV4(STORAGE_V2 as any);
    const wallet = result.wallets[0];
    const password = utils.utf8.toBytes(PASSWORD);
    const decrypted = await wallet.decrypt(password);

    expect(decrypted).toEqual(WORDS);

    wallet.settings.cipherOrders = [
      CipherOrders.AESGCM256,
      CipherOrders.NTRUP761,
    ];
    wallet.settings.hashFnParams = WalletHashParams.default();
    await wallet.encrypt(password, utils.utf8.toBytes(String(decrypted)));
    const decryptedWithArgon = await wallet.decrypt(password);

    expect(TypeOf.isString(decryptedWithArgon)).toBe(true);
    expect(decryptedWithArgon).toEqual(WORDS);
  });

  it("test migrate and decrypt storage v3", async () => {
    const result = await migrateToV4(STORAGE_V3 as any);
    const wallet = result.wallets[0];
    const password = utils.utf8.toBytes(PASSWORD);
    const decrypted = await wallet.decrypt(password);

    expect(TypeOf.isString(decrypted)).toBe(true);
    expect(decrypted).toEqual(WORDS);

    wallet.settings.hashFnParams = WalletHashParams.default();
    wallet.settings.cipherOrders = [
      CipherOrders.AESGCM256,
      CipherOrders.KUZNECHIK,
    ];

    await wallet.encrypt(password, utils.utf8.toBytes(String(decrypted)));
    const decryptedWithArgon = await wallet.decrypt(password);

    expect(TypeOf.isString(decryptedWithArgon)).toBe(true);
    expect(decryptedWithArgon).toEqual(WORDS);
  });
});
