import { NetworkProvider } from "background/rpc";
import type { BackgroundState } from "background/storage";
import { Address } from "crypto/address";
import type { StreamResponse } from "lib/streem";
import { HEX_PREFIX, hexToUint8Array } from "lib/utils/hex";
import type { WorkerService } from "./worker";
import { TabsMessage } from "lib/streem/tabs-message";
import { MTypePopup } from "config/stream";

export class ProviderService {
  #state: BackgroundState;
  #worker: WorkerService;

  constructor(state: BackgroundState, worker: WorkerService) {
    this.#state = state;
    this.#worker = worker;
  }

  async swichNetwork(walletIndex: number, chainIndex: number, sendResponse: StreamResponse) {
    const chain = this.#state.chains[chainIndex];
    const wallet = this.#state.wallets[walletIndex];
    await wallet.trhowSession();

    try {
      wallet.tokens = wallet.tokens.filter((t) => !t.native); 
      wallet.tokens = [...chain.ftokens, ...wallet.tokens];
      wallet.accounts = await Promise.all(wallet.accounts.map(async (account) => {
        const pubKeyBytes = hexToUint8Array(account.pubKey);
        const addr = await Address.fromPubKey(pubKeyBytes, chain.slip44);
        account.chainHash = chain.hash();
        account.chainId = chain.chainId;
        account.addr = await addr.autoFormat();
        account.addrType = addr.type;
        return account;
      }));
      await this.#worker.stop();
      await this.#worker.start();
      await this.#state.sync();
      this.#notifyChainChanged(chain.chainId);

      sendResponse({
        resolve: this.#state,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async balanceUpdate(walletIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];
      await wallet.trhowSession();
      const account = wallet.accounts[wallet.selectedAccount];
      const tokens = wallet.tokens.filter((t) => t.chainHash === account.chainHash);
      const chainConfig = this.#state.getChain(account.chainHash)!;
      const provider = new NetworkProvider(chainConfig);
      const keys: Uint8Array[] = wallet.accounts.map((a) => hexToUint8Array(a.pubKey));

      await provider.updateBalances(tokens, keys);
      await this.#state.sync();

      sendResponse({
        resolve: tokens,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async getCurrentBlock(walletIndex: number, accountIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];
      const account = wallet.accounts[accountIndex];
      const chainConfig = this.#state.getChain(account.chainHash)!;
      const provider = new NetworkProvider(chainConfig);
      const blockNumber = await provider.getCurrentBlockNumber();

      sendResponse({
        resolve: blockNumber.toString(),
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async estimateBlockTime(walletIndex: number, accountIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];
      const account = wallet.accounts[accountIndex];
      const chainConfig = this.#state.getChain(account.chainHash)!;
      const provider = new NetworkProvider(chainConfig);
      const blockTime = await provider.estimateBlockTime();

      sendResponse({
        resolve: blockTime,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async fetchFtokenMeta(contract: string, walletIndex: number, sendResponse: StreamResponse) {
    try {
      const contractAddr = Address.fromStr(contract);
      const wallet = this.#state.wallets[walletIndex];
      const account = wallet.accounts[wallet.selectedAccount];
      const chainConfig = this.#state.getChain(account.chainHash)!;
      const provider = new NetworkProvider(chainConfig);
      const pubKeys = wallet.accounts.map((a) => hexToUint8Array(a.pubKey));
      const metadata = await provider.ftokenMeta(contractAddr, pubKeys);

      sendResponse({
        resolve: metadata,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  #notifyChainChanged(chainId: number) {
    const chainIdHex = HEX_PREFIX + chainId.toString(16);
    const connections = this.#state.connections.getAll();

    for (const connection of connections) {
      new TabsMessage({
        type: MTypePopup.EVM_EVENT,
        payload: {
          event: 'chainChanged',
          data: chainIdHex,
        },
      }).send(connection.domain);
    }
  }
}

