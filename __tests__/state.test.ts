import "./setupTests";
import { describe, it, expect, beforeAll } from "vitest";
import { GlobalState } from "../background/state";
import {
  BackgroundState,
} from "../background/storage/background";
import { Themes } from "../config/theme";
import {
  createBscConfig,
  createEthConfig,
  PASSWORD,
  STORAGE_V2,
  STORAGE_V3,
  WORDS,
} from "./data";
import { BrowserStorage } from "../lib/storage";
import { AuthMethod, Wallet, WalletTypes } from "../background/storage/wallet";
import { AddressType } from "../crypto/address";
import { CipherOrders } from "../crypto/keychain";
import { HashTypes } from "../background/storage/argon";
import { ShaAlgorithms } from "../config/pbkdf2";
import { FToken } from "../background/storage/ftoken";
import { utf8ToUint8Array } from "../lib/utils/utf8";
import { ChainConfig } from "../background/storage/chain";
import {
  RatesApiOptions,
  WalletSettings,
} from "../background/storage/settings";
import { WORD_LIST } from "./crypto/word_list";
import {
  HistoricalTransaction,
  TransactionStatus,
} from "../background/rpc/history_tx";

describe("test bg state with empty storage", () => {
  beforeAll(async () => {
    await BrowserStorage.clear();
  });

  it("should init from emtpy storage", async () => {
    const globalState = await GlobalState.fromStorage();
    expect(globalState.state).toStrictEqual(BackgroundState.default());
  });

  it("should save storage", async () => {
    const globalState = await GlobalState.fromStorage();

    expect(globalState.state).toStrictEqual(BackgroundState.default());

    globalState.state.appearances = Themes.Light;
    globalState.state.abbreviatedNumber = false;
    globalState.state.chains.push(createBscConfig());
    globalState.state.chains.push(createEthConfig());

    await globalState.sync();

    const restoredGlobalState = await GlobalState.fromStorage();

    expect(restoredGlobalState).toStrictEqual(globalState);
  });

  it("should save storage", async () => {
    await BrowserStorage.clear();
    const globalState = await GlobalState.fromStorage();

    expect(globalState.state).toStrictEqual(BackgroundState.default());

    globalState.state.chains.push(createBscConfig());

    const bip32Accounts = [
      { index: 0, name: "account 0" },
      { index: 1, name: "account 1" },
      { index: 2, name: "account 2" },
      { index: 3, name: "account 3" },
      { index: 4, name: "account 4" },
    ];
    const settings = new WalletSettings({
      cipherOrders: [
        CipherOrders.KUZNECHIK,
        CipherOrders.NTRUP761,
        CipherOrders.AESGCM256,
      ],
      hashFnParams: {
        memory: 4096,
        iterations: 3,
        threads: 1,
        secret: "",
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
      ratesApiOptions: RatesApiOptions.None,
      sessionTime: 3600,
    });
    const bip39Wallet = await Wallet.fromBip39(
      WORDS,
      true,
      "Test Wallet",
      bip32Accounts,
      settings,
      globalState.state.chains[0],
      PASSWORD,
      WORD_LIST,
    );

    globalState.state.wallets.push(bip39Wallet);

    const historicalTx = new HistoricalTransaction({
      transaction_hash:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      amount: 1000n,
      sender: "zil1senderaddress",
      recipient: "zil1recipientaddress",
      contract_address: null,
      status: TransactionStatus.Success,
      status_code: 3,
      timestamp: 1672531200000,
      block_number: 12345n,
      gasUsed: 21000n,
      gasLimit: 21000n,
      gasPrice: 1000000000n,
      blobGasUsed: null,
      blobGasPrice: null,
      effectiveGasPrice: 1000000000n,
      fee: 21000000000000n,
      icon: null,
      title: "Test Transaction",
      error: null,
      sig: "0xabcdef123456",
      nonce: 1n,
      token_info: null,
      chain_type: "Scilla",
      chain_hash: globalState.state.chains[0].hash(),
      data: "some data",
      code: "some code",
    });

    globalState.state.wallets[0].history.push(historicalTx);

    await globalState.sync();
    const restoredGlobalState = await GlobalState.fromStorage();
    expect(JSON.stringify(restoredGlobalState.state)).toEqual(
      JSON.stringify(globalState.state),
    );
  });
});

describe("test bg state with storagev2", () => {
  beforeAll(async () => {
    await BrowserStorage.clear();
    await BrowserStorage.set(STORAGE_V2);
  });

  it("should init from storage v2", async () => {
    const globalState = await GlobalState.fromStorage();

    expect(globalState.state.chains.length).toBe(1);
    expect(globalState.state.wallets.length).toBe(1);

    const wallet: Wallet = globalState.state.wallets[0];

    expect(wallet.walletType).toBe(WalletTypes.SecretPhrase);
    expect(wallet.walletName).toBe("Zilliqa Wallet");
    expect(wallet.authType).toBe(AuthMethod.None);
    expect(wallet.selectedAccount).toBe(1);
    expect(wallet.defaultChainHash).toBe(208425510);
    expect(wallet.vault).toBe(
      "U2FsdGVkX19+DrC9DG/qvYEC6koZfMhpQl6K4eVH5GSE1qXyn4vENND7zZFNT5R4yZM/45MiWMTw+Olu2Va948mputTGoby3VfmNmIm1uiVgRYt6hycdMiUBFuWs0KqN",
    );

    expect(wallet.accounts.length).toBe(2);
    const [account0, account1] = wallet.accounts;

    expect(account0.name).toBe("Account 0");
    expect(account0.addr).toBe("zil1ntrynx04349sk6py7uyata03gka6qswg7um95y");
    expect(account0.addrType).toBe(AddressType.Bech32);
    expect(account0.pubKey).toBe(
      "0316f2d913f13c6aa15ad5c80b58464d25b6363a1b9d997260e8061977a3f43e10",
    );
    expect(account0.index).toBe(0);

    expect(account1.name).toBe("Imported 0");
    expect(account1.addr).toBe("zil14at57zaj4pe3tuy734usy2xnlquapkd4d0ne43");
    expect(account1.addrType).toBe(AddressType.Bech32);
    expect(account1.pubKey).toBe(
      "0232970d0472220180c1779610f0ffae5a1ad79048b4f01f366c52d99317534024",
    );
    expect(account1.index).toBe(0);

    expect(wallet.tokens.length).toBe(2);
    const zilToken = wallet.tokens.find((t: FToken) => t.symbol === "ZIL");
    const zlpToken = wallet.tokens.find((t: FToken) => t.symbol === "ZLP");

    expect(zilToken).toBeDefined();
    expect(zilToken?.name).toBe("Zilliqa");
    expect(zilToken?.decimals).toBe(12);
    expect(zilToken?.addr).toBe("zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz");
    expect(zilToken?.addrType).toBe(AddressType.Bech32);
    expect(zilToken?.balances).toEqual({ "0": "0", "1": "0" });
    expect(zilToken?.rate).toBe(1);
    expect(zilToken?.default_).toBe(true);
    expect(zilToken?.native).toBe(true);

    expect(zlpToken).toBeDefined();
    expect(zlpToken?.name).toBe("ZilPay wallet");
    expect(zlpToken?.decimals).toBe(18);
    expect(zlpToken?.addr).toBe("zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4");
    expect(zlpToken?.balances).toEqual({ "0": "0", "1": "0" });
    expect(zlpToken?.rate).toBe(2.7688998049);
    expect(zlpToken?.default_).toBe(false);
    expect(zlpToken?.native).toBe(false);

    const { settings } = wallet;
    expect(settings.cipherOrders).toEqual([CipherOrders.AESCBC]);
    expect(settings.currencyConvert).toBe("usd");
    expect(settings.requestTimeoutSecs).toBe(30);

    const { hashFnParams } = settings;
    expect(hashFnParams.hashType).toBe(HashTypes.Pbkdf2);
    expect(hashFnParams.hashSize).toBe(ShaAlgorithms.sha256);
    expect(hashFnParams.iterations).toBe(0);
    expect(hashFnParams.memory).toBe(1024);
    expect(hashFnParams.threads).toBe(1);

    const chain: ChainConfig = globalState.state.chains[0];
    const passowrd = utf8ToUint8Array(PASSWORD);
    await wallet.unlock(passowrd);
    const words = await wallet.revealMnemonic(passowrd, chain);

    expect(words).toBe(WORDS);
  });
});

describe("test bg state with storagev3", () => {
  beforeAll(async () => {
    await BrowserStorage.clear();
    await BrowserStorage.set(STORAGE_V3);
  });

  it("should init from storage v3", async () => {
    const globalState = await GlobalState.fromStorage();

    expect(globalState.state.chains.length).toBe(1);
    expect(globalState.state.wallets.length).toBe(1);

    const wallet: Wallet = globalState.state.wallets[0];

    expect(wallet.walletType).toBe(WalletTypes.SecretPhrase);
    expect(wallet.walletName).toBe("Zilliqa Wallet");
    expect(wallet.authType).toBe(AuthMethod.None);
    expect(wallet.selectedAccount).toBe(1);
    expect(wallet.defaultChainHash).toBe(208425510);
    expect(wallet.vault).toBe(
      "ZGM1ODdhZGI0YWVhY2E3Njk4MDJlYTEyMzMxOGY5OGZlMjMxMzNhYzY1ZDc4ZTUzYjFiZmI0YTYxNDY5OTAzZGQ2NDAzNWFjZmQzNGVkODZjYzc3NTc0NWE4NjI4N2Y3NWI0OTdiYzk4OGFjMzg0MDM5MWY5MGJjY2FmMjllNmU4NmEyMjJkMy8zODIzZWMwNmEyMDA4ZDZhODcyMTY3MzAwMzlmZTBlYw==",
    );

    expect(wallet.accounts.length).toBe(2);
    const [account0, account1] = wallet.accounts;

    expect(account0.name).toBe("Account 0");
    expect(account0.addr).toBe("zil1ntrynx04349sk6py7uyata03gka6qswg7um95y");
    expect(account1.name).toBe("Imported 0");
    expect(account1.addr).toBe("zil14at57zaj4pe3tuy734usy2xnlquapkd4d0ne43");

    expect(wallet.tokens.length).toBe(3);
    const zilToken = wallet.tokens.find((t: FToken) => t.symbol === "ZIL");
    const zlpToken = wallet.tokens.find((t: FToken) => t.symbol === "ZLP");
    const stZilToken = wallet.tokens.find((t: FToken) => t.symbol === "stZIL");

    expect(zilToken).toBeDefined();
    expect(zilToken?.rate).toBe(1);

    expect(zlpToken).toBeDefined();
    expect(zlpToken?.rate).toBe(2.7915277475);

    expect(stZilToken).toBeDefined();
    expect(stZilToken?.name).toBe("StZIL");
    expect(stZilToken?.addr).toBe("zil1umc54ly88xjw4599gtq860le0qvsuwuj72s246");
    expect(stZilToken?.rate).toBe(1.2063766095);

    const { settings } = wallet;
    expect(settings.cipherOrders).toEqual([CipherOrders.AESGCM256]);
    expect(settings.currencyConvert).toBe("btc");

    const { hashFnParams } = settings;
    expect(hashFnParams.hashType).toBe(HashTypes.Pbkdf2);
    expect(hashFnParams.hashSize).toBe(ShaAlgorithms.Sha512);
    expect(hashFnParams.iterations).toBe(442368);
    expect(hashFnParams.memory).toBe(1024);
    expect(hashFnParams.threads).toBe(1);

    const chain: ChainConfig = globalState.state.chains[0];
    const password = utf8ToUint8Array(PASSWORD);
    await wallet.unlock(password);
    const words = await wallet.revealMnemonic(password, chain);

    expect(words).toBe(WORDS);
  });
});
