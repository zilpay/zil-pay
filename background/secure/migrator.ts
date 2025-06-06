import { Config, Variant, Version } from "@hicaru/argon2-pure.js";
import { TypeOf } from "../../lib/types/checker";
import { uuid } from "../../crypto/uuid";
import { CipherOrders } from "../../crypto/keychain";
import { AESCipherV2, AESCipherV3 } from "../../crypto/aes256";
import { sha256 } from "../../crypto/sha256";
import { pbkdf2 } from "../../crypto/pbkdf2";
import { utils } from "aes-js";
import { ShaAlgorithms } from "../../config/pbkdf2";
import { base64ToUint8Array, uint8ArrayToBase64 } from "../../crypto/b64";
import { deriveArgon2Key } from "../../crypto/argon2";
import { APP_ID } from "../../config/argon2";
import { EXTENSION_ID } from "../../lib/runtime";

export interface StorageMeta {
  dataSchemaVersion: string;
  securitySchemaVersion: string;
  lastMigrationTimestamp?: string;
  extensionId: string;
  createdAt: string;
  lastUnlockedTimestamp?: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  selectedLocale: string;
  popupEnabled: boolean;
  defaultCurrency: string;
  badgeCounterEnabled: boolean;
  hideBalances: boolean;
}

export interface AppState {
  currentBlockNumber: string;
  lastFullSyncTimestamp?: string;
  lastPriceUpdateTimestamp?: string;
  isFirstLaunch?: boolean;
}

export interface Argon2Config extends Config {}

export interface EncryptionParameters {
  algorithm: CipherOrders[];
  argonConfig: Argon2Config;
}

export interface SecuritySettings {
  autoLockMinutes: number;
  phishingDetectionEnabled: boolean;
  vaultEncryption: EncryptionParameters;
  privateKeyEncryption: EncryptionParameters;
}

export interface TokenBalance {
  amount: string;
  lastUpdated: string;
}

export interface NftIdentifier {
  contractAddress: string;
  tokenId: string;
  name?: string;
  imageUrl?: string;
  collectionName?: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: "hd" | "imported_pk" | "ledger" | "readonly";
  base16Address: string;
  bech32Address: string;
  publicKey: string;
  hdPath?: string;
  index?: number;
  encryptedPrivateKey?: string;
  balances: {
    [tokenIdentifier: string]: TokenBalance;
  };
  nfts: NftIdentifier[];
  createdAt: string;
}

interface TokenDefinition {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  isCustom: boolean;
  isNative: boolean;
  isDefault: boolean;
}

export interface NetworkConfiguration {
  id: string;
  name: string;
  chainId: string;
  apiUrl: string;
  nativeTokenSymbol: string;
  defaultGasPrice: string;
  defaultGasLimit: string;
  isDefault: boolean;
  tokens: TokenDefinition[];
}

