import type { BackgroundState } from "background/storage";
import type { Wallet } from "background/storage/wallet";
import type { Account } from "background/storage/account";
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
      this.#sendError(msg.uuid, msg.domain, ConnectError.WalletNotFound, 4100);
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
          this.#handleChainId(msg, account);
          break;

        case 'eth_accounts':
          this.#handleAccounts(msg, wallet, account);
          break;

        case 'eth_requestAccounts':
          await this.#connectService.callConnect(msg, sendResponse);
          return;

        case 'wallet_requestPermissions':
          await this.#handleRequestPermissions(msg, sendResponse);
          return;

        case 'wallet_getPermissions':
          this.#handleGetPermissions(msg, account);
          break;

        default:
          this.#sendError(msg.uuid, msg.domain, ConnectError.UnsupportedMethod, 4200);
          sendResponse({ reject: ConnectError.UnsupportedMethod });
          return;
      }

      sendResponse({ resolve: true });
    } catch (err) {
      this.#sendError(msg.uuid, msg.domain, String(err), 4000);
      sendResponse({ reject: String(err) });
    }
  }

  #handleChainId(msg: ConnectParams<JsonRPCRequest>, account: Account) {
    const chain = this.#state.getChain(account.chainHash);
    const chainId = bigintToHex(BigInt(chain?.chainId ?? 0));
    
    this.#sendSuccess(msg.uuid, msg.domain, chainId);
  }

  #handleAccounts(msg: ConnectParams<JsonRPCRequest>, wallet: Wallet, account: Account) {
    const hash = hashXORHex(account.pubKey);
    const isConnected = this.#state.connections.isConnected(msg.domain, hash);

    if (isConnected) {
      const addresses = this.#getAddresses(wallet, account);
      this.#sendSuccess(msg.uuid, msg.domain, addresses);
    } else {
      this.#sendSuccess(msg.uuid, msg.domain, []);
    }
  }

  async #handleRequestPermissions(msg: ConnectParams<JsonRPCRequest>, sendResponse: StreamResponse) {
    const params = msg.payload?.params?.[0] as Record<string, unknown> | undefined;

    if (params?.eth_accounts) {
      await this.#connectService.callConnect(msg, sendResponse);
    } else {
      this.#sendError(msg.uuid, msg.domain, ConnectError.InvalidPermissionRequest, 4001);
      sendResponse({ reject: ConnectError.InvalidPermissionRequest });
    }
  }

  #handleGetPermissions(msg: ConnectParams<JsonRPCRequest>, account: Account) {
    const connection = this.#state.connections.find(msg.domain);

    if (!connection) {
      this.#sendSuccess(msg.uuid, msg.domain, []);
      return;
    }

    const address = account.slip44 === ZILLIQA 
      ? account.addr.split(":")[1]
      : account.addr;

    const permissions = [
      {
        invoker: msg.domain,
        parentCapability: 'eth_accounts',
        caveats: [
          {
            type: 'restrictReturnedAccounts',
            value: [address]
          }
        ]
      }
    ];

    this.#sendSuccess(msg.uuid, msg.domain, permissions);
  }

  #getAddresses(wallet: Wallet, selectedAccount: Account): string[] {
    return wallet.accounts
      .slice()
      .sort((a, _b) => a.addr === selectedAccount.addr ? -1 : 1)
      .map((a) => a.slip44 === ZILLIQA ? a.addr.split(":")[1] : a.addr);
  }

  #sendSuccess(uuid: string, domain: string, result: unknown): void {
    new TabsMessage({
      type: MTypePopup.EVM_RESPONSE,
      uuid,
      payload: {
        result,
      },
    }).send(domain);
  }

  #sendError(uuid: string, domain: string, message: string, code: number): void {
    new TabsMessage({
      type: MTypePopup.EVM_RESPONSE,
      uuid,
      payload: {
        error: {
          message,
          code,
          data: null,
        },
      },
    }).send(domain);
  }
}
