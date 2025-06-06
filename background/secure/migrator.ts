import { Config, Variant, Version } from '@hicaru/argon2-pure.js';
import { utils } from 'aes-js';
import { TypeOf } from '../../lib/types/checker';
import { EXTENSION_ID } from '../../lib/runtime';
import { AESCipherV2, AESCipherV3 } from '../../crypto/aes256';
import { sha256 } from '../../crypto/sha256';
import { pbkdf2 } from '../../crypto/pbkdf2';
import { ShaAlgorithms } from '../../config/pbkdf2';
import { base64ToUint8Array, uint8ArrayToBase64 } from '../../crypto/b64';
import { deriveArgon2Key } from '../../crypto/argon2';
import { APP_ID } from '../../config/argon2';
import { CipherOrders } from '../../crypto/keychain';
import { BackgroundState, AppearancesTheme } from '../storage/background';
import { ChainConfig } from '../storage/chain';
import { Wallet } from '../storage/wallet';
import { Account } from '../storage/account';
import { FToken } from '../storage/ftoken';
import { AddressType } from '../storage/address-type';
import { WalletSettings } from '../storage/settings';
import { WalletArgon2Params } from '../storage/argon';

interface OldWallets {
  selectedAddress: number;
  identities: OldIdentity[];
}

interface OldIdentity {
  name: string;
  bech32: string;
  base16: string;
  index: number;
  type: number;
  pubKey: string;
  privKey?: string;
  zrc2: Record<string, string>;
  nft: Record<string, unknown>;
}

interface OldNetworkList {
  selected: number;
  list: OldNetwork[];
}

interface OldNetwork {
  address: string;
  api: string;
  id: number;
  name: string;
}

interface OldToken {
  base16: string;
  bech32: string;
  decimals: number;
  name: string;
  symbol: string;
  rate: number;
}

function isV3Storage(data: Record<string, unknown>): boolean {
  return (
    !data.meta &&
    TypeOf.isString(data['guard-configuration']) &&
    TypeOf.isString(data['wallet-identities'])
  );
}

function isV2Storage(data: Record<string, unknown>): boolean {
  return (
    !data.meta &&
    !data['guard-configuration'] &&
    TypeOf.isString(data['wallet-identities'])
  );
}

