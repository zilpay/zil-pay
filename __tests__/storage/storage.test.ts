import {
  BackgroundState,
} from "../../background/storage/background";
import { Themes } from "../../config/theme";
import { Locales } from "../../config/locale";
import { ChainConfig } from "../../background/storage/chain";
import {
  Wallet,
} from "../../background/storage/wallet";
import { WalletTypes, AuthMethod, AddressType } from "../../config/wallet";
import { ShaAlgorithms } from "../../config/pbkdf2";
import { describe, expect, it } from "vitest";
import { CHAINS } from "../data";
import { HashTypes } from "config/argon2";
import { GasSpeed } from "config/gas";
import { uuid } from "crypto/uuid";
import { CipherOrders } from "config/keychain";

describe("BackgroundState", () => {
  it("should initialize with correct properties", () => {
    const mockData = {
      wallets: [
        {
          uuid: uuid(),
          history: [],
          confirm: [],
          walletType: WalletTypes.SecretPhrase,
          walletName: "Test Wallet",
          authType: AuthMethod.None,
          walletAddress: "zil1testaddress",
          accounts: [
            {
              addr: "zil1testaddress",
              addrType: AddressType.Bech32,
              name: "Test Account",
              pubKey: "testPubKey",
              chainHash: 1,
              chainId: 1,
              slip44: 313,
              index: 0,
            },
          ],
          selectedAccount: 0,
          nft: [],
          tokens: [
            {
              name: "Zilliqa",
              symbol: "ZIL",
              decimals: 12,
              addr: "zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz",
              addrType: AddressType.Bech32,
              logo: null,
              balances: { 0: "1000" },
              rate: 0,
              default_: true,
              native: true,
              chainHash: 1,
            },
          ],
          settings: {
            cipherOrders: [CipherOrders.AESCBC],
            sessionTime: 0,
            hashFnParams: {
              memory: 1024,
              iterations: 0,
              threads: 1,
              secret: "",
              hashType: HashTypes.Pbkdf2,
              hashSize: ShaAlgorithms.sha256,
            },
            currencyConvert: "btc",
            ipfsNode: null,
            ensEnabled: false,
            tokensListFetcher: false,
            nodeRankingEnabled: false,
            maxConnections: 10,
            requestTimeoutSecs: 30,
            ratesApiOptions: 0,
            GasSpeed: GasSpeed.Market,
            gasOption: GasSpeed.Market,
          },
          defaultChainHash: 1,
          vault: "testVault",
        },
      ],
      tokensRow: false,
      notificationsGlobalEnabled: true,
      locale: Locales.Auto,
      appearances: Themes.System,
      abbreviatedNumber: true,
      hideBalance: false,
      chains: CHAINS,
      book: [],
      selectedWallet: 0,
      storageVersion: 0,
      connections: {
        list: [],
      },
    };

    const state = new BackgroundState(mockData);

    expect(state.storageVersion).toBe(4);
    expect(state.wallets).toHaveLength(1);
    expect(state.wallets[0]).toBeInstanceOf(Wallet);
    expect(state.notificationsGlobalEnabled).toBe(true);
    expect(state.locale).toBe(Locales.Auto);
    expect(state.appearances).toBe(Themes.System);
    expect(state.abbreviatedNumber).toBe(true);
    expect(state.hideBalance).toBe(false);
    expect(state.chains).toHaveLength(3);
    expect(state.chains[0]).toBeInstanceOf(ChainConfig);
  });

  it("should handle null locale correctly", () => {
    const mockData = {
      wallets: [],
      notificationsGlobalEnabled: false,
      locale: Locales.Auto,
      appearances: Themes.Dark,
      abbreviatedNumber: false,
      hideBalance: true,
      chains: [],
      storageVersion: 0,
      selectedWallet: 0,
      tokensRow: false,
      book: [],
      connections: {
        list: [],
      },
    };

    const state = new BackgroundState(mockData);

    expect(state.locale).toBe(Locales.Auto);
    expect(state.appearances).toBe(Themes.Dark);
    expect(state.abbreviatedNumber).toBe(false);
    expect(state.hideBalance).toBe(true);
  });
});
