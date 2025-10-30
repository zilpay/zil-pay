import type { BackgroundState } from "background/storage";
import { ConnectError } from "config/errors";
import type { StreamResponse } from "lib/streem";
import type { ConnectService } from "./connect";
import type { ConnectParams } from "types/connect";
import type { JsonRPCRequest } from "background/rpc";
import { bigintToHex } from "lib/utils/hex";
import { TabsMessage } from "lib/streem/tabs-message";
import { MTypePopup } from "config/stream";
import { hashXORHex } from "lib/utils/hashing";
import { ZILLIQA } from "config/slip44";

export class EvmService {
  #state: BackgroundState;
  #connectService: ConnectService;

  constructor(state: BackgroundState, connectService: ConnectService) {
    this.#state = state;
    this.#connectService = connectService;
  }

  async handleRequest(msg: ConnectParams<JsonRPCRequest>, sendResponse: StreamResponse) {
    const wallet = this.#state.getCurrentWallet();

    if (!wallet) {
      sendResponse({ reject: ConnectError.WalletNotFound });
      return;
    }
    
    try {
      await wallet.trhowSession();
      const payload = msg.payload;

      if (!payload) {
        throw new Error(ConnectError.InvalidPayload);
      }

      const account = wallet.accounts[wallet.selectedAccount];

      switch (payload.method) {
        case 'eth_chainId':
          const chain = this.#state.getChain(account.chainHash);
          const chainId = bigintToHex(BigInt(chain?.chainId ?? 0));
          new TabsMessage({
            type: MTypePopup.EVM_RESPONSE,
            uuid: msg.uuid,
            payload: {
              result: chainId,
            },
          }).send(msg.domain);

          sendResponse({ resolve: chainId, });
          break;
        case 'eth_accounts':
          const hash = hashXORHex(account.pubKey);
          const isConnected = this.#state.connections.isConnected(msg.domain, hash);
          if (isConnected) {
              const addresses = wallet.accounts
                .slice()
                .sort((a, _b) => a.addr === account.addr ? -1 : 1)
                .map((a) => a.slip44 === ZILLIQA ? a.addr.split(":")[1] : a.addr);

              new TabsMessage({
                type: MTypePopup.EVM_RESPONSE,
                uuid: msg.uuid,
                payload: {
                  result: addresses,
                },
              }).send(msg.domain);
            } else {
              new TabsMessage({
                type: MTypePopup.EVM_RESPONSE,
                uuid: msg.uuid,
                payload: {
                  result: [],
                },
              }).send(msg.domain);
            }
          break;
        case "eth_requestAccounts":
          await this.#connectService.callConnect(msg, sendResponse);
          break;

        default:
          sendResponse({ reject: { message: `Unsupported method: ${payload.method}`, code: 4200 } });
      }
    } catch (err) {
      sendResponse({ reject: String(err) });
    }
  }
}
