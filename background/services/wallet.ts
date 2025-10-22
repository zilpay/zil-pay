import { Account, ChainConfig, FToken, Wallet, WalletSettings, type BackgroundState, type IBackgroundState, type IChainConfigState } from "background/storage";
import type { StreamResponse } from "lib/streem";
import { utf8ToUint8Array } from "lib/utils/utf8";
import { hexToUint8Array } from "lib/utils/hex";
import type { AccountFromBip39Params, SetPasswordPayload, WalletAddressInfo, WalletFromBip39Params, WalletFromPrivateKeyParams } from "types/wallet";
import { TypeOf } from "lib/types";
import { KeyPair } from "crypto/keypair";
import { HistoricalTransaction } from "background/rpc/history_tx";
import { randomBytes } from "crypto/random";
import { Bip39 } from "crypto/bip39";
import { ConfirmState } from "background/storage/confirm";
import { Session } from "background/secure";
import { WorkerService } from "./worker";
import { AddressCategory } from "config/common";
import { AddressType } from "config/wallet";
import { Address } from "crypto/address";

export class WalletService {
  #state: BackgroundState;
  #worker: WorkerService;

  constructor(state: BackgroundState, worker: WorkerService) {
    this.#state = state;
    this.#worker = worker;
  }

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
    let payload = this.#state;

    sendResponse({
      resolve: payload,
    });
  }

  async setGlobalState(payload: IBackgroundState, sendResponse: StreamResponse) {
    this.#state.abbreviatedNumber = payload.abbreviatedNumber;
    this.#state.appearances = payload.appearances;
    this.#state.hideBalance = payload.hideBalance;
    this.#state.tokensRow = payload.tokensRow;
    this.#state.selectedWallet = payload.selectedWallet;
    this.#state.locale = payload.locale;
    this.#state.book = payload.book;
    this.#state.chains = payload.chains.map((c) => new ChainConfig(c));
    this.#state.notificationsGlobalEnabled = payload.notificationsGlobalEnabled;

    payload.wallets.forEach((wallet, index) => {
      const currentWallet = this.#state.wallets[index];

      if (currentWallet) {
          currentWallet.accounts = wallet.accounts.map((a) => new Account(a));
          currentWallet.confirm = wallet.confirm.map((c) => new ConfirmState(c));
          currentWallet.history = wallet.history.map((h) =>  new HistoricalTransaction(h));
          currentWallet.nft = wallet.nft;
          currentWallet.selectedAccount = wallet.selectedAccount;
          currentWallet.settings = new WalletSettings(wallet.settings);
          currentWallet.tokens = wallet.tokens.map((t) => new FToken(t));
          currentWallet.walletName = wallet.walletName;
      }
    });


    await this.#state.sync();

    sendResponse({
      resolve: true,
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
      await this.#worker.start();

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
      await this.#worker.start();

      sendResponse({
        resolve: this.#state
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async addAccountFromBip39(payload: AccountFromBip39Params, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[payload.walletIndex];
      const chain = this.#state.getChain(wallet.defaultChainHash)!;

      await wallet.addAccountBip39(payload.account, chain);
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
        resolve: await keyPair.toJSON(),
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

  async removeWallet(walletIndex: number, password: string, sendResponse: StreamResponse) {
    try {
      const passwordBytes = utf8ToUint8Array(password);
      const wallet = this.#state.wallets[walletIndex];

      await wallet.unlock(passwordBytes);
      this.#state.wallets.splice(walletIndex, 1);
      await this.#worker.stop();
      await this.#state.sync();

      sendResponse({
        resolve: this.#state,
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
      await this.#worker.start();

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
        await this.#worker.stop();
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

  async getAllAddressesByChain(walletIndex: number, accountIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];
      const account = wallet.accounts[accountIndex];
      const chainHash = account.chainHash;
      const addresses: WalletAddressInfo[] = [];

      this.#state.book.forEach((bookEntry) => {
        if ((bookEntry.addrType !== account.addrType) || account.addr.includes(bookEntry.address)) {
          return;
        }

        addresses.push({
          addr: bookEntry.address,
          accountName: bookEntry.name,
          walletIndex: -1,
          walletName: '',
          addrType: bookEntry.addrType,
          category: AddressCategory.AddressBook
        });
      });

      for (let walletIndex = 0; walletIndex < this.#state.wallets.length; walletIndex++) {
        const w = this.#state.wallets[walletIndex];
  
        for (const a of w.accounts) {
          if (a.chainHash !== chainHash || a.addrType !== account.addrType) {
            continue;
          }

          if (a.addrType === AddressType.Bech32 && a.addr === account.addr) {
            const pubKey = hexToUint8Array(a.pubKey);
            const addrEVM = await Address.fromPubKeyType(pubKey, AddressType.EthCheckSum);

            addresses.push({
              addr: await addrEVM.toEthChecksum(),
              accountName: a.name,
              walletIndex,
              walletName: w.walletName,
              addrType: AddressType.EthCheckSum,
              category: AddressCategory.ZILExchangeLegacy,
            });
          } else if (a.addr !== account.addr) {
            addresses.push({
              addr: a.addr,
              accountName: a.name,
              walletIndex,
              walletName: w.walletName,
              addrType: a.addrType,
              category: AddressCategory.Wallet
            });
          }
        }
      }

      sendResponse({
        resolve: addresses,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }
}
