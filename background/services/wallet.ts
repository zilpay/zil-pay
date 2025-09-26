import { Account, ChainConfig, FToken, Wallet, WalletSettings, type BackgroundState, type IBackgroundState, type IChainConfigState } from "background/storage";
import type { StreamResponse } from "lib/streem";
import { utf8ToUint8Array } from "lib/utils/utf8";
import { hexToUint8Array, uint8ArrayToHex } from "lib/utils/hex";
import type { SetPasswordPayload, WalletFromBip39Params, WalletFromPrivateKeyParams } from "types/wallet";
import { TypeOf } from "lib/types";
import { KeyPair } from "crypto/keypair";
import { HistoricalTransaction } from "background/rpc/history_tx";
import { randomBytes } from "crypto/random";
import { Bip39 } from "crypto/bip39";
import { ConfirmState } from "background/storage/confirm";
import { Session } from "background/secure";

export class WalletService {
  #state: BackgroundState;

  constructor(state: BackgroundState) {
    this.#state = state;
  }

  async addLedgerWallet() {}

  async genBip39Words(count: number, wordList: string[], sendResponse: StreamResponse) {
    try {
      const entropyBits = (count * 11) - Math.floor(count / 3);
      const entropyBytes = entropyBits / 8;
      const entropy = randomBytes(entropyBytes);
      const mnemonic = await Bip39.entropyToMnemonic(entropy, wordList);

      sendResponse({
        resolve: mnemonic.phrase
      });
    } catch(err) {
      sendResponse({
        reject: String(err)
      });
    }
  }

    async validateBip39CheckSum(phrase: string, wordList: string[], sendResponse: StreamResponse) {
      try {
        const isValid = await Bip39.validateMnemonic(phrase, wordList);

        sendResponse({
          resolve: isValid
        });
      } catch (err) {
        sendResponse({
          resolve: false,
        });
      }
    }


  async genKeyPair(slip44: number, sendResponse: StreamResponse) {
    try {
      const keyPair = await KeyPair.generate( slip44);

      sendResponse({
        resolve: await keyPair.toJSON()
      });
    } catch(err) {
      sendResponse({
        reject: String(err)
      });
    }
  }

  async keyPairFromPrivateKey(slip44: number, key: string, sendResponse: StreamResponse) {
    try {
      const keyBuf = hexToUint8Array(key);
      const keyPair = await KeyPair.fromPrivateKey(keyBuf, slip44);

      sendResponse({
        resolve: await keyPair.toJSON()
      });
    } catch(err) {
      sendResponse({
        reject: String(err)
      });
    }
  }

  async getGlobalState(sendResponse: StreamResponse) {
    sendResponse({
      resolve: this.#state
    });
  }

  async setGlobalState(payload: IBackgroundState, sendResponse: StreamResponse) {
    this.#state.abbreviatedNumber = payload.abbreviatedNumber;
    this.#state.appearances = payload.appearances;
    this.#state.hideBalance = payload.hideBalance;
    this.#state.selectedWallet = payload.selectedWallet;
    this.#state.locale = payload.locale;
    this.#state.notificationsGlobalEnabled = payload.notificationsGlobalEnabled;

    payload.wallets.forEach((wallet, index) => {
      const currentWallet = this.#state.wallets[index];

      if (currentWallet) {
          currentWallet.accounts = wallet.accounts.map((a) => new Account(a));
          currentWallet.confirm = wallet.confirm.map((c) => new ConfirmState(c));
          currentWallet.history = wallet.history.map((h) =>  new HistoricalTransaction(h));
          currentWallet.selectedAccount = wallet.selectedAccount;
          currentWallet.settings = new WalletSettings(wallet.settings);
          currentWallet.tokens = wallet.tokens.map((t) => new FToken(t));
          currentWallet.walletName = wallet.walletName;
      }
    });

    await this.#state.sync();

    sendResponse({
      resolve: this.#state
    });
  }

