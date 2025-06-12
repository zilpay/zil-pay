import { describe, it, expect } from "vitest";
import { Wallet, WalletTypes, AuthMethod } from "../../background/storage/wallet";
import { RatesApiOptions, WalletSettings } from "../../background/storage/settings";
import { ChainConfig } from "../../background/storage/chain";
import { WORD_LIST } from "../crypto/word_list";
import { CHAINS } from '../data';
import { ShaAlgorithms } from "../../config/pbkdf2";
import { HashTypes, WalletHashParams } from "../../background/storage/argon";
import { CipherOrders } from "../../crypto/keychain";

describe("Wallet.fromBip39", () => {
  it("creates accounts from valid mnemonic", async () => {
    const mnemonic = "green process gate doctor slide whip priority shrug diamond crumble average help";
    const bip32Accounts = [{ index: 0, name: "account 0" }];
    const settings = new WalletSettings({
        cipherOrders: [CipherOrders.NTRUP761],
        hashFnParams: WalletHashParams.default(),
        currencyConvert: "",
        ipfsNode: null,
        ensEnabled: false,
        tokensListFetcher: false,
        nodeRankingEnabled: false,
        maxConnections: 10,
        requestTimeoutSecs: 30,
        ratesApiOptions: RatesApiOptions.CoinGecko,
      });
    const chain = new ChainConfig(CHAINS[0]);

    await Wallet.fromBip39(mnemonic, true, "Test Wallet", bip32Accounts, settings, chain, WORD_LIST);
  });
});

