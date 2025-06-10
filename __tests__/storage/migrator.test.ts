import { describe, it, expect } from 'vitest';
import { migrateToV4 } from '../../background/secure/migrator';
import { BackgroundState, AppearancesTheme } from '../../background/storage/background';
import { ChainConfig } from '../../background/storage/chain';
import { FToken } from '../../background/storage/ftoken';
import { AuthMethod, Wallet, WalletTypes } from '../../background/storage/wallet';
import { Account } from '../../background/storage/account';
import { AddressType } from '../../background/storage/address-type';
import { STORAGE_V2, STORAGE_V3 } from '../data';

// Helper function to create a minimal storage object for version 4
const createV4Storage = (): Record<string, unknown> => ({
  storageVersion: 4,
  wallets: [],
  notificationsGlobalEnabled: true,
  locale: 'auto',
  appearances: 'System',
  abbreviatedNumber: true,
  hideBalance: false,
  chains: [],
});

describe('migrateToV4', () => {
  // Test case 1: Storage already at version 4
  it('should return BackgroundState with unchanged storage if already version 4', () => {
    const storageV4 = createV4Storage();
    const result = migrateToV4(storageV4);

    expect(result).toBeInstanceOf(BackgroundState);
    expect(result.storageVersion).toBe(4);
    expect(result.wallets).toEqual([]);
    expect(result.notificationsGlobalEnabled).toBe(true);
    expect(result.locale).toBe('auto');
    expect(result.appearances).toBe('System');
    expect(result.abbreviatedNumber).toBe(true);
    expect(result.hideBalance).toBe(false);
    expect(result.chains).toEqual([]);
  });

  // Test case 2: Migration from version 2
  it('should correctly migrate from version 2', () => {
    const result = migrateToV4(STORAGE_V2);

    // Top-level BackgroundState properties
    expect(result).toBeInstanceOf(BackgroundState);
    expect(result.storageVersion).toBe(4);
    expect(result.wallets).toHaveLength(1);
    expect(result.notificationsGlobalEnabled).toBe(true);
    expect(result.locale).toBe('auto');
    expect(result.appearances).toBe(AppearancesTheme.System);
    expect(result.abbreviatedNumber).toBe(true);
    expect(result.hideBalance).toBe(false);
    expect(result.chains).toHaveLength(1);

    // Wallet properties
    const wallet = result.wallets[0];
    expect(wallet).toBeInstanceOf(Wallet);
    expect(wallet.walletType).toBe(WalletTypes.SecretPhrase);
    expect(wallet.walletName).toBe('Zilliqa Wallet');
    expect(wallet.authType).toBe(AuthMethod.None);
    expect(wallet.selectedAccount).toBe(1); // From STORAGE_V2.selectedAddress
    expect(wallet.walletAddress).toBe('zil1ntrynx04349sk6py7uyata03gka6qswg7um95y');
    expect(wallet.vault).toBe(STORAGE_V2.vault);
    expect(wallet.defaultChainHash).toBe(1);

    // Accounts
    expect(wallet.accounts).toHaveLength(2);
    const account0 = wallet.accounts[0];
    expect(account0).toBeInstanceOf(Account);
    expect(account0.name).toBe('Account 0');
    expect(account0.addr).toBe('zil1ntrynx04349sk6py7uyata03gka6qswg7um95y');
    expect(account0.addrType).toBe(AddressType.Bech32);
    expect(account0.pubKey).toBe('0316f2d913f13c6aa15ad5c80b58464d25b6363a1b9d997260e8061977a3f43e10');
    expect(account0.chainHash).toBe(1);
    expect(account0.chainId).toBe(1);
    expect(account0.slip44).toBe(313);
    expect(account0.index).toBe(0);

    const account1 = wallet.accounts[1];
    expect(account1.name).toBe('Imported 0');
    expect(account1.addr).toBe('zil14at57zaj4pe3tuy734usy2xnlquapkd4d0ne43');
    expect(account1.pubKey).toBe('0232970d0472220180c1779610f0ffae5a1ad79048b4f01f366c52d99317534024');
    expect(account1.index).toBe(0);

    // Tokens
    expect(wallet.tokens).toHaveLength(2);
    const zilToken = wallet.tokens.find(t => t.symbol === 'ZIL')!;
    expect(zilToken).toBeDefined();
    expect(zilToken).toBeInstanceOf(FToken);
    expect(zilToken.addr).toBe('zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz');
    expect(zilToken.name).toBe('Zilliqa');
    expect(zilToken.symbol).toBe('ZIL');
    expect(zilToken.decimals).toBe(12);
    expect(zilToken.addrType).toBe(AddressType.Bech32);
    expect(zilToken.balances[0]).toBe('0');
    expect(zilToken.balances[1]).toBe('0');
    expect(zilToken.rate).toBe(1);
    expect(zilToken.default_).toBe(true);
    expect(zilToken.native).toBe(true);
    expect(zilToken.chainHash).toBe(1);

    const zlpToken = wallet.tokens.find(t => t.symbol === 'ZLP')!;
    expect(zlpToken).toBeDefined();
    expect(zlpToken.addr).toBe('zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4');
    expect(zlpToken.name).toBe('ZilPay wallet');
    expect(zlpToken.symbol).toBe('ZLP');
    expect(zlpToken.decimals).toBe(18);
    expect(zlpToken.balances[0]).toBe('0');
    expect(zlpToken.balances[1]).toBe('0');
    expect(zlpToken.rate).toBe(2.7688998049);

    // Chain
    const chain = result.chains[0];
    expect(chain).toBeInstanceOf(ChainConfig);
    expect(chain.name).toBe('Zilliqa');
    expect(chain.chain).toBe('ZIL');
    expect(chain.chainId).toBe(1);
    expect(chain.chainHash).toBe(1);
    expect(chain.slip44).toBe(313);

    // Wallet settings
    expect(wallet.settings.currencyConvert).toBe('usd');
    expect(wallet.settings.cipherOrders).toEqual([]);
    expect(wallet.settings.argonParams.memory).toBe(1024);
    expect(wallet.settings.argonParams.iterations).toBe(3);
    expect(wallet.settings.argonParams.threads).toBe(1);
    expect(wallet.settings.argonParams.secret).toBe('');
  });

  // Test case 3: Migration from version 3
  it('should correctly migrate from version 3', () => {
    const result = migrateToV4(STORAGE_V3);

    // Top-level BackgroundState properties
    expect(result.storageVersion).toBe(4);
    expect(result.wallets).toHaveLength(1);
    expect(result.notificationsGlobalEnabled).toBe(true);
    expect(result.locale).toBe('auto');
    expect(result.appearances).toBe(AppearancesTheme.System);
    expect(result.abbreviatedNumber).toBe(true);
    expect(result.hideBalance).toBe(false);
    expect(result.chains).toHaveLength(1);

    // Wallet properties
    const wallet = result.wallets[0];
    expect(wallet.walletType).toBe(WalletTypes.SecretPhrase);
    expect(wallet.walletName).toBe('Zilliqa Wallet');
    expect(wallet.authType).toBe(AuthMethod.None);
    expect(wallet.selectedAccount).toBe(1); // From STORAGE_V3.selectedAddress
    expect(wallet.vault).toBe(STORAGE_V3.vault);
    expect(wallet.defaultChainHash).toBe(1);

    // Accounts
    expect(wallet.accounts).toHaveLength(2);
    const account0 = wallet.accounts[0];
    expect(account0.name).toBe('Account 0');
    expect(account0.addr).toBe('zil1ntrynx04349sk6py7uyata03gka6qswg7um95y');
    expect(account0.pubKey).toBe('0316f2d913f13c6aa15ad5c80b58464d25b6363a1b9d997260e8061977a3f43e10');
    expect(account0.index).toBe(0);

    const account1 = wallet.accounts[1];
    expect(account1.name).toBe('Imported 0');
    expect(account1.addr).toBe('zil14at57zaj4pe3tuy734usy2xnlquapkd4d0ne43');
    expect(account1.pubKey).toBe('0232970d0472220180c1779610f0ffae5a1ad79048b4f01f366c52d99317534024');
    expect(account1.index).toBe(0);

    // Tokens
    expect(wallet.tokens).toHaveLength(3);
    const zilToken = wallet.tokens.find(t => t.symbol === 'ZIL')!;
    expect(zilToken).toBeDefined();
    expect(zilToken.addr).toBe('zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz');
    expect(zilToken.balances[0]).toBe('0');
    expect(zilToken.balances[1]).toBe('0');
    expect(zilToken.rate).toBe(1);

    const zlpToken = wallet.tokens.find(t => t.symbol === 'ZLP')!;
    expect(zlpToken).toBeDefined();
    expect(zlpToken.addr).toBe('zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4');
    expect(zlpToken.balances[0]).toBe('0');
    expect(zlpToken.balances[1]).toBe('0');
    expect(zlpToken.rate).toBe(2.7915277475);

    const stZilToken = wallet.tokens.find(t => t.symbol === 'stZIL')!;
    expect(stZilToken).toBeDefined();
    expect(stZilToken.addr).toBe('zil1umc54ly88xjw4599gtq860le0qvsuwuj72s246');
    expect(stZilToken.name).toBe('StZIL');
    expect(stZilToken.symbol).toBe('stZIL');
    expect(stZilToken.decimals).toBe(12);
    expect(stZilToken.balances[0]).toBe('0');
    expect(stZilToken.balances[1]).toBe('0');
    expect(stZilToken.rate).toBe(1.2063766095);

    // Chain
    const chain = result.chains[0];
    expect(chain.name).toBe('Zilliqa');
    expect(chain.chainId).toBe(1);

    // Wallet settings
    expect(wallet.settings.currencyConvert).toBe('btc');
    expect(wallet.settings.cipherOrders).toEqual([]);
  });
});