export interface Contact {
  id: string;
  name: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export interface ConnectedDApp {
  origin: string;
  name?: string;
  iconUrl?: string;
  connectedDate: string;
  connectedWalletIds: string[];
  permissionsGranted?: string[];
}

export interface PendingConfirmation {
  id: string;
  type: "transaction" | "signMessage" | "connectDapp" | "signTypedData";
  origin?: string;
  walletId: string;
  networkId: string;
  payload: object;
  createdAt: string;
  expiresAt?: string;
}

export interface ZilPayStorageSchemaV4 {
  meta: StorageMeta;
  userPreferences: UserPreferences;
  appState: AppState;
  security: {
    settings: SecuritySettings;
    encryptedVault: string;
  };
  wallets: {
    all: Wallet[];
    selectedWalletIndex: number;
  };
  networks: NetworkConfiguration[];
  contacts: Contact[];
  connectedDapps: ConnectedDApp[];
  pendingConfirmations: PendingConfirmation[];
  currencyRates: {
    [currencyCode: string]: number;
  };
  [value: string]: unknown;
}

const safeJsonParse = <T>(jsonString: unknown, defaultValue: T): T => {
  if (!TypeOf.isString(jsonString)) {
    return defaultValue;
  }
  try {
    return JSON.parse(String(jsonString)) as T;
  } catch (e) {
    return defaultValue;
  }
};

export const getDefaultEncryptionParams = (): EncryptionParameters => ({
  algorithm: [
    CipherOrders.AESGCM256,
    CipherOrders.NTRUP761,
    CipherOrders.KUZNECHIK,
  ],
  argonConfig: new Config(
    APP_ID,
    64,
    4,
    65536,
    new Uint8Array(),
    2,
    Variant.Argon2id,
    Version.Version13
  ) as Argon2Config,
});

function migrateToV4(
  oldData: Record<string, unknown>
): ZilPayStorageSchemaV4 {
  const now = new Date().toISOString();
  const defaultEncryptionParams = getDefaultEncryptionParams();

  const oldWallets = safeJsonParse(oldData["wallet-identities"], {
    selectedAddress: 0,
    identities: [],
  });
  const oldNetworks = safeJsonParse(oldData["ssn-list"], {
    selected: 0,
    list: [],
  });
  const mainnetTokens = safeJsonParse(oldData["tokens-list/mainnet"], []);
  const oldContacts = safeJsonParse(oldData["contacts"], []);
  const oldConnections = safeJsonParse(oldData["connection-list"], []);
  const oldConfirmations = safeJsonParse(oldData["confirm/mainnet"], []);
  const oldRates = safeJsonParse(oldData["rate-of-currencies"], {});

  const wallets: Wallet[] = oldWallets.identities.map((identity: any) => {
    const balances: { [tokenIdentifier: string]: TokenBalance } = {};
    if (identity.zrc2) {
      for (const tokenAddr in identity.zrc2) {
        balances[tokenAddr] = {
          amount: String(identity.zrc2[tokenAddr]),
          lastUpdated: now,
        };
      }
    }

    const walletType = identity.type === 1 ? "imported_pk" : "hd";
    let hdPath: string | undefined;
    if (walletType === "hd") {
      hdPath = `m/44'/313'/0'/0/${identity.index}`;
    }

    const nfts = identity.nft ? Object.values(identity.nft) : [];

    return {
      id: uuid(),
      name: identity.name,
      type: walletType,
      base16Address: identity.base16,
      bech32Address: identity.bech32,
      publicKey: identity.pubKey,
      hdPath,
      index: identity.index,
      encryptedPrivateKey: identity.privKey,
      balances,
      nfts: nfts as NftIdentifier[],
      createdAt: now,
    };
  });

  const networks: NetworkConfiguration[] = oldNetworks.list.map(
    (network: any) => {
      const isMainnet = network.name === "Main";
      const networkTokens: TokenDefinition[] = isMainnet
        ? mainnetTokens.map((token: any) => ({
            address: token.base16,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            logoUrl: token.logoUrl,
            isCustom: false,
            isNative: token.symbol === "ZIL",
            isDefault: true,
          }))
        : [];

      return {
        id: network.name.toLowerCase().replace(/\s+/g, "_"),
        name: network.name,
        chainId: String(network.id),
        apiUrl: network.api,
        nativeTokenSymbol: "ZIL",
        defaultGasPrice: "2000000000",
        defaultGasLimit: "1",
        isDefault: isMainnet,
        tokens: networkTokens,
      };
    }
  );

  return {
    meta: {
      dataSchemaVersion: "4.0.0",
      securitySchemaVersion: "2.0.0",
      lastMigrationTimestamp: now,
      extensionId: EXTENSION_ID,
      createdAt: now,
    },
    userPreferences: {
      theme: (oldData.theme as "light" | "dark" | "system") || "system",
      selectedLocale: oldData["selected-local"] as string,
      popupEnabled: oldData["popup-enabled"] === "1",
      defaultCurrency: oldData["selected-currency"] as string,
      badgeCounterEnabled: (oldData["badge-counter"] ?? "1") === "1",
      hideBalances: false,
    },
    appState: {
      currentBlockNumber: oldData.blocknumber as string,
      isFirstLaunch: false,
      lastFullSyncTimestamp: now,
      lastPriceUpdateTimestamp: now,
    },
    security: {
      settings: {
        autoLockMinutes: Number(oldData.time_before_lock),
        phishingDetectionEnabled: oldData["phishing-detection"] === "1",
        vaultEncryption: defaultEncryptionParams,
        privateKeyEncryption: defaultEncryptionParams,
      },
      encryptedVault: oldData.vault as string,
    },
    wallets: {
      all: wallets,
      selectedWalletIndex: oldWallets.selectedAddress,
    },
    networks,
    contacts: oldContacts.map((contact: any) => ({
      id: uuid(),
      name: contact.name,
      address: contact.address,
      notes: contact.notes,
      createdAt: now,
    })),
    connectedDapps: oldConnections.map((dapp: any) => ({
      origin: dapp.domain,
      name: dapp.title,
      iconUrl: dapp.icon,
      connectedDate: new Date(dapp.date).toISOString(),
      connectedWalletIds: [],
      permissionsGranted: [],
    })),
    pendingConfirmations: oldConfirmations as PendingConfirmation[],
    currencyRates: oldRates,
  };
}

export async function migrateEncryptedState(
  oldData: Record<string, unknown>,
  password: string,
  wallets: Wallet[]
): Promise<{ encryptedVault: string; wallets: Wallet[] }> {
  const passwordBytes = utils.utf8.toBytes(password);
  const oldEncryptedVault = oldData.vault as string;
  const oldIdentities = safeJsonParse(oldData["wallet-identities"], {
    identities: [],
  }).identities;

  let decryptionKey: Uint8Array | string;
  let decryptVault: (encrypted: string, key: any) => Promise<string | Uint8Array>;
  let decryptPrivKey: (encrypted: string, key: any) => Promise<string | Uint8Array>;

  if (isV2Storage(oldData)) {
    const keyBytes = await sha256(passwordBytes);
    decryptionKey = utils.hex.fromBytes(keyBytes);
    decryptVault = async (vault, key) => AESCipherV2.decrypt(vault, key);
    decryptPrivKey = async (privKey, key) => AESCipherV2.decrypt(privKey, key);
  } else if (isV3Storage(oldData)) {
    const salt = utils.utf8.toBytes(EXTENSION_ID);
    const [algorithm, iterations] = String(
      oldData["guard-configuration"]
    ).split(":");
    const key = await pbkdf2(
      passwordBytes,
      salt,
      Number(iterations),
      algorithm as ShaAlgorithms
    );
    decryptionKey = await sha256(key);
    decryptVault = async (vault, key) => AESCipherV3.decrypt(base64ToUint8Array(vault), key);
    decryptPrivKey = async (privKey, key) => AESCipherV3.decrypt(base64ToUint8Array(privKey), key);
  } else {
    throw new Error(
      "Cannot migrate encrypted state from unknown storage version."
    );
  }

  const decryptedMnemonicBytes = await decryptVault(
    oldEncryptedVault,
    decryptionKey
  );
  const newEncryptionKey = await sha256(
    deriveArgon2Key(
      passwordBytes,
      EXTENSION_ID,
      getDefaultEncryptionParams().argonConfig
    )
  );

  const newEncryptedVaultBytes = AESCipherV3.encrypt(
    TypeOf.isString(decryptedMnemonicBytes)
      ? utils.utf8.toBytes(decryptedMnemonicBytes as string)
      : (decryptedMnemonicBytes as Uint8Array),
    newEncryptionKey
  );
  const newEncryptedVault = uint8ArrayToBase64(newEncryptedVaultBytes);

  for (const identity of oldIdentities) {
    if (identity["type"] === 1 && identity["privKey"]) {
      const decryptedPkBytes = await decryptPrivKey(
        identity["privKey"],
        decryptionKey
      );
      const newEncryptedPkBytes = AESCipherV3.encrypt(
        TypeOf.isString(decryptedPkBytes)
          ? utils.hex.toBytes(decryptedPkBytes as string)
          : (decryptedPkBytes as Uint8Array),
        newEncryptionKey
      );

      const wallet = wallets.find((w) => w.base16Address === identity["base16"]);
      if (wallet) {
        wallet.encryptedPrivateKey = uint8ArrayToBase64(newEncryptedPkBytes);
      }
    }
  }

  return {
    encryptedVault: newEncryptedVault,
    wallets,
  };
}

export function isV4Storage(
  data: Record<string, unknown>
): data is ZilPayStorageSchemaV4 {
  const meta = data.meta as Record<string, unknown> | undefined;
  return (
    !!meta &&
    TypeOf.isObject(meta) &&
    TypeOf.isString(meta.dataSchemaVersion) &&
    (meta.dataSchemaVersion as string).startsWith("4")
  );
}

export function isV3Storage(data: Record<string, unknown>): boolean {
  return (
    !data.meta &&
    TypeOf.isString(data["guard-configuration"]) &&
    TypeOf.isString(data["wallet-identities"])
  );
}

export function isV2Storage(data: Record<string, unknown>): boolean {
  return (
    !data.meta &&
    !data["guard-configuration"] &&
    TypeOf.isString(data["wallet-identities"])
  );
}

export function upgradeStorageToV4(
  data: Record<string, unknown>
): ZilPayStorageSchemaV4 | Record<string, unknown> {
  if (isV4Storage(data)) {
    return data;
  }

  if (isV3Storage(data) || isV2Storage(data)) {
    return migrateToV4(data);
  }

  return data;
}

