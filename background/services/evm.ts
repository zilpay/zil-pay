import type { BackgroundState } from "background/storage";
import type { Wallet } from "background/storage/wallet";
import type { Account } from "background/storage/account";
import { ConnectError } from "config/errors";
import type { StreamResponse } from "lib/streem";
import type { ConnectService } from "./connect";
import type { ConnectParams } from "types/connect";
import { NetworkProvider, type JsonRPCRequest } from "background/rpc";
import { bigintToHex, uint8ArrayToHex } from "lib/utils/hex";
import { TabsMessage } from "lib/streem/tabs-message";
import { MTypePopup } from "config/stream";
import { hashXORHex } from "lib/utils/hashing";
import { ZILLIQA } from "config/slip44";
import { ConfirmState } from "background/storage/confirm";
import { PromptService } from "lib/popup/prompt";
import { AddressType } from "config/wallet";


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

        case 'personal_sign':
          await this.#handlePersonalSign(msg, wallet, sendResponse);
          return;

        case 'eth_signTypedData_v4':
          await this.#handleSignTypedDataV4(msg, wallet, sendResponse);
          return;

        default:
          await this.#proxyRequest(msg, account);
          break;
      }

      sendResponse({ resolve: true });
    } catch (err) {
      this.#sendError(msg.uuid, msg.domain, String(err), 4000);
      sendResponse({ reject: String(err) });
    }
  }

  async responseToSignPersonalMessageEVM(
    uuid: string,
    walletIndex: number,
    accountIndex: number,
    approve: boolean,
    sendResponse: StreamResponse
  ) {
    try {
      const wallet = this.#state.wallets[walletIndex];

      if (!wallet) {
        throw new Error(ConnectError.WalletNotFound);
      }

      await wallet.trhowSession();

      const account = wallet.accounts[accountIndex];
      const evmMessage = wallet.confirm.find((c) => c.uuid === uuid);

      if (!evmMessage || !evmMessage.signPersonalMessageEVM) {
        throw new Error(`${ConnectError.RequestNotFound}: ${uuid}`);
      }

      wallet.confirm = wallet.confirm.filter(c => c.uuid !== uuid);

      if (!approve) {
        this.#sendError(uuid, evmMessage.signPersonalMessageEVM.domain, ConnectError.UserRejected, 4001);
      } else {
        const chainConfig = this.#state.getChain(account.chainHash);
        
        if (!chainConfig) {
          throw new Error(ConnectError.ChainNotFound);
        }

        const keyPair = await wallet.revealKeypair(account.index, chainConfig);
        const messageBytes = new TextEncoder().encode(evmMessage.signPersonalMessageEVM.message);
        const signature = await keyPair.signMessage(messageBytes);
        const signatureHex = uint8ArrayToHex(signature, true);

        this.#sendSuccess(uuid, evmMessage.signPersonalMessageEVM.domain, signatureHex);
      }

      await this.#state.sync();
      sendResponse({ resolve: wallet.confirm });
    } catch (e) {
      sendResponse({ reject: String(e) });
    }
  }

  async responseToSignTypedDataEVM(
    uuid: string,
    walletIndex: number,
    accountIndex: number,
    approve: boolean,
    sendResponse: StreamResponse
  ) {
    try {
      const wallet = this.#state.wallets[walletIndex];

      if (!wallet) {
        throw new Error(ConnectError.WalletNotFound);
      }

      await wallet.trhowSession();

      const account = wallet.accounts[accountIndex];
      const evmTypedData = wallet.confirm.find((c) => c.uuid === uuid);

      if (!evmTypedData || !evmTypedData.signTypedDataJsonEVM) {
        throw new Error(`${ConnectError.RequestNotFound}: ${uuid}`);
      }

      wallet.confirm = wallet.confirm.filter(c => c.uuid !== uuid);

      if (!approve) {
        this.#sendError(uuid, evmTypedData.signTypedDataJsonEVM.domain, ConnectError.UserRejected, 4001);
      } else {
        const chainConfig = this.#state.getChain(account.chainHash);
        
        if (!chainConfig) {
          throw new Error(ConnectError.ChainNotFound);
        }

        const keyPair = await wallet.revealKeypair(account.index, chainConfig);
        const typedData = JSON.parse(evmTypedData.signTypedDataJsonEVM.typedData);
        const signature = keyPair.signDataEIP712(typedData);
        const signatureHex = uint8ArrayToHex(signature, true);

        this.#sendSuccess(uuid, evmTypedData.signTypedDataJsonEVM.domain, signatureHex);
      }

      await this.#state.sync();
      sendResponse({ resolve: wallet.confirm });
    } catch (e) {
      sendResponse({ reject: String(e) });
    }
  }

  async #handlePersonalSign(
    msg: ConnectParams<JsonRPCRequest>,
    wallet: Wallet,
    sendResponse: StreamResponse
  ) {
    try {
      const params = msg.payload?.params;

      if (!params || params.length < 2) {
        throw new Error('Invalid params for personal_sign');
      }

      const message = String(params[0]);
      const address = String(params[1]);

      const account = wallet.accounts[wallet.selectedAccount];
      const currentAddress = account.slip44 === ZILLIQA 
        ? account.addr.split(":")[1]
        : account.addr;

      if (currentAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Address mismatch');
      }

      wallet.confirm.push(new ConfirmState({
        uuid: msg.uuid,
        signPersonalMessageEVM: {
          message,
          address: currentAddress,
          domain: msg.domain,
          title: msg.title || msg.domain,
          icon: msg.icon || '',
        },
      }));

      await this.#state.sync();
      new PromptService().open("/sign-message");

      sendResponse({ resolve: true });
    } catch (error) {
      this.#sendError(msg.uuid, msg.domain, String(error), 4001);
      sendResponse({ reject: String(error) });
    }
  }

  async #handleSignTypedDataV4(
    msg: ConnectParams<JsonRPCRequest>,
    wallet: Wallet,
    sendResponse: StreamResponse
  ) {
    try {
      const params = msg.payload?.params;

      if (!params) {
        throw new Error(ConnectError.InvalidParams);
      }

      const address = String(params[0]);
      const typedDataJson = String(params[1]);
      const account = wallet.accounts[wallet.selectedAccount];

      if (!account.addr.toLowerCase().includes(address.toLowerCase())) {
        throw new Error(ConnectError.AddressMismatch);
      }

      wallet.confirm.push(new ConfirmState({
        uuid: msg.uuid,
        signTypedDataJsonEVM: {
          typedData: typedDataJson,
          address: account.addr,
          domain: msg.domain,
          title: msg.title || msg.domain,
          icon: msg.icon || '',
        },
      }));

      await this.#state.sync();
      new PromptService().open("/sign-message");

      sendResponse({ resolve: true });
    } catch (error) {
      this.#sendError(msg.uuid, msg.domain, String(error), 4001);
      sendResponse({ reject: String(error) });
    }
  }

  async #proxyRequest(msg: ConnectParams<JsonRPCRequest>, account: Account) {
    try {
      const chainConfig = this.#state.getChain(account.chainHash);

      if (!chainConfig) {
        this.#sendError(msg.uuid, msg.domain, ConnectError.ChainNotFound, 4100);
        return;
      }

      const provider = new NetworkProvider(chainConfig);
      let rpcPayload: JsonRPCRequest | JsonRPCRequest[];
    
      if (Array.isArray(msg.payload)) {
        rpcPayload = msg.payload.map((p, index) => ({
          jsonrpc: '2.0',
          id: index + 1,
          method: p.method,
          params: p.params || []
        }));
      } else {
        rpcPayload = {
          jsonrpc: '2.0',
          id: 1,
          method: msg.payload!.method,
          params: msg.payload!.params || []
        };
      }

      const response = await provider.proxyReq(rpcPayload);

      if (response.error) {
        this.#sendError(msg.uuid, msg.domain, response.error.message, response.error.code);
      } else {
        this.#sendSuccess(msg.uuid, msg.domain, response.result);
      }
    } catch (error) {
      this.#sendError(msg.uuid, msg.domain, String(error), 4000);
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

  #getAddresses(_wallet: Wallet, selectedAccount: Account): string[] {
    if (selectedAccount.addrType === AddressType.Bech32) {
      return [selectedAccount.addr.split(":")[1]];
    } else {
      return [selectedAccount.addr];
    }
    // return wallet.accounts
    //   .slice()
    //   .sort((a, _b) => a.addr === selectedAccount.addr ? -1 : 1)
    //   .map((a) => a.slip44 === ZILLIQA ? a.addr.split(":")[1] : a.addr);
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