  async walletFromPrivateKey(payload: WalletFromPrivateKeyParams, sendResponse: StreamResponse) {
    try {
      const chain = await this.addOrGetChain(payload.chain);
      const keyBytes = hexToUint8Array(payload.key.privateKey);
      const kyepair = await KeyPair.fromPrivateKey(keyBytes, chain.slip44);
      const settings = new WalletSettings(payload.settings);
      const wallet = await Wallet.fromPrivateKey(
        kyepair,
        payload.walletName,
        payload.accountName,
        settings,
        chain,
        payload.password,
      );

      this.#state.wallets.push(wallet);
      this.#state.selectedWallet = this.#state.wallets.length - 1;
      await this.#state.sync();

      sendResponse({
        resolve: this.#state
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async walletFromBip39(payload: WalletFromBip39Params, sendResponse: StreamResponse) {
    try {
      const chain = await this.addOrGetChain(payload.chain);
      const settings = new WalletSettings(payload.settings);
      const wallet = await Wallet.fromBip39(
        payload.mnemonic,
        payload.verifyCheckSum,
        payload.walletName,
        payload.accounts,
        settings,
        chain,
        payload.password,
        payload.bip39WordList,
        payload.passphrase, 
      );

      this.#state.wallets.push(wallet);
      this.#state.selectedWallet = this.#state.wallets.length - 1;
      await this.#state.sync();

      sendResponse({
        resolve: this.#state
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async exportbip39Words(password: string, walletIndex: number, sendResponse: StreamResponse) {
    try {
      const passwordBytes = utf8ToUint8Array(password);
      const wallet = this.#state.wallets[walletIndex];

      const chain = this.#state.getChain(wallet.defaultChainHash)!;
      const mnemonic = await wallet.revealMnemonic(passwordBytes, chain);

      sendResponse({
        resolve: mnemonic
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async exportKeyPair(password: string, walletIndex: number, accountIndex: number, sendResponse: StreamResponse) {
    try {
      const passwordBytes = utf8ToUint8Array(password);
      const wallet = this.#state.wallets[walletIndex];

      await wallet.unlock(passwordBytes);

      const chain = this.#state.getChain(wallet.defaultChainHash)!;
      const keyPair = await wallet.revealKeypair(accountIndex, chain);

      sendResponse({
        resolve: {
          privKey: uint8ArrayToHex(keyPair.privateKey),
          pubKey: uint8ArrayToHex(keyPair.pubKey),
        }
      });
    } catch (err) {
      sendResponse({
        reject: String(err)
      });
    }
  }

  async changePassword(payload: SetPasswordPayload, sendResponse: StreamResponse) {
     try {
      const passwordBytes = utf8ToUint8Array(payload.currentPassword);
      const wallet = this.#state.wallets[payload.walletIndex];

      await wallet.clearSession();

      const vault = await wallet.decrypt(passwordBytes);
      const newPasswordBytes = utf8ToUint8Array(payload.newPassword);

      wallet.settings.cipherOrders = payload.cipherOrders;
      wallet.settings.hashFnParams.memory = payload.hashSettings.memory;
      wallet.settings.hashFnParams.iterations = payload.hashSettings.iterations;
      wallet.settings.hashFnParams.threads = payload.hashSettings.threads;
      wallet.settings.hashFnParams.secret = payload.hashSettings.secret;
      wallet.settings.hashFnParams.hashType = payload.hashSettings.hashType;
      wallet.settings.hashFnParams.hashSize = payload.hashSettings.hashSize;

      if (TypeOf.isString(vault)) {
        await wallet.encrypt(newPasswordBytes, utf8ToUint8Array(vault as string));
      } else if (vault instanceof Uint8Array) {
        await wallet.encrypt(newPasswordBytes, vault);
      }

      await wallet.unlock(newPasswordBytes);
      await this.#state.sync();

      sendResponse({
        resolve: true,
      });
    } catch (err) {
      sendResponse({
        reject: String(err)
      });
    } 
  }

  async removeAccount(walletIndex: number, accountIndex: number, sendResponse: StreamResponse) {
    try {
      if (accountIndex == 0) {
        throw new Error(`invalid account index: ${accountIndex}`);
      }

      const wallet = this.#state.wallets[walletIndex];

      wallet.accounts.splice(accountIndex, 1);
      await this.#state.sync();

      sendResponse({
        resolve: true,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async removeWallet(walletIndex: number, password: string, sendResponse: StreamResponse) {
    try {
      const passwordBytes = utf8ToUint8Array(password);
      const wallet = this.#state.wallets[walletIndex];

      await wallet.unlock(passwordBytes);
      this.#state.wallets.splice(walletIndex);
      await this.#state.sync();

      sendResponse({
        resolve: true,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async unlockWallet(password: string, walletIndex: number, sendResponse: StreamResponse) {
    try {
      const passwordBytes = utf8ToUint8Array(password);
      const wallet = this.#state.wallets[walletIndex];

      await wallet.unlock(passwordBytes);
      this.#state.selectedWallet = walletIndex;
      await Session.setActiveWallet(walletIndex);

      sendResponse({
        resolve: this.#state
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async logoutWallet(walletIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];

      if (wallet) {
        await wallet.clearSession();
        this.#state.selectedWallet = -1;
        await this.#state.sync();
      }

      sendResponse({
        resolve: this.#state
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async setAccountName(walletIndex: number, accountIndex: number, name: string, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];
      const account = wallet.accounts[accountIndex];

      account.name = name;

      sendResponse({
        resolve: true,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async selectAccount(walletIndex: number, accountIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];

      if (accountIndex <= wallet.accounts.length - 1 && accountIndex >= 0) {
        wallet.selectedAccount = accountIndex;
      }

      sendResponse({
        resolve: true,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async addOrGetChain(chain: IChainConfigState) {
    const newChain = new ChainConfig(chain);

    const foundChain = this.#state.getChain(newChain.hash());

    if (foundChain) {
      return foundChain;
    }

    this.#state.chains.push(newChain);
    await this.#state.sync();
    
    return newChain;
  }
}
