import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { GlobalState } from "../../background/state";
import { startBackground } from "../../background/background";
import { BrowserStorage } from "../../lib/storage";
import {
  BASE_SETTINGS,
  CHAINS,
  PASSWORD,
  WORDS,
} from "../data";
import { WORD_LIST } from '../crypto/word_list';
import { WalletSettings } from "../../background/storage";
import '../setupTests';
import { messageManager } from "../setupTests";
import type { WalletFromBip39Params } from "../../types/wallet";
import { getGlobalState, walletFromBip39Mnemonic } from "../../popup/background/wallet";
import type { ConnectParams } from "../../types/connect";
import type { IWeb3ConnectionPermissions } from "../../background/storage";
import { responseToConnect, disconnectWallet } from '../../popup/background/connect';

describe("ConnectService", () => {
  let globalState: GlobalState;

  beforeEach(async () => {
    await BrowserStorage.clear();
    messageManager.onMessage.clearListeners();
    globalState = await GlobalState.fromStorage();
    startBackground(globalState);
  });

  it("should approve connection", async () => {
    const bip39Params: WalletFromBip39Params = {
      mnemonic: WORDS,
      bip39WordList: WORD_LIST,
      walletName: "Test Wallet",
      accounts: [
        { index: 0, name: "Account 1" },
        { index: 1, name: "Account 2" },
      ],
      verifyCheckSum: true,
      chain: CHAINS[0],
      password: PASSWORD,
      settings: new WalletSettings(BASE_SETTINGS),
    };

    await walletFromBip39Mnemonic(bip39Params);
    let state = await getGlobalState();

    const connectParams: ConnectParams = {
      colors: { primary: "#000000", background: "#ffffff", text: "#000000" },
      description: "Test DApp",
      domain: "test.example.com",
      icon: "https://test.example.com/icon.png",
      title: "Test DApp",
      type: "connect",
      uuid: "test-uuid",
    };

    await new Promise<void>((resolve) => {
      globalState.connect.callConnect(connectParams, () => resolve());
    });

    state = await getGlobalState();
    expect(state.wallets[0].confirm).toHaveLength(1);
    expect(state.wallets[0].confirm[0].connect).toBeDefined();
    expect(state.wallets[0].confirm[0].connect).toEqual(connectParams);
    expect(state.wallets[0].confirm[0].uuid).toBe(connectParams.uuid);
    expect(state.wallets[0].confirm[0].evm).toBeUndefined();
    expect(state.wallets[0].confirm[0].metadata).toBeUndefined();
    expect(state.wallets[0].confirm[0].scilla).toBeUndefined();
    expect(state.wallets[0].confirm[0].signMessageScilla).toBeUndefined();
    expect(state.wallets[0].confirm[0].signPersonalMessageEVM).toBeUndefined();
    expect(state.wallets[0].confirm[0].signTypedDataJsonEVM).toBeUndefined();

    const permissions: IWeb3ConnectionPermissions = {
      signTransactions: true,
      signMessages: true,
      readChainData: true,
    };

    await responseToConnect(connectParams.uuid, 0, true, permissions);

    state = await getGlobalState();
    expect(state.wallets[0].confirm).toHaveLength(0);
    expect(state.connections.list).toHaveLength(1);
    expect(state.connections.list[0].domain).toBe(connectParams.domain);
    expect(state.connections.list[0].origin).toBe(connectParams.domain);
    expect(state.connections.list[0].title).toBe(connectParams.title);
    expect(state.connections.list[0].icon).toBe(connectParams.icon);
    expect(state.connections.list[0].permissions).toEqual(permissions);
    expect(state.connections.list[0].connectedAccounts).toEqual([95, 21]);
    expect(state.connections.list[0].connectedChains).toEqual([0]);
    expect(state.connections.list[0].connectedAt).toBeDefined();
    expect(typeof state.connections.list[0].connectedAt).toBe('number');

    await disconnectWallet(connectParams.domain, 0);
    state = await getGlobalState();
    expect(state.connections.list).toHaveLength(0);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
