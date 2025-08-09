import { BackgroundState, type IBackgroundState } from '../storage/background';
import { ChainConfig } from '../storage/chain';
import { FToken } from '../storage/ftoken';
import { Wallet } from '../storage/wallet';
import { Account } from '../storage/account';
import { WalletSettings } from '../storage/settings';
import { HashTypes, WalletHashParams } from '../storage/argon';
import { CipherOrders } from '../../crypto/keychain';
import { ShaAlgorithms } from '../../config/pbkdf2';
import { AddressType } from 'crypto/address';
import { uuid } from 'crypto/uuid';
import { Themes } from 'config/theme';
import { RatesApiOptions } from 'config/api';
import { AuthMethod, WalletTypes } from 'config/wallet';
import { Locales } from 'config/locale';

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

type TokenWithBase16 = { ftoken: FToken; base16: string };

const ZILLIQA_MAINNET_CHAIN = new ChainConfig({
    name: 'Zilliqa',
    chain: 'ZIL',
    logo: 'https://raw.githubusercontent.com/zilpay/tokens_meta/refs/heads/master/ft/%{shortName}%/chain/%{dark,light}%.svg',
    rpc: [
      'https://api.zilliqa.com',
      'https://ssn.zilpay.io/api',
      'https://zilliqa.avely.fi/api',
      'https://ssn.zillet.io',
    ],
    features: [],
    ftokens: [
      new FToken({
        native: true,
        logo: 'https://raw.githubusercontent.com/zilpay/tokens_meta/refs/heads/master/ft/zilliqa/%{contract_address}%/%{dark,light}%.webp',
        addr: '0x0000000000000000000000000000000000000000',
        name: 'Zilliqa',
        symbol: 'ZIL',
        decimals: 18,
        addrType: AddressType.EthCheckSum,
        balances: {},
        rate: 0,
        default_: true,
        chainHash: 1
      }),
      new FToken({
        native: true,
        logo: 'https://raw.githubusercontent.com/zilpay/tokens_meta/refs/heads/master/ft/zilliqa/%{contract_address}%/%{dark,light}%.webp',
        addr: 'zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz',
        name: 'Zilliqa',
        symbol: 'ZIL',
        decimals: 12,
        addrType: AddressType.Bech32,
        balances: {},
        rate: 0,
        default_: true,
        chainHash: 1
      }),
    ],
    chainIds: [32769, 1],
    shortName: 'zilliqa',
    slip44: 313,
    explorers: [
      {
        name: 'Viewblock',
        url: 'https://viewblock.io/zilliqa',
        icon: 'https://viewblock.io/apple-touch-icon.png',
        standard: 3091,
      },
      {
        name: 'Otterscan',
        icon: 'https://otterscan.zilliqa.com/assets/otter-DYFeLtFi.png',
        url: 'https://otterscan.zilliqa.com/',
        standard: 3091,
      },
    ],
    chainId: 1,
    diffBlockTime: 30,
    ens: null,
    fallbackEnabled: false,
    testnet: false
});

export function migrateToV4(storage: IBackgroundState): BackgroundState {
  if (storage.storageVersion == 4) {
    return new BackgroundState(storage);
  } else {
      return migrateFromV2orV3(storage as any);
  }
}

function parseTokens(tokensJson: string, chainHash: number): TokenWithBase16[] {
    const tokens: TokenData[] = JSON.parse(tokensJson);
    return tokens.map(token => ({
      ftoken: new FToken({
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        addr: token.bech32,
        addrType: AddressType.Bech32,
        logo: `https://raw.githubusercontent.com/zilpay/tokens_meta/refs/heads/master/ft/zilliqa/${token.bech32}/%{dark,light}%.webp`,
        balances: {},
        rate: token.rate,
        default_: token.symbol === 'ZIL',
        native: token.base16 === '0x0000000000000000000000000000000000000000',
        chainHash,
      }),
      base16: token.base16,
    }));
  }

function migrateFromV2orV3(storage: Record<string, unknown>): BackgroundState {
    const walletIdentities: WalletIdentities = JSON.parse(storage['wallet-identities'] as string);
    const mainChain = ZILLIQA_MAINNET_CHAIN;
    const cipher = 'guard-configuration' in storage ? CipherOrders.AESGCM256 : CipherOrders.AESCBC;
    const parsedTokens = parseTokens(storage['tokens-list/mainnet'] as string, mainChain.hash());
    let [algorithm, iteractions] = String(storage["guard-configuration"]).split(":");

    if (!iteractions) {
      iteractions = '0';
    }

    if (!algorithm || (algorithm != ShaAlgorithms.sha256 && algorithm != ShaAlgorithms.Sha512)) {
      algorithm = ShaAlgorithms.sha256;
    }

    const accounts = walletIdentities.identities.map(identity => new Account({
        addr: identity.bech32,
        addrType: AddressType.Bech32,
        name: identity.name,
        pubKey: identity.pubKey,
        chainHash: mainChain.hash(),
        chainId: mainChain.chainId,
        slip44: mainChain.slip44,
        index: identity.index,
    }));

    const walletTokens = parsedTokens.map(({ ftoken, base16 }) => {
        const balances: Record<number, string> = {};
        accounts.forEach((_, index) => {
            const identity = walletIdentities.identities[index];
            balances[index] = identity.zrc2[base16.toLowerCase()] || '0';
        });
        return new FToken({ ...ftoken, balances });
    });

    const wallet = new Wallet({
        history: [],
        confirm: [],
        walletType: WalletTypes.SecretPhrase,
        walletName: 'Zilliqa Wallet',
        authType: AuthMethod.None,
        uuid: uuid(),
        accounts,
        selectedAccount: walletIdentities.selectedAddress,
        tokens: walletTokens, 
        settings: new WalletSettings({
            cipherOrders: [cipher],
            hashFnParams: new WalletHashParams({
                memory: 1024,
                iterations: Number(iteractions),
                threads: 1,
                secret: '',
                hashType: HashTypes.Pbkdf2, 
                hashSize: algorithm as ShaAlgorithms ?? ShaAlgorithms.sha256,
            }),
            currencyConvert: String(storage['selected-currency']),
            ipfsNode: null,
            ensEnabled: false,
            tokensListFetcher: false,
            nodeRankingEnabled: false,
            maxConnections: 10,
            requestTimeoutSecs: 30,
            ratesApiOptions: RatesApiOptions.CoinGecko,
                sessionTime: Number(storage['time_before_lock']) || 3600,
        }),
        defaultChainHash: mainChain.hash(),
        vault: String(storage.vault),
    });

    const backgroundState = new BackgroundState({
        storageVersion: 4,
        wallets: [wallet],
        selectedWallet: 0,
        notificationsGlobalEnabled: true,
        locale: Locales.Auto,
        appearances: Themes.System,
        abbreviatedNumber: true,
        hideBalance: false,
        chains: [mainChain], 
    });

    return backgroundState;
}

