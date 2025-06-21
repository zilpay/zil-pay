import type { BackgroundState } from "background/storage";
import type { StreamResponse } from "lib/streem";
import { utf8ToUint8Array } from "lib/utils/utf8";
import { uint8ArrayToHex } from "lib/utils/hex";
import type { SetPasswordPayload } from "types/wallet";
import { TypeOf } from "lib/types";

export class WalletService {
  #state: BackgroundState;

  constructor(state: BackgroundState) {
    this.#state = state;
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

      await wallet.session.clearSession();

      const vault = await wallet.decrypt(passwordBytes);
      const newPasswordBytes = utf8ToUint8Array(payload.newPassword);

      wallet.settings.cipherOrders = payload.cipherOrders;
      wallet.settings.hashFnParams.memory = payload.memory;
      wallet.settings.hashFnParams.iterations = payload.iterations;
      wallet.settings.hashFnParams.threads = payload.threads;
      wallet.settings.hashFnParams.secret = payload.secret;
      wallet.settings.hashFnParams.hashType = payload.hashType;
      wallet.settings.hashFnParams.hashSize = payload.hashSize;

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
}
