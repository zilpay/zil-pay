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
import { Address } from 'crypto/address';
import { hexToUint8Array } from 'lib/utils/hex';

interface Identities {
  name: string;
  bech32: string;
  index: number;
  base16: string;
  type: number;
  pubKey: string;
  privKey?: string;
  zrc2: Record<string, string>;
  nft: Record<string, unknown>;
}

interface WalletIdentities {
  selectedAddress: number;
  identities: Identities[];
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
    const bip39WalletIdentities = walletIdentities.identities.filter((a) => a.type == 2);
    const keyWalletIdentities = walletIdentities.identities.filter((a) => a.type == 1);

    const parseAccount = async (identity: Identities) => {
      const pubKeyBytes = hexToUint8Array(identity.pubKey);
      const addrBech32 = await Address.fromPubKeyType(pubKeyBytes, AddressType.Bech32);
      const addrEVM = await Address.fromPubKeyType(pubKeyBytes, AddressType.EthCheckSum);
      const addr = `${await addrBech32.toZilBech32()}:${await addrEVM.toEthChecksum()}`;
      return new Account({
        addr: addr,
        addrType: AddressType.Bech32,
        name: identity.name,
        pubKey: identity.pubKey,
        chainHash: mainnetZilliqaChain.hash(),
        chainId: mainnetZilliqaChain.chainId,
        slip44: mainnetZilliqaChain.slip44,
        index: identity.index,
      });
    }

    const settings = new WalletSettings({
        cipherOrders: [cipher],
        hashFnParams: new WalletHashParams({
            memory: 1024,
            iterations: Number(iteractions),
            threads: 1,
            secret: '',
            hashType: HashTypes.Pbkdf2, 
            hashSize: algorithm as ShaAlgorithms ?? ShaAlgorithms.sha256,
        }),
        currencyConvert: "BTC",
        ensEnabled: false,
        tokensListFetcher: false,
        gasOption: GasSpeed.Market,
        ratesApiOptions: RatesApiOptions.CoinGecko,
        sessionTime: 3600,
    }); 
    const bip39Accounts = await Promise.all(bip39WalletIdentities.map(parseAccount));
    const keyAccounts = await Promise.all(keyWalletIdentities.map(parseAccount));
    const walletTokens = parsedTokens.map(({ ftoken }) => {
        const balances: Record<number, string> = {};
        return new FToken({ ...ftoken, balances });
    }).filter((t) => !t.native);
    let wallets: Wallet[] = [];
    const tokens = [...mainnetZilliqaChain.ftokens, ...walletTokens];

    wallets.push(new Wallet({
        history: [],
        confirm: [],
        walletType: WalletTypes.SecretPhrase,
        walletName: bip39Accounts[0].name,
        authType: AuthMethod.None,
        uuid: uuid(),
        accounts: bip39Accounts,
        nft: [],
        selectedAccount: 0,
        tokens,
        settings,
        defaultChainHash: mainnetZilliqaChain.hash(),
        vault: String(storage.vault),
    }));

    if (keyAccounts.length > 0) {
      keyWalletIdentities.forEach((a, index) => {
        wallets.push(new Wallet({
            history: [],
            confirm: [],
            walletType: WalletTypes.SecretKey,
            walletName: keyAccounts[index].name,
            authType: AuthMethod.None,
            uuid: uuid(),
            accounts: [keyAccounts[index]],
            nft: [],
            selectedAccount: 0,
            tokens,
            settings,
            defaultChainHash: mainnetZilliqaChain.hash(),
            vault: String(a.privKey),
        }));
      });
    }

    const backgroundState = new BackgroundState({
        wallets,
        storageVersion: 4,
        selectedWallet: -1,
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