function needsMigration(data: Record<string, unknown>): boolean {
  return isV2Storage(data) || isV3Storage(data);
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

const getDefaultSettings = (oldData: Record<string, unknown>): WalletSettings => {
  const originArgon2Config = Config.original();
  const argonParams = new WalletArgon2Params({
    memory: originArgon2Config.memCost,
    iterations: originArgon2Config.timeCost,
    threads: originArgon2Config.lanes,
    secret: "",
  });

  return new WalletSettings({
    cipherOrders: [
      CipherOrders.AESGCM256,
      CipherOrders.NTRUP761,
      CipherOrders.KUZNECHIK,
    ],
    argonParams,
    currencyConvert: String(oldData['selected-currency'] || 'btc'),
    ipfsNode: null,
    ensEnabled: false,
    tokensListFetcher: true,
    nodeRankingEnabled: true,
    maxConnections: 10,
    requestTimeoutSecs: 30,
    ratesApiOptions: 0,
  });
};

const getTheme = (theme: unknown): AppearancesTheme => {
    switch(theme) {
        case 'dark': return AppearancesTheme.Dark;
        case 'light': return AppearancesTheme.Light;
        default: return AppearancesTheme.System;
    }
}

async function migrateEncryptedKeys(
  oldData: Record<string, unknown>,
  password: string,
  accounts: Account[]
): Promise<{ newVault: Uint8Array, updatedAccounts: Account[] }> {
  const passwordBytes = utils.utf8.toBytes(password);
  const oldEncryptedVault = oldData.vault as string;
  const oldIdentities = safeJsonParse<OldWallets>(oldData['wallet-identities'], {
    identities: [],
    selectedAddress: 0
  }).identities;

  let decryptionKey: Uint8Array | string;
  let decryptVault: (encrypted: string) => Promise<string | Uint8Array>;
  let decryptPrivKey: (encrypted: string) => Promise<string | Uint8Array>;

  if (isV2Storage(oldData)) {
    const keyBytes = await sha256(passwordBytes);
    decryptionKey = utils.hex.fromBytes(keyBytes);
    decryptVault = (vault) => AESCipherV2.decrypt(vault, decryptionKey);
    decryptPrivKey = (privKey) => AESCipherV2.decrypt(privKey, decryptionKey);
  } else {
    const salt = utils.utf8.toBytes(EXTENSION_ID);
    const [algorithm, iterations] = String(
      oldData['guard-configuration']
    ).split(':');
    const key = await pbkdf2(
      passwordBytes,
      salt,
      Number(iterations),
      algorithm as ShaAlgorithms
    );
    decryptionKey = await sha256(key);
    decryptVault = (vault) => AESCipherV3.decrypt(base64ToUint8Array(vault), decryptionKey);
    decryptPrivKey = (privKey) => AESCipherV3.decrypt(base64ToUint8Array(privKey), decryptionKey);
  }

  const argonConfig = new Config(
    APP_ID, 64, 4, 65536, new Uint8Array(), 2, Variant.Argon2id, Version.Version13
  );

  const newEncryptionKey = await sha256(
    deriveArgon2Key(passwordBytes, EXTENSION_ID, argonConfig)
  );
  
  const decryptedMnemonicBytes = await decryptVault(oldEncryptedVault);
  const mnemonicBytes = TypeOf.isString(decryptedMnemonicBytes)
      ? utils.utf8.toBytes(decryptedMnemonicBytes as string)
      : (decryptedMnemonicBytes as Uint8Array);

  const newVault = AESCipherV3.encrypt(mnemonicBytes, newEncryptionKey);

  const updatedAccounts = [...accounts];

  for (const identity of oldIdentities) {
    if (identity.type === 1 && identity.privKey) {
      const decryptedPkBytes = await decryptPrivKey(identity.privKey);
      const pkBytes = TypeOf.isString(decryptedPkBytes)
        ? utils.hex.toBytes(decryptedPkBytes as string)
        : (decryptedPkBytes as Uint8Array);

      const newEncryptedPkBytes = AESCipherV3.encrypt(pkBytes, newEncryptionKey);
      const newEncryptedPk = uint8ArrayToBase64(newEncryptedPkBytes);
      
      const accountIndex = updatedAccounts.findIndex(acc => acc.addr === identity.base16);
      if (accountIndex > -1) {
        updatedAccounts[accountIndex].encryptedPrivKey = newEncryptedPk;
      }
    }
  }

  return { newVault, updatedAccounts };
}

function transformToV4(oldData: Record<string, unknown>): BackgroundState {
  const oldWallets = safeJsonParse<OldWallets>(oldData['wallet-identities'], { selectedAddress: 0, identities: [] });
  const oldNetworks = safeJsonParse<OldNetworkList>(oldData['ssn-list'], { selected: 0, list: [] });
  const mainnetTokens = safeJsonParse<OldToken[]>(oldData['tokens-list/mainnet'], []);

  const accounts = oldWallets.identities.map(
    (identity) =>
      new Account({
        addr: identity.base16,
        addrType: AddressType.EthCheckSum,
        name: identity.name,
        pubKey: identity.pubKey,
        chainHash: 1,
        chainId: 1,
        slip44: 313,
        index: identity.index,
        encryptedPrivKey: identity.privKey, 
      })
  );

  const wallet = new Wallet({
    walletType: 'hd',
    walletName: 'My Zilliqa Wallet',
    authType: 'mnemonic',
    walletAddress: accounts[oldWallets.selectedAddress]?.addr || '',
    accounts: accounts,
    selectedAccount: oldWallets.selectedAddress,
    tokens: [],
    settings: getDefaultSettings(oldData),
    defaultChainHash: 1,
  });

  const zilTokens = mainnetTokens.map(
    (token) =>
      new FToken({
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        addr: token.base16,
        addrType: AddressType.EthCheckSum,
        logo: null,
        balances: oldWallets.identities.reduce((acc, identity, index) => {
            acc[index] = identity.zrc2[token.base16] || '0';
            return acc;
        }, {} as Record<number, string>),
        rate: token.rate,
        default_: true,
        native: token.symbol === 'ZIL',
        chainHash: 1,
      })
  );

  const zilliqaChain = new ChainConfig({
      name: 'Zilliqa Mainnet',
      logo: 'https://static.debank.com/image/chain/logo_url/zilliqa/a78998063143521b2d076f82b7194635.png',
      chain: 'zilliqa',
      shortName: 'zil',
      rpc: [oldNetworks.list.find(n => n.id === 1)?.api || 'https://api.zilliqa.com'],
      features: [],
      chainId: 1,
      chainIds: [BigInt(1)],
      slip44: 313,
      diffBlockTime: 45,
      chainHash: 1,
      ens: null,
      explorers: [],
      fallbackEnabled: true,
      testnet: false,
      ftokens: zilTokens
  });

  return new BackgroundState({
    wallets: [wallet],
    notificationsGlobalEnabled: true,
    locale: String(oldData['selected-local'] || 'auto'),
    appearances: getTheme(oldData['theme']),
    abbreviatedNumber: false,
    hideBalance: false,
    chains: [zilliqaChain],
  });
}

// --- PUBLIC API ---

export async function migrateStorageToV4(
  oldData: Record<string, unknown>,
  password: string
): Promise<BackgroundState | null> {
  if (!needsMigration(oldData)) {
    return null;
  }

  const v4State = transformToV4(oldData);
  const mainWallet = v4State.wallets[0];

  const { newVault, updatedAccounts } = await migrateEncryptedKeys(
    oldData,
    password,
    mainWallet.accounts
  );

  mainWallet.accounts = updatedAccounts;
  mainWallet.vault = uint8ArrayToBase64(newVault);
  
  return v4State;
}


