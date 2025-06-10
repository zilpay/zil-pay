import { BackgroundState, AppearancesTheme } from '../storage/background';
import { ChainConfig } from '../storage/chain';
import { FToken } from '../storage/ftoken';
import { AuthMethod, Wallet, WalletTypes } from '../storage/wallet';
import { Account } from '../storage/account';
import { AddressType } from '../storage/address-type';
import { WalletSettings, RatesApiOptions } from '../storage/settings';
import { WalletArgon2Params } from '../storage/argon';

interface StorageV2 {
  "address-format": string;
  blocknumber: string;
  connect: string;
  "connection-list": string;
  contacts: string;
  "phishing-detection": string;
  "popup-enabled": string;
  "rate-of-currencies": string;
  "selected-currency": string;
  "selected-local": string;
  "ssn-list": string;
  theme: string;
  time_before_lock: string;
  "tokens-list/mainnet": string;
  vault: string;
  "wallet-identities": string;
}

interface StorageV3 extends StorageV2 {
  "badge-counter": string;
  "confirm/mainnet": string;
  "dex-proto": string;
  "guard-configuration": string;
}

interface SsnList {
  selected: number;
  list: {
    address: string;
    api: string;
    id: number;
    name: string;
    ok: boolean;
    time: number;
  }[];
}

interface WalletIdentities {
  selectedAddress: number;
  identities: {
    name: string;
    bech32: string;
    index: number;
    base16: string;
    type: number;
    pubKey: string;
    privKey?: string;
    zrc2: Record<string, string>;
    nft: Record<string, unknown>;
  }[];
}

interface TokenData {
  base16: string;
  bech32: string;
  decimals: number;
  name: string;
  symbol: string;
  rate: number;
  pool?: string[];
}

export function migrateToV4(storage: Record<string, unknown>, version: number): BackgroundState {
  if (version === 4) return new BackgroundState(storage);
  if (version === 2) return migrateFromV2(storage as StorageV2);
  if (version === 3) return migrateFromV3(storage as StorageV3);

  throw new Error(`Unsupported storage version: ${version}`);
}

export function migrateFromV2(storage: StorageV2): BackgroundState {
  const ssnList: SsnList = JSON.parse(storage["ssn-list"]);
  const chains = ssnList.list.map(chain => {
    const chainId = chain.id;
    const ftokens = parseTokens(storage["tokens-list/mainnet"], chainId);
    return new ChainConfig({
      name: chain.name,
      logo: "",
      chain: "Zilliqa",
      shortName: "ZIL",
      rpc: [chain.api],
      features: [],
      chainId,
      chainIds: [chainId],
      slip44: 19167,
      diffBlockTime: 30,
      chainHash: chainId,
      ens: null,
      explorers: [],
      fallbackEnabled: false,
      testnet: chainId !== 1,
      ftokens,
    });
  });

  const mainChain = chains[0];
  const walletIdentities: WalletIdentities = JSON.parse(storage["wallet-identities"]);
  const accounts = walletIdentities.identities.map(identity => new Account({
    addr: identity.bech32,
    addrType: AddressType.Bech32,
    name: identity.name,
    pubKey: identity.pubKey,
    chainHash: mainChain.chainHash,
    chainId: mainChain.chainId,
    slip44: mainChain.slip44,
    index: identity.index,
  }));

  const wallet = new Wallet({
    walletType: WalletTypes.SecretKey,
    walletName: "ZilPay Wallet",
    authType: AuthMethod.None,
    walletAddress: accounts[0].addr,
    accounts,
    selectedAccount: walletIdentities.selectedAddress,
    tokens: mainChain.ftokens,
    settings: new WalletSettings({
      cipherOrders: [],
      argonParams: new WalletArgon2Params({
        memory: 1024,
        iterations: 3,
        threads: 1,
        secret: "",
      }),
      currencyConvert: storage["selected-currency"],
      ipfsNode: null,
      ensEnabled: false,
      tokensListFetcher: false,
      nodeRankingEnabled: false,
      maxConnections: 10,
      requestTimeoutSecs: 30,
      ratesApiOptions: RatesApiOptions.CoinGecko,
    }),
    defaultChainHash: mainChain.chainHash,
    vault: storage.vault,
  });

  return new BackgroundState({
    wallets: [wallet],
    notificationsGlobalEnabled: true,
    locale: "auto",
    appearances: AppearancesTheme.System,
    abbreviatedNumber: true,
    hideBalance: false,
    storageVersion: 4,
    chains,
  });
}

export function migrateFromV3(storage: StorageV3): BackgroundState {
  const ssnList: SsnList = JSON.parse(storage["ssn-list"]);
  const chains = ssnList.list.map(chain => {
    const chainId = chain.id;
    const ftokens = parseTokens(storage["tokens-list/mainnet"], chainId);
    return new ChainConfig({
      name: chain.name,
      logo: "",
      chain: "Zilliqa",
      shortName: "ZIL",
      rpc: [chain.api],
      features: [],
      chainId,
      chainIds: [BigInt(chainId)],
      slip44: 19167,
      diffBlockTime: 30,
      chainHash: chainId,
      ens: null,
      explorers: [],
      fallbackEnabled: false,
      testnet: chainId !== 1,
      ftokens,
    });
  });

  const mainChain = chains[0];
  const walletIdentities: WalletIdentities = JSON.parse(storage["wallet-identities"]);
  const accounts = walletIdentities.identities.map(identity => new Account({
    addr: identity.bech32,
    addrType: AddressType.Bech32,
    name: identity.name,
    pubKey: identity.pubKey,
    chainHash: mainChain.chainHash,
    chainId: mainChain.chainId,
    slip44: mainChain.slip44,
    index: identity.index,
  }));

  const wallet = new Wallet({
    walletType: "software",
    walletName: "Main Wallet",
    authType: "password",
    walletAddress: accounts[0].addr,
    accounts,
    selectedAccount: walletIdentities.selectedAddress,
    tokens: mainChain.ftokens,
    settings: new WalletSettings({
      cipherOrders: [],
      argonParams: new WalletArgon2Params({
        memory: 1024,
        iterations: 3,
        threads: 1,
        secret: "",
      }),
      currencyConvert: storage["selected-currency"],
      ipfsNode: null,
      ensEnabled: false,
      tokensListFetcher: false,
      nodeRankingEnabled: false,
      maxConnections: 10,
      requestTimeoutSecs: 30,
      ratesApiOptions: RatesApiOptions.CoinGecko,
    }),
    defaultChainHash: mainChain.chainHash,
    vault: storage.vault,
  });

  return new BackgroundState({
    wallets: [wallet],
    notificationsGlobalEnabled: storage["popup-enabled"] === "1",
    locale: storage["selected-local"] === "auto" ? null : storage["selected-local"],
    appearances: storage.theme === "light" ? AppearancesTheme.Light : AppearancesTheme.Dark,
    abbreviatedNumber: false,
    hideBalance: false,
    storageVersion: 4,
    chains,
  });
}

export function parseTokens(tokensJson: string, chainHash: number): FToken[] {
  const tokens: TokenData[] = JSON.parse(tokensJson);

  return tokens.map(token => new FToken({
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    addr: token.bech32,
    addrType: AddressType.Bech32,
    logo: null,
    balances: {},
    rate: token.rate,
    default_: token.symbol === "ZIL",
    native: token.base16 === "0x0000000000000000000000000000000000000000",
    chainHash,
  }));
}
