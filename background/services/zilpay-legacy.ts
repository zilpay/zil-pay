import { NetworkProvider, type JsonRPCRequest } from "background/rpc";
import type { BackgroundState } from "background/storage";
import { ConfirmState } from "background/storage/confirm";
import { Address } from "crypto/address";
import { sha256 } from "crypto/sha256";
import { PromptService } from "lib/popup/prompt";
import type { StreamResponse } from "lib/streem";
import { uint8ArrayToHex } from "lib/utils/hex";
import { utf8ToUint8Array } from "lib/utils/utf8";
import type { SignMesageReqScilla } from "types/tx";

export class ZilPayLegacyService {
  #state: BackgroundState;

  constructor(state: BackgroundState) {
    this.#state = state;
  }

  async jsonRPCProxy(domain: string, payload: JsonRPCRequest | JsonRPCRequest[], sendResponse: StreamResponse) {
    try {
      const isConnected = this.#state.connections.isConnected(domain);

      if (!isConnected) {
        throw new Error("wallet not connected");
      }

      const wallet = this.#state.wallets[this.#state.selectedWallet];
      const selectedAccount = wallet.accounts[wallet.selectedAccount];
      const chain = this.#state.getChain(selectedAccount.chainHash);
      const provider = new NetworkProvider(chain!);
      const res = await provider.proxyReq(payload);

      sendResponse({ resolve: res, });
    } catch (e) {
      sendResponse({ reject: String(e) });
    }
  }

  async signMessage(uuid: string, domain: string, content: string, title: string, icon: string, sendResponse: StreamResponse) {
    try {
      const isConnected = this.#state.connections.isConnected(domain);

      if (!isConnected) {
        throw new Error("wallet not connected");
      }

      const wallet = this.#state.wallets[this.#state.selectedWallet];
      const messageBytes = utf8ToUint8Array(content);
      const messageScilla: SignMesageReqScilla = {
        content,
        icon,
        domain,
        title,
        hash: uint8ArrayToHex(await sha256(messageBytes)),
      };

      wallet.confirm.push(new ConfirmState({
        uuid: uuid,
        signMessageScilla: messageScilla,
      }));
      await this.#state.sync();
      new PromptService().open("/sign-message");

      sendResponse({ resolve: true, });
    } catch (e) {
      sendResponse({ reject: String(e) });
    }
  }

  async getData(domain: string, sendResponse: StreamResponse) {
    try {
      const emptyResponse = {
        account: null,
        network: null,
        http: null,
        nativeHttp: null,
        isConnect: false,
        isEnable: false,
      };

      const wallet = this.#state.wallets[this.#state.selectedWallet];
      if (!wallet) {
        sendResponse({ resolve: emptyResponse });
        return;
      }

      const selectedAccount = wallet.accounts[wallet.selectedAccount];
      if (!selectedAccount) {
        sendResponse({ resolve: emptyResponse });
        return;
      }

      const chain = this.#state.getChain(selectedAccount.chainHash);
      if (!chain || !chain.rpc[0]) {
        sendResponse({ resolve: emptyResponse });
        return;
      }

      const isConnected = this.#state.connections.isConnected(domain);
      let account = null;

      if (isConnected) {
        const addr = Address.fromStr(selectedAccount.addr.split(":")[0]);
        account = {
          base16: await addr.toZilChecksum(),
          bech32: await addr.toZilBech32(),
        };
      }

      sendResponse({
        resolve: {
          account,
          network: chain.testnet ? "testnet" : "mainnet",
          http: chain.rpc[0],
          nativeHttp: chain.rpc[0],
          isConnect: isConnected,
          isEnable: isConnected,
        }
      });
    } catch (e) {
      sendResponse({ reject: String(e) });
    }
  }
}
