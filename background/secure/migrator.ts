import { BackgroundState, type IBackgroundState } from '../storage/background';
import { ChainConfig, type IChainConfigState } from '../storage/chain';
import { FToken } from '../storage/ftoken';
import { Wallet } from '../storage/wallet';
import { Account } from '../storage/account';
import { WalletSettings } from '../storage/settings';
import { WalletHashParams } from '../storage/argon';
import { ShaAlgorithms } from '../../config/pbkdf2';
import { uuid } from 'crypto/uuid';
import { Themes } from 'config/theme';
import { RatesApiOptions } from 'config/api';
import { AddressType, AuthMethod, WalletTypes } from 'config/wallet';
import { Locales } from 'config/locale';
import { GasSpeed } from 'config/gas';
import { HashTypes } from 'config/argon2';
import { CipherOrders } from 'config/keychain';
import { ZILLIQA } from 'config/slip44';

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

export async function migrateToV4(storage: IBackgroundState): Promise<BackgroundState> {
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

async function migrateFromV2orV3(storage: Record<string, unknown>): Promise<BackgroundState> {
    const walletIdentities: WalletIdentities = JSON.parse(storage['wallet-identities'] as string);
    const zilliqaMainnetRes = await fetch("/chains/mainnet.json");;
    const mainnet = await zilliqaMainnetRes.json();
    const mainChain = mainnet.find((c: IChainConfigState) => c.slip44 == ZILLIQA);
    const mainnetZilliqaChain = new ChainConfig(mainChain);
    const cipher = 'guard-configuration' in storage ? CipherOrders.AESGCM256 : CipherOrders.AESCBC;
    const parsedTokens = parseTokens(storage['tokens-list/mainnet'] as string, mainnetZilliqaChain.hash());
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
        chainHash: mainnetZilliqaChain.hash(),
        chainId: mainnetZilliqaChain.chainId,
        slip44: mainnetZilliqaChain.slip44,
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
        nft: [],
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
            ensEnabled: false,
            tokensListFetcher: false,
            gasOption: GasSpeed.Market,
            ratesApiOptions: RatesApiOptions.CoinGecko,
            sessionTime: Number(storage['time_before_lock']) || 3600,
        }),
        defaultChainHash: mainnetZilliqaChain.hash(),
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
        tokensRow: true,
        chains: [mainnetZilliqaChain], 
        book: [],
        connections: {
          list: [],
        }
    });

    return backgroundState;
}

