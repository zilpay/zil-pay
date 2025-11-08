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
    expect(result.wallets).toHaveLength(1);
    expect(result.notificationsGlobalEnabled).toBe(true);
    expect(result.locale).toBe("auto");
    expect(result.appearances).toBe(Themes.System);
    expect(result.abbreviatedNumber).toBe(true);
    expect(result.hideBalance).toBe(false);
    expect(result.chains).toHaveLength(1);

    // Wallet properties
    const wallet = result.wallets[0];
    expect(wallet).toBeInstanceOf(Wallet);
    expect(wallet.walletType).toBe(WalletTypes.SecretPhrase);
    expect(wallet.walletName).toBe("Zilliqa Wallet");
    expect(wallet.authType).toBe(AuthMethod.None);
    expect(wallet.selectedAccount).toBe(1); // From STORAGE_V2.selectedAddress
    expect(wallet.vault).toBe(STORAGE_V2.vault);
    expect(wallet.defaultChainHash).toBe(208425510);
    expect(wallet.uuid).toBeDefined();

    // Accounts
    expect(wallet.accounts).toHaveLength(2);
    const account0 = wallet.accounts[0];
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

    const account1 = wallet.accounts[1];
    expect(account1.name).toBe("Imported 0");
    expect(account1.addr).toBe("zil14at57zaj4pe3tuy734usy2xnlquapkd4d0ne43:0x709678c07cfCAFB4bb49a6b1d57b1db378e27825");
    expect(account1.pubKey).toBe(
      "0232970d0472220180c1779610f0ffae5a1ad79048b4f01f366c52d99317534024",
    );
    expect(account1.index).toBe(0);

    // Tokens
    expect(wallet.tokens).toHaveLength(3);
    expect(wallet.tokens[0].addr).toBe("0x0000000000000000000000000000000000000000");
    expect(wallet.tokens[0].name).toBe("EVM");
    expect(wallet.tokens[0].symbol).toBe("ZIL");
    expect(wallet.tokens[0].decimals).toBe(18);
    expect(wallet.tokens[0].native).toBe(true);
    expect(wallet.tokens[0].default_).toBe(true);
    expect(wallet.tokens[0].chainHash).toBe(wallet.defaultChainHash);

    expect(wallet.tokens[1].addr).toBe("zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz");
    expect(wallet.tokens[1].name).toBe("Scilla");
    expect(wallet.tokens[1].symbol).toBe("ZIL");
    expect(wallet.tokens[1].decimals).toBe(12);
    expect(wallet.tokens[1].native).toBe(true);
    expect(wallet.tokens[1].default_).toBe(true);
    expect(wallet.tokens[1].chainHash).toBe(wallet.defaultChainHash);

    expect(wallet.tokens[2].addr).toBe("zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4");
    expect(wallet.tokens[2].name).toBe("ZilPay wallet");
    expect(wallet.tokens[2].symbol).toBe("ZLP");
    expect(wallet.tokens[2].decimals).toBe(18);
    expect(wallet.tokens[2].native).toBe(false);
    expect(wallet.tokens[2].default_).toBe(false);
    expect(wallet.tokens[2].chainHash).toBe(wallet.defaultChainHash);

    // Chain
    const chain = result.chains[0];
    expect(chain).toBeInstanceOf(ChainConfig);
    expect(chain.name).toBe("Zilliqa");
    expect(chain.chain).toBe("ZIL");
    expect(chain.chainId).toBe(32769);
    expect(chain.hash()).toBe(208425510);
    expect(chain.slip44).toBe(313);

    // Wallet settings
    expect(wallet.settings.currencyConvert).toBe("BTC");
    expect(wallet.settings.cipherOrders).toEqual([CipherOrders.AESCBC]);
    expect(wallet.settings.hashFnParams).toEqual({
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
    expect(result.wallets).toHaveLength(1);
    expect(result.notificationsGlobalEnabled).toBe(true);
    expect(result.locale).toBe("auto");
    expect(result.appearances).toBe(Themes.System);
    expect(result.abbreviatedNumber).toBe(true);
    expect(result.hideBalance).toBe(false);
    expect(result.chains).toHaveLength(1);

    // Wallet properties
    const wallet = result.wallets[0];
    expect(wallet.walletType).toBe(WalletTypes.SecretPhrase);
    expect(wallet.walletName).toBe("Zilliqa Wallet");
    expect(wallet.authType).toBe(AuthMethod.None);
    expect(wallet.selectedAccount).toBe(1);
    expect(wallet.vault).toBe(STORAGE_V3.vault);
    expect(wallet.defaultChainHash).toBe(result.chains[0].hash());
    expect(wallet.uuid).toBeDefined();

    // Accounts
    expect(wallet.accounts).toHaveLength(2);
    const account0 = wallet.accounts[0];
    expect(account0.name).toBe("Account 0");
    expect(account0.addr).toBe("zil1ntrynx04349sk6py7uyata03gka6qswg7um95y:0xA2484462BB8E1BA3603E4CC248a34a9D9ABBc251");
    expect(account0.pubKey).toBe(
      "0316f2d913f13c6aa15ad5c80b58464d25b6363a1b9d997260e8061977a3f43e10",
    );
    expect(account0.index).toBe(0);

    const account1 = wallet.accounts[1];
    expect(account1.name).toBe("Imported 0");
    expect(account1.addr).toBe("zil14at57zaj4pe3tuy734usy2xnlquapkd4d0ne43:0x709678c07cfCAFB4bb49a6b1d57b1db378e27825");
    expect(account1.pubKey).toBe(
      "0232970d0472220180c1779610f0ffae5a1ad79048b4f01f366c52d99317534024",
    );
    expect(account1.index).toBe(0);

    // Tokens
    expect(wallet.tokens).toHaveLength(4);
    expect(wallet.tokens[0].addr).toBe("0x0000000000000000000000000000000000000000");
    expect(wallet.tokens[0].name).toBe("EVM");
    expect(wallet.tokens[0].symbol).toBe("ZIL");
    expect(wallet.tokens[0].decimals).toBe(18);
    expect(wallet.tokens[0].native).toBe(true);
    expect(wallet.tokens[0].default_).toBe(true);
    expect(wallet.tokens[0].chainHash).toBe(wallet.defaultChainHash);

    expect(wallet.tokens[1].addr).toBe("zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz");
    expect(wallet.tokens[1].name).toBe("Scilla");
    expect(wallet.tokens[1].symbol).toBe("ZIL");
    expect(wallet.tokens[1].decimals).toBe(12);
    expect(wallet.tokens[1].native).toBe(true);
    expect(wallet.tokens[1].default_).toBe(true);
    expect(wallet.tokens[1].chainHash).toBe(wallet.defaultChainHash);

    expect(wallet.tokens[2].addr).toBe("zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4");
    expect(wallet.tokens[2].name).toBe("ZilPay wallet");
    expect(wallet.tokens[2].symbol).toBe("ZLP");
    expect(wallet.tokens[2].decimals).toBe(18);
    expect(wallet.tokens[2].native).toBe(false);
    expect(wallet.tokens[2].default_).toBe(false);
    expect(wallet.tokens[2].chainHash).toBe(wallet.defaultChainHash);

    // Chain
    const chain = result.chains[0];
    expect(chain.name).toBe("Zilliqa");
    expect(chain.chainId).toBe(chain.chainIds[0]);

    // Wallet settings
    expect(wallet.settings.currencyConvert).toBe("BTC");
    expect(wallet.settings.cipherOrders).toEqual([CipherOrders.AESGCM256]);
    expect(wallet.settings.hashFnParams).toEqual({
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
