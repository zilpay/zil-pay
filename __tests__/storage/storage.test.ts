import {
  BackgroundState,
  AppearancesTheme,
} from "../../background/storage/background";
import { ChainConfig } from "../../background/storage/chain";
import {
  Wallet,
  AuthMethod,
  WalletTypes,
} from "../../background/storage/wallet";
import { HashTypes } from "../../background/storage/argon";
import { CipherOrders } from "../../crypto/keychain";
import { AddressType } from "../../crypto/keypair";
import { ShaAlgorithms } from "../../config/pbkdf2";
import { describe, expect, it } from "vitest";
import { CHAINS } from "../data";

describe("BackgroundState", () => {
  it("should initialize with correct properties", () => {
    const mockData = {
      wallets: [
        {
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
          },
          defaultChainHash: 1,
          vault: "testVault",
        },
      ],
      notificationsGlobalEnabled: true,
      locale: "en",
      appearances: AppearancesTheme.System,
      abbreviatedNumber: true,
      hideBalance: false,
      chains: CHAINS,
    };

    const state = new BackgroundState(mockData);

    expect(state.storageVersion).toBe(4);
    expect(state.wallets).toHaveLength(1);
    expect(state.wallets[0]).toBeInstanceOf(Wallet);
    expect(state.notificationsGlobalEnabled).toBe(true);
    expect(state.locale).toBe("en");
    expect(state.appearances).toBe(AppearancesTheme.System);
    expect(state.abbreviatedNumber).toBe(true);
    expect(state.hideBalance).toBe(false);
    expect(state.chains).toHaveLength(3);
    expect(state.chains[0]).toBeInstanceOf(ChainConfig);
  });

  it("should handle null locale correctly", () => {
    const mockData = {
      wallets: [],
      notificationsGlobalEnabled: false,
      locale: null,
      appearances: AppearancesTheme.Dark,
      abbreviatedNumber: false,
      hideBalance: true,
      chains: [],
    };

    const state = new BackgroundState(mockData);

    expect(state.locale).toBeNull();
    expect(state.appearances).toBe(AppearancesTheme.Dark);
    expect(state.abbreviatedNumber).toBe(false);
    expect(state.hideBalance).toBe(true);
  });
});
