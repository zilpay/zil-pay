import { Wallet, WalletSettings, type BackgroundState } from "background/storage";
import type { StreamResponse } from "lib/streem";
import { utf8ToUint8Array } from "lib/utils/utf8";
import { hexToUint8Array, uint8ArrayToHex } from "lib/utils/hex";
import type { SetPasswordPayload, WalletFromPrivateKeyParams } from "types/wallet";
import { TypeOf } from "lib/types";
import { KeyPair } from "crypto/keypair";

export class WalletService {
  #state: BackgroundState;

  constructor(state: BackgroundState) {
    this.#state = state;
  }

  async addLedgerWallet() {}

  async getGlobalState(sendResponse: StreamResponse) {
    sendResponse({
      resolve: this.#state
    });
  }

  async walletFromPrivateKey(payload: WalletFromPrivateKeyParams, sendResponse: StreamResponse) {
    try {
      const chain = this.#state.getChain(payload.chainHash)!;
      const keyBytes = hexToUint8Array(payload.key);
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
      await this.#state.sync();

      sendResponse({
        resolve: true
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
}
