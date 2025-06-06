import { describe, it, expect } from "vitest";
import {
  upgradeStorageToV4,
  migrateEncryptedState,
  isV2Storage,
  isV3Storage,
  isV4Storage,
  ZilPayStorageSchemaV4,
  EncryptionParameters,
} from "../../background/secure/migrator";
import {
  STORAGE_V2,
  STORAGE_V3,
  PASSWORD,
  WORDS,
  IMPORTED_KEY,
} from "../data";
import { utils } from "aes-js";
import { AESCipherV3 } from "../../crypto/aes256";
import { Argon2Config, deriveArgon2Key } from "../../crypto/argon2";
import { EXTENSION_ID } from "../../lib/runtime";
import { sha256 } from "../../crypto/sha256";
import { CipherOrders } from "../../crypto/keychain";
import { Config, Variant, Version } from "@hicaru/argon2-pure.js";
import { APP_ID } from "../../config/argon2";

describe("Storage Version Checkers", () => {
  it("isV2Storage should correctly identify V2 storage", () => {
    expect(isV2Storage(STORAGE_V2)).toBe(true);
    expect(isV2Storage(STORAGE_V3)).toBe(false);
    expect(isV2Storage({ meta: { dataSchemaVersion: "4.0.0" } })).toBe(false);
  });

  it("isV3Storage should correctly identify V3 storage", () => {
    expect(isV3Storage(STORAGE_V3)).toBe(true);
    expect(isV3Storage(STORAGE_V2)).toBe(false);
    expect(isV3Storage({ meta: { dataSchemaVersion: "4.0.0" } })).toBe(false);
  });

  it("isV4Storage should correctly identify V4 storage", () => {
    const v4Storage = { meta: { dataSchemaVersion: "4.0.0" } };
    expect(isV4Storage(v4Storage)).toBe(true);
    expect(isV4Storage(STORAGE_V2)).toBe(false);
    expect(isV4Storage(STORAGE_V3)).toBe(false);
  });
});

describe("upgradeStorageToV4", () => {
  it("should not change V4 storage", () => {
    const v4Storage = {
      meta: { dataSchemaVersion: "4.0.0" },
    } as ZilPayStorageSchemaV4;
    const result = upgradeStorageToV4(v4Storage);
    expect(result).toEqual(v4Storage);
  });

  it("should migrate V2 storage to V4", () => {
    const result = upgradeStorageToV4(STORAGE_V2) as ZilPayStorageSchemaV4;

    expect(result.meta.dataSchemaVersion).toBe("4.0.0");
    expect(result.wallets.all.length).toBe(2);
    expect(result.wallets.all[0].type).toBe("hd");
    expect(result.wallets.all[1].type).toBe("imported_pk");
    expect(result.userPreferences.popupEnabled).toBe(true);
  });

  it("should migrate V3 storage to V4", () => {
    const result = upgradeStorageToV4(STORAGE_V3) as ZilPayStorageSchemaV4;

    expect(result.meta.dataSchemaVersion).toBe("4.0.0");
    expect(result.security.settings.autoLockMinutes).toBe(3);
    expect(result.networks.length).toBe(1);
    expect(result.wallets.all.length).toBe(2);
    expect(result.wallets.selectedWalletIndex).toBe(1);
  });
});


const getDefaultEncryptionParams = (): EncryptionParameters => ({
  algorithm: [
    CipherOrders.AESGCM256,
    CipherOrders.NTRUP761,
    CipherOrders.KUZNECHIK,
  ],
  argonConfig: new Config(
    APP_ID,
    64,
    1,
    64,
    new Uint8Array(),
    1,
    Variant.Argon2id,
    Version.Version13
  ) as Argon2Config,
});

