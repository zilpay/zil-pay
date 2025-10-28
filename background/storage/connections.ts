export interface IWeb3ConnectionPermissions {
  signTransactions: boolean;
  signMessages: boolean;
  readChainData: boolean;
}

export interface IWeb3ConnectionState {
  origin: string;
  domain: string;
  title: string;
  icon?: string;
  permissions: IWeb3ConnectionPermissions;
  connectedAccounts: number[];
  connectedChains: number[];
  connectedAt: number;
}

export interface IWeb3ConnectionsState {
  list: IWeb3ConnectionState[];
}

export class Web3Connections implements IWeb3ConnectionsState {
  list: IWeb3ConnectionState[];

  constructor(state: IWeb3ConnectionsState) {
    this.list = [];
    if (state && state.list) {
      this.list = state.list;
    }
  }

  find(domain: string): IWeb3ConnectionState | undefined {
    return this.list.find(c => c.domain === domain);
  }

  #findIndex(domain: string): number {
    return this.list.findIndex(c => c.domain === domain);
  }

  isConnected(origin: string, accountIndex?: number): boolean {
    const connection = this.find(origin);
    if (!connection) return false;
    if (accountIndex !== undefined) {
      return connection.connectedAccounts.includes(accountIndex);
    }
    return connection.connectedAccounts.length > 0;
  }

  getConnectedAccounts(origin: string): number[] {
    return this.find(origin)?.connectedAccounts || [];
  }

  getConnectedChains(origin: string): number[] {
    return this.find(origin)?.connectedChains || [];
  }

  getPermissions(origin: string): IWeb3ConnectionPermissions | null {
    return this.find(origin)?.permissions || null;
  }

  isAccountConnected(origin: string, accountIndex: number): boolean {
    return this.find(origin)?.connectedAccounts.includes(accountIndex) || false;
  }

  isChainConnected(origin: string, chainIndex: number): boolean {
    return this.find(origin)?.connectedChains.includes(chainIndex) || false;
  }

  add(payload: IWeb3ConnectionState): void {
    const idx = this.#findIndex(payload.origin);
    if (idx !== -1) {
      this.list[idx] = payload;
    } else {
      this.list.push(payload);
    }
  }

  remove(domain: string): void {
    const idx = this.#findIndex(domain);
    if (idx !== -1) {
      this.list.splice(idx, 1);
    }
  }

  addAccount(origin: string, accountIndex: number): void {
    const connection = this.find(origin);
    if (!connection) throw new Error(`Connection not found: ${origin}`);
    if (!connection.connectedAccounts.includes(accountIndex)) {
      connection.connectedAccounts.push(accountIndex);
    }
  }

  removeAccount(domain: string, accountHash: number): void {
    const connection = this.find(domain);
    if (!connection) return;
    
    connection.connectedAccounts = connection.connectedAccounts.filter(idx => idx !== accountHash);
    
    if (connection.connectedAccounts.length === 0) {
      this.remove(domain);
    }
  }

  addChain(origin: string, chainIndex: number): void {
    const connection = this.find(origin);
    if (!connection) throw new Error(`Connection not found: ${origin}`);
    if (!connection.connectedChains.includes(chainIndex)) {
      connection.connectedChains.push(chainIndex);
    }
  }

  removeChain(origin: string, chainIndex: number): void {
    const connection = this.find(origin);
    if (!connection) return;
    connection.connectedChains = connection.connectedChains.filter(idx => idx !== chainIndex);
  }

  updatePermissions(origin: string, permissions: Partial<IWeb3ConnectionPermissions>): void {
    const connection = this.find(origin);
    if (!connection) throw new Error(`Connection not found: ${origin}`);
    connection.permissions = { ...connection.permissions, ...permissions };
  }

  getAll(): IWeb3ConnectionState[] {
    return this.list;
  }

  removeByAccount(accountIndex: number): void {
    for (const connection of this.list) {
      this.removeAccount(connection.origin, accountIndex);
    }
  }

  removeByChain(chainIndex: number): void {
    for (const connection of this.list) {
      this.removeChain(connection.origin, chainIndex);
    }
  }

  getByAccount(accountIndex: number): IWeb3ConnectionState[] {
    return this.list.filter(c => c.connectedAccounts.includes(accountIndex));
  }

  getByChain(chainIndex: number): IWeb3ConnectionState[] {
    return this.list.filter(c => c.connectedChains.includes(chainIndex));
  }

  toJSON(): IWeb3ConnectionsState {
    return {
      list: this.list
    };
  }
}
