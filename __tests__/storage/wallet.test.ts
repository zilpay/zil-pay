import { describe, it, expect } from "vitest";
import { Wallet, WalletTypes, AuthMethod } from "../../background/storage/wallet";
import { RatesApiOptions, WalletSettings } from "../../background/storage/settings";
import { ChainConfig } from "../../background/storage/chain";
import { WORD_LIST } from "../crypto/word_list";
import { CHAINS, PASSWORD } from '../data';
import { CipherOrders } from "../../crypto/keychain";
import { ShaAlgorithms } from "../../config/pbkdf2";
import { utils } from "aes-js";
import { AddressType } from "../../background/storage/address-type";

describe("Wallet.fromBip39", () => {
  const MNEMONIC = "green process gate doctor slide whip priority shrug diamond crumble average help";

  it("creates accounts from valid mnemonic with correct properties zilliqa network", async () => {
    const bip32Accounts = [{ index: 0, name: "account 0" }];
    const settings = new WalletSettings({
      cipherOrders: [CipherOrders.NTRUP761],
      hashFnParams: {
        memory: 4096,
        iterations: 3,
        threads: 1,
        secret: new Uint8Array(0),
        hashType: 0,
        hashSize: ShaAlgorithms.Sha512,
      },
      currencyConvert: "btc",
      ipfsNode: null,
      ensEnabled: false,
      tokensListFetcher: false,
      nodeRankingEnabled: false,
      maxConnections: 10,
      requestTimeoutSecs: 30,
      ratesApiOptions: RatesApiOptions.CoinGecko,
    });
    const chain = new ChainConfig(CHAINS[0]);

    const newWallet = await Wallet.fromBip39(
      MNEMONIC,
      true,
      "Test Wallet",
      bip32Accounts,
      settings,
      chain,
      PASSWORD,
      WORD_LIST,
    );

    // Wallet properties
    expect(newWallet.walletType).toBe(WalletTypes.SecretPhrase);
    expect(newWallet.walletName).toBe("Test Wallet");
    expect(newWallet.authType).toBe(AuthMethod.None);
    expect(newWallet.selectedAccount).toBe(0);
    expect(newWallet.defaultChainHash).toBe(210272552);

    // Accounts
    expect(newWallet.accounts).toHaveLength(1);
    const account = newWallet.accounts[0];
    expect(account.addr).toBe("zil1a0vtxuxamd3kltmyzpqdyxqu25vsss8mp58jtu");
    expect(account.addrType).toBe(0);
    expect(account.name).toBe("account 0");
    expect(account.pubKey).toBe("03150a7f37063b134cde30070431a69148d60b252f4c7b38de33d813d329a7b7da");
    expect(account.chainHash).toBe(chain.hash());
    expect(account.chainId).toBe(32770);
    expect(account.slip44).toBe(313);
    expect(account.index).toBe(0);

    // Tokens
    expect(newWallet.tokens).toHaveLength(2);
    const token1 = newWallet.tokens[0];
    expect(token1.name).toBe("Zilliqa");
    expect(token1.symbol).toBe("ZIL");
    expect(token1.decimals).toBe(18);
    expect(token1.addr).toBe("0x0000000000000000000000000000000000000000");
    expect(token1.addrType).toBe(0);
    expect(token1.logo).toBe("https://raw.githubusercontent.com/zilpay/tokens_meta/refs/heads/master/ft/zilliqa/%{contract_address}%/%{dark,light}%.webp");
    expect(token1.balances).toEqual({});
    expect(token1.rate).toBe(0);
    expect(token1.default_).toBe(true);
    expect(token1.native).toBe(true);
    expect(token1.chainHash).toBe(chain.hash());

    const token2 = newWallet.tokens[1];
    expect(token2.name).toBe("Zilliqa Scilla");
    expect(token2.decimals).toBe(12);
    expect(token2.addr).toBe("zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz");

    // Settings
    expect(newWallet.settings.cipherOrders).toEqual([CipherOrders.NTRUP761]);
    expect(newWallet.settings.hashFnParams).toEqual({
      memory: 4096,
      iterations: 3,
      threads: 1,
      secret: new Uint8Array(0),
      hashType: 0,
      hashSize: ShaAlgorithms.Sha512,
    });
    expect(newWallet.settings.currencyConvert).toBe("btc");
    expect(newWallet.settings.ipfsNode).toBeNull();
    expect(newWallet.settings.ensEnabled).toBe(false);
    expect(newWallet.settings.tokensListFetcher).toBe(false);
    expect(newWallet.settings.nodeRankingEnabled).toBe(false);
    expect(newWallet.settings.maxConnections).toBe(10);
    expect(newWallet.settings.requestTimeoutSecs).toBe(30);
    expect(newWallet.settings.ratesApiOptions).toBe(RatesApiOptions.CoinGecko);

    // Vault
    expect(newWallet.vault).toBeDefined();
    expect(typeof newWallet.vault).toBe("string");

    const decrypted = await newWallet.decrypt(utils.utf8.toBytes(PASSWORD));

    expect(decrypted).toBe(MNEMONIC);
  });

  it("creates accounts from valid mnemonic with correct properties for Ethereum", async () => {
    const bip32Accounts = [{ index: 0, name: "account 0" }];
    const settings = new WalletSettings({
      cipherOrders: [CipherOrders.NTRUP761],
      hashFnParams: {
        memory: 4096,
        iterations: 3,
        threads: 1,
        secret: new Uint8Array(0),
        hashType: 0,
        hashSize: ShaAlgorithms.Sha512,
      },
      currencyConvert: "btc",
      ipfsNode: null,
      ensEnabled: true,
      tokensListFetcher: false,
      nodeRankingEnabled: false,
      maxConnections: 10,
      requestTimeoutSecs: 30,
      ratesApiOptions: RatesApiOptions.CoinGecko,
    });
    const chain = new ChainConfig(CHAINS[2]);
    const newWallet = await Wallet.fromBip39(
      MNEMONIC,
      true,
      "Test Ethereum Wallet",
      bip32Accounts,
      settings,
      chain,
      PASSWORD,
      WORD_LIST,
    );

    // Wallet properties
    expect(newWallet.walletType).toBe(WalletTypes.SecretPhrase);
    expect(newWallet.walletName).toBe("Test Ethereum Wallet");
    expect(newWallet.authType).toBe(AuthMethod.None);
    expect(newWallet.selectedAccount).toBe(0);
    expect(newWallet.defaultChainHash).toBe(chain.hash());

    // Accounts
    expect(newWallet.accounts).toHaveLength(1);
    const account = newWallet.accounts[0];
    expect(account.addr).toBe("0x7aa13D6AE95fb8E843d3bCC2eea365F71c3bACbe");
    expect(account.addrType).toBe(AddressType.EthCheckSum);
    expect(account.name).toBe("account 0");
    expect(account.pubKey).toBe("0315bd7b9301a2cde69ef8092d6fb275a077e3c94e5ed166c915426850cf606600");
    expect(account.chainHash).toBe(chain.hash());
    expect(account.chainId).toBe(11155111);
    expect(account.slip44).toBe(60);
    expect(account.index).toBe(0);

    // Tokens
    expect(newWallet.tokens).toHaveLength(1);
    const token = newWallet.tokens[0];
    expect(token.name).toBe("Ethereum");
    expect(token.symbol).toBe("ETH");
    expect(token.decimals).toBe(18);
    expect(token.addr).toBe("0x0000000000000000000000000000000000000000");
    expect(token.addrType).toBe(AddressType.EthCheckSum);
    expect(token.logo).toBe("https://raw.githubusercontent.com/zilpay/tokens_meta/refs/heads/master/ft/bnbchain/%{contract_address}%/%{dark,light}%.webp");
    expect(token.balances).toEqual({});
    expect(token.rate).toBe(0);
    expect(token.default_).toBe(true);
    expect(token.native).toBe(true);
    expect(token.chainHash).toBe(chain.hash());

    // Settings
    expect(newWallet.settings.cipherOrders).toEqual([CipherOrders.NTRUP761]);
    expect(newWallet.settings.hashFnParams).toEqual({
      memory: 4096,
      iterations: 3,
      threads: 1,
      secret: new Uint8Array(0),
      hashType: 0,
      hashSize: ShaAlgorithms.Sha512,
    });
    expect(newWallet.settings.currencyConvert).toBe("btc");
    expect(newWallet.settings.ipfsNode).toBeNull();
    expect(newWallet.settings.ensEnabled).toBe(true);
    expect(newWallet.settings.tokensListFetcher).toBe(false);
    expect(newWallet.settings.nodeRankingEnabled).toBe(false);
    expect(newWallet.settings.maxConnections).toBe(10);
    expect(newWallet.settings.requestTimeoutSecs).toBe(30);
    expect(newWallet.settings.ratesApiOptions).toBe(RatesApiOptions.CoinGecko);

    // Vault
    expect(newWallet.vault).toBeDefined();
    expect(typeof newWallet.vault).toBe("string");

    const decrypted = await newWallet.decrypt(utils.utf8.toBytes(PASSWORD));
    expect(decrypted).toBe(MNEMONIC);
  });
});

