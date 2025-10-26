import { describe, it, expect, beforeEach } from 'vitest';
import { 
  Web3Connections, 
  type IWeb3ConnectionsState, 
  type IWeb3ConnectionState,
} from '../../background/storage/connections';

describe('Web3Connections', () => {
  let connections: Web3Connections;
  
  const mockConnection: IWeb3ConnectionState = {
    origin: 'https://example.com',
    domain: 'example.com',
    title: 'Example Site',
    icon: 'https://example.com/icon.png',
    permissions: {
      accounts: true,
      signTransactions: true,
      signMessages: true,
      readChainData: true
    },
    connectedAccounts: [0, 1],
    connectedChains: [0],
    connectedAt: Date.now()
  };

  const mockConnection2: IWeb3ConnectionState = {
    origin: 'https://test.com',
    domain: 'test.com',
    title: 'Test Site',
    permissions: {
      accounts: true,
      signTransactions: false,
      signMessages: true,
      readChainData: true
    },
    connectedAccounts: [2],
    connectedChains: [1, 2],
    connectedAt: Date.now()
  };

  beforeEach(() => {
    connections = new Web3Connections({ list: [] });
  });

  describe('constructor', () => {
    it('should initialize with empty list', () => {
      expect(connections.list).toEqual([]);
    });

    it('should initialize with provided list', () => {
      const state: IWeb3ConnectionsState = {
        list: [mockConnection]
      };
      connections = new Web3Connections(state);
      expect(connections.list).toHaveLength(1);
      expect(connections.list[0]).toEqual(mockConnection);
    });

    it('should handle undefined list', () => {
      const state = { list: undefined } as any;
      connections = new Web3Connections(state);
      expect(connections.list).toEqual([]);
    });
  });

  describe('isConnected', () => {
    beforeEach(() => {
      connections.add(mockConnection);
    });

    it('should return true for connected origin', () => {
      expect(connections.isConnected('https://example.com')).toBe(true);
    });

    it('should return false for non-connected origin', () => {
      expect(connections.isConnected('https://unknown.com')).toBe(false);
    });

    it('should return true for connected origin with specific account', () => {
      expect(connections.isConnected('https://example.com', 0)).toBe(true);
      expect(connections.isConnected('https://example.com', 1)).toBe(true);
    });

    it('should return false for connected origin with non-connected account', () => {
      expect(connections.isConnected('https://example.com', 5)).toBe(false);
    });

    it('should return false if no accounts connected', () => {
      const emptyConnection = { ...mockConnection, connectedAccounts: [] };
      connections.add(emptyConnection);
      expect(connections.isConnected('https://example.com')).toBe(false);
    });
  });

  describe('getConnectedAccounts', () => {
    it('should return connected accounts for origin', () => {
      connections.add(mockConnection);
      expect(connections.getConnectedAccounts('https://example.com')).toEqual([0, 1]);
    });

    it('should return empty array for non-existing origin', () => {
      expect(connections.getConnectedAccounts('https://unknown.com')).toEqual([]);
    });

    it('should return empty array when no accounts connected', () => {
      const emptyConnection = { ...mockConnection, connectedAccounts: [] };
      connections.add(emptyConnection);
      expect(connections.getConnectedAccounts('https://example.com')).toEqual([]);
    });
  });

  describe('getConnectedChains', () => {
    it('should return connected chains for origin', () => {
      connections.add(mockConnection);
      expect(connections.getConnectedChains('https://example.com')).toEqual([0]);
    });

    it('should return empty array for non-existing origin', () => {
      expect(connections.getConnectedChains('https://unknown.com')).toEqual([]);
    });

    it('should return multiple chains', () => {
      connections.add(mockConnection2);
      expect(connections.getConnectedChains('https://test.com')).toEqual([1, 2]);
    });
  });

  describe('getPermissions', () => {
    it('should return permissions for existing connection', () => {
      connections.add(mockConnection);
      const permissions = connections.getPermissions('https://example.com');
      expect(permissions).toEqual(mockConnection.permissions);
    });

    it('should return null for non-existing origin', () => {
      expect(connections.getPermissions('https://unknown.com')).toBeNull();
    });
  });

  describe('isAccountConnected', () => {
    beforeEach(() => {
      connections.add(mockConnection);
    });

    it('should return true for connected account', () => {
      expect(connections.isAccountConnected('https://example.com', 0)).toBe(true);
      expect(connections.isAccountConnected('https://example.com', 1)).toBe(true);
    });

    it('should return false for non-connected account', () => {
      expect(connections.isAccountConnected('https://example.com', 5)).toBe(false);
    });

    it('should return false for non-existing origin', () => {
      expect(connections.isAccountConnected('https://unknown.com', 0)).toBe(false);
    });
  });

  describe('isChainConnected', () => {
    beforeEach(() => {
      connections.add(mockConnection);
    });

    it('should return true for connected chain', () => {
      expect(connections.isChainConnected('https://example.com', 0)).toBe(true);
    });

    it('should return false for non-connected chain', () => {
      expect(connections.isChainConnected('https://example.com', 1)).toBe(false);
    });

    it('should return false for non-existing origin', () => {
      expect(connections.isChainConnected('https://unknown.com', 0)).toBe(false);
    });
  });

  describe('add', () => {
    it('should add new connection', () => {
      connections.add(mockConnection);
      expect(connections.list).toHaveLength(1);
      expect(connections.list[0]).toEqual(mockConnection);
    });

    it('should update existing connection with same origin', () => {
      connections.add(mockConnection);
      const updated = { ...mockConnection, title: 'Updated Title' };
      connections.add(updated);
      
      expect(connections.list).toHaveLength(1);
      expect(connections.list[0].title).toBe('Updated Title');
    });

    it('should add multiple different connections', () => {
      connections.add(mockConnection);
      connections.add(mockConnection2);
      expect(connections.list).toHaveLength(2);
    });

    it('should preserve order when updating existing connection', () => {
      connections.add(mockConnection);
      connections.add(mockConnection2);
      
      const updated = { ...mockConnection, title: 'Updated' };
      connections.add(updated);
      
      expect(connections.list[0].origin).toBe('https://example.com');
      expect(connections.list[0].title).toBe('Updated');
      expect(connections.list[1].origin).toBe('https://test.com');
    });
  });

  describe('remove', () => {
    it('should remove existing connection', () => {
      connections.add(mockConnection);
      connections.remove('https://example.com');
      expect(connections.list).toHaveLength(0);
    });

    it('should do nothing for non-existing origin', () => {
      connections.add(mockConnection);
      connections.remove('https://unknown.com');
      expect(connections.list).toHaveLength(1);
    });

    it('should only remove specified connection', () => {
      connections.add(mockConnection);
      connections.add(mockConnection2);
      connections.remove('https://example.com');
      
      expect(connections.list).toHaveLength(1);
      expect(connections.list[0].origin).toBe('https://test.com');
    });
  });

  describe('addAccount', () => {
    beforeEach(() => {
      connections.add({
        ...mockConnection,
        connectedAccounts: [...mockConnection.connectedAccounts]
      });
    });

    it('should add new account to connection', () => {
      connections.addAccount('https://example.com', 5);
      const accounts = connections.getConnectedAccounts('https://example.com');
      expect(accounts).toContain(5);
    });

    it('should not duplicate existing account', () => {
      connections.addAccount('https://example.com', 0);
      const accounts = connections.getConnectedAccounts('https://example.com');
      expect(accounts.filter(a => a === 0)).toHaveLength(1);
    });

    it('should throw error for non-existing connection', () => {
      expect(() => {
        connections.addAccount('https://unknown.com', 0);
      }).toThrow('Connection not found: https://unknown.com');
    });
  });

  describe('removeAccount', () => {
    beforeEach(() => {
      connections.add({
        ...mockConnection,
        connectedAccounts: [...mockConnection.connectedAccounts]
      });
    });

    it('should remove account from connection', () => {
      connections.removeAccount('https://example.com', 0);
      const accounts = connections.getConnectedAccounts('https://example.com');
      expect(accounts).not.toContain(0);
      expect(accounts).toContain(1);
    });

    it('should remove connection if no accounts left', () => {
      connections.removeAccount('https://example.com', 0);
      expect(connections.getConnectedAccounts('https://example.com')).toEqual([1]);
      
      connections.removeAccount('https://example.com', 1);
      expect(connections.list.length).toBe(0);
    });

    it('should do nothing for non-existing connection', () => {
      connections.removeAccount('https://unknown.com', 0);
      expect(connections.list).toHaveLength(1);
    });

    it('should do nothing when removing non-existing account', () => {
      const accountsBefore = [...connections.getConnectedAccounts('https://example.com')];
      connections.removeAccount('https://example.com', 99);
      const accountsAfter = connections.getConnectedAccounts('https://example.com');
      expect(accountsAfter).toEqual(accountsBefore);
    });
  });

  describe('addChain', () => {
    beforeEach(() => {
      connections.add({
        ...mockConnection,
        connectedChains: [...mockConnection.connectedChains]
      });
    });

    it('should add new chain to connection', () => {
      connections.addChain('https://example.com', 5);
      const chains = connections.getConnectedChains('https://example.com');
      expect(chains).toContain(5);
    });

    it('should not duplicate existing chain', () => {
      connections.addChain('https://example.com', 0);
      const chains = connections.getConnectedChains('https://example.com');
      expect(chains.filter(c => c === 0)).toHaveLength(1);
    });

    it('should throw error for non-existing connection', () => {
      expect(() => {
        connections.addChain('https://unknown.com', 0);
      }).toThrow('Connection not found: https://unknown.com');
    });
  });

  describe('removeChain', () => {
    beforeEach(() => {
      connections.add(mockConnection2);
    });

    it('should remove chain from connection', () => {
      connections.removeChain('https://test.com', 1);
      const chains = connections.getConnectedChains('https://test.com');
      expect(chains).not.toContain(1);
      expect(chains).toContain(2);
    });

    it('should not remove connection when chains remain', () => {
      connections.removeChain('https://test.com', 1);
      expect(connections.isConnected('https://test.com')).toBe(true);
    });

    it('should do nothing for non-existing connection', () => {
      connections.removeChain('https://unknown.com', 0);
      expect(connections.list).toHaveLength(1);
    });

    it('should do nothing when removing non-existing chain', () => {
      const chainsBefore = [...connections.getConnectedChains('https://test.com')];
      connections.removeChain('https://test.com', 99);
      const chainsAfter = connections.getConnectedChains('https://test.com');
      expect(chainsAfter).toEqual(chainsBefore);
    });
  });

  describe('updatePermissions', () => {
    beforeEach(() => {
      connections.add(mockConnection);
    });

    it('should update single permission', () => {
      connections.updatePermissions('https://example.com', { accounts: false });
      const permissions = connections.getPermissions('https://example.com');
      expect(permissions?.accounts).toBe(false);
      expect(permissions?.signTransactions).toBe(true);
    });

    it('should update multiple permissions', () => {
      connections.updatePermissions('https://example.com', {
        accounts: false,
        signMessages: false
      });
      const permissions = connections.getPermissions('https://example.com');
      expect(permissions?.accounts).toBe(false);
      expect(permissions?.signMessages).toBe(false);
      expect(permissions?.signTransactions).toBe(true);
    });

    it('should throw error for non-existing connection', () => {
      expect(() => {
        connections.updatePermissions('https://unknown.com', { accounts: false });
      }).toThrow('Connection not found: https://unknown.com');
    });

    it('should preserve unchanged permissions', () => {
      const originalPermissions = { ...mockConnection.permissions };
      connections.updatePermissions('https://example.com', { accounts: false });
      const permissions = connections.getPermissions('https://example.com');
      
      expect(permissions?.signTransactions).toBe(originalPermissions.signTransactions);
      expect(permissions?.signMessages).toBe(originalPermissions.signMessages);
      expect(permissions?.readChainData).toBe(originalPermissions.readChainData);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no connections', () => {
      expect(connections.getAll()).toEqual([]);
    });

    it('should return all connections', () => {
      connections.add(mockConnection);
      connections.add(mockConnection2);
      
      const all = connections.getAll();
      expect(all).toHaveLength(2);
      expect(all).toContainEqual(mockConnection);
      expect(all).toContainEqual(mockConnection2);
    });

    it('should return actual list reference', () => {
      connections.add(mockConnection);
      const all = connections.getAll();
      expect(all).toBe(connections.list);
    });
  });

  describe('removeByAccount', () => {
    it('should remove account from all connections', () => {
      connections.add({
        ...mockConnection,
        connectedAccounts: [...mockConnection.connectedAccounts]
      });
      connections.add({
        ...mockConnection2,
        connectedAccounts: [...mockConnection2.connectedAccounts]
      });
      
      connections.removeByAccount(0);
      
      expect(connections.getConnectedAccounts('https://example.com')).not.toContain(0);
      expect(connections.getConnectedAccounts('https://example.com')).toEqual([1]);
    });

    it('should remove connections with only that account', () => {
      connections.add({
        ...mockConnection,
        connectedAccounts: [...mockConnection.connectedAccounts]
      });
      connections.add({
        ...mockConnection2,
        connectedAccounts: [...mockConnection2.connectedAccounts]
      });
      
      connections.removeByAccount(2);
      expect(connections.list.some(c => c.origin === 'https://test.com')).toBe(false);
    });

    it('should not affect connections without the account', () => {
      connections.add({
        ...mockConnection,
        connectedAccounts: [...mockConnection.connectedAccounts]
      });
      connections.add({
        ...mockConnection2,
        connectedAccounts: [...mockConnection2.connectedAccounts]
      });
      
      const accountsBefore = [...connections.getConnectedAccounts('https://example.com')];
      connections.removeByAccount(99);
      const accountsAfter = connections.getConnectedAccounts('https://example.com');
      expect(accountsAfter).toEqual(accountsBefore);
    });

    it('should handle removing from multiple connections', () => {
      connections.add({
        ...mockConnection,
        connectedAccounts: [...mockConnection.connectedAccounts]
      });
      
      const multiConnection = {
        ...mockConnection2,
        origin: 'https://multi.com',
        domain: 'multi.com',
        connectedAccounts: [0, 2, 3]
      };
      connections.add(multiConnection);
      
      const testConnection = {
        ...mockConnection2,
        origin: 'https://test.com',
        domain: 'test.com', 
        connectedAccounts: [2]
      };
      connections.add(testConnection);
      
      connections.removeByAccount(2);
      
      // test.com should be removed (only had account 2)
      expect(connections.list.some(c => c.origin === 'https://test.com')).toBe(false);
      
      // multi.com might or might not have removed 2, depending on iteration order
      // This tests the actual behavior - removeByAccount iterates over a mutating list
      const multiAccounts = connections.getConnectedAccounts('https://multi.com');
      expect(multiAccounts).not.toContain(2);
    });
  });

  describe('removeByChain', () => {
    beforeEach(() => {
      connections.add(mockConnection);
      connections.add(mockConnection2);
    });

    it('should remove chain from all connections', () => {
      connections.removeByChain(1);
      expect(connections.getConnectedChains('https://test.com')).not.toContain(1);
      expect(connections.getConnectedChains('https://test.com')).toContain(2);
    });

    it('should not remove connections when chains remain', () => {
      connections.removeByChain(1);
      const chains = connections.getConnectedChains('https://test.com');
      expect(chains).toEqual([2]);
      expect(connections.list.some(c => c.origin === 'https://test.com')).toBe(true);
    });

    it('should not affect connections without the chain', () => {
      const chainsBefore = [...connections.getConnectedChains('https://example.com')];
      connections.removeByChain(99);
      const chainsAfter = connections.getConnectedChains('https://example.com');
      expect(chainsAfter).toEqual(chainsBefore);
    });
  });

  describe('getByAccount', () => {
    it('should return connections with specific account', () => {
      connections.add({
        ...mockConnection,
        connectedAccounts: [...mockConnection.connectedAccounts]
      });
      connections.add({
        ...mockConnection2,
        connectedAccounts: [...mockConnection2.connectedAccounts]
      });
      
      const result = connections.getByAccount(0);
      expect(result).toHaveLength(1);
      expect(result[0].origin).toBe('https://example.com');
    });

    it('should return empty array for non-connected account', () => {
      connections.add({
        ...mockConnection,
        connectedAccounts: [...mockConnection.connectedAccounts]
      });
      connections.add({
        ...mockConnection2,
        connectedAccounts: [...mockConnection2.connectedAccounts]
      });
      
      const result = connections.getByAccount(99);
      expect(result).toEqual([]);
    });

    it('should return multiple connections if account is shared', () => {
      connections.add({
        ...mockConnection,
        connectedAccounts: [...mockConnection.connectedAccounts]
      });
      connections.add({
        ...mockConnection2,
        connectedAccounts: [...mockConnection2.connectedAccounts]
      });
      
      const multiConnection = {
        ...mockConnection2,
        origin: 'https://multi.com',
        domain: 'multi.com',
        connectedAccounts: [0, 2]
      };
      connections.add(multiConnection);
      
      const result = connections.getByAccount(0);
      expect(result).toHaveLength(2);
    });
  });

  describe('getByChain', () => {
    beforeEach(() => {
      connections.add(mockConnection);
      connections.add(mockConnection2);
    });

    it('should return connections with specific chain', () => {
      const result = connections.getByChain(0);
      expect(result).toHaveLength(1);
      expect(result[0].origin).toBe('https://example.com');
    });

    it('should return empty array for non-connected chain', () => {
      const result = connections.getByChain(99);
      expect(result).toEqual([]);
    });

    it('should return multiple connections if chain is shared', () => {
      const multiConnection = {
        ...mockConnection,
        origin: 'https://multi.com',
        connectedChains: [0, 1]
      };
      connections.add(multiConnection);
      
      const result = connections.getByChain(0);
      expect(result).toHaveLength(2);
    });
  });

  describe('toJSON', () => {
    it('should serialize to IWeb3ConnectionsState', () => {
      connections.add(mockConnection);
      connections.add(mockConnection2);
      
      const json = connections.toJSON();
      expect(json).toHaveProperty('list');
      expect(json.list).toHaveLength(2);
      expect(json.list).toEqual(connections.list);
    });

    it('should return empty list when no connections', () => {
      const json = connections.toJSON();
      expect(json).toEqual({ list: [] });
    });

    it('should create serializable object', () => {
      connections.add(mockConnection);
      const json = connections.toJSON();
      
      expect(() => JSON.stringify(json)).not.toThrow();
      const parsed = JSON.parse(JSON.stringify(json));
      expect(parsed.list).toEqual(json.list);
    });
  });

  describe('edge cases and integration', () => {
    it('should handle rapid add/remove operations', () => {
      connections.add(mockConnection);
      connections.remove('https://example.com');
      connections.add(mockConnection);
      
      expect(connections.isConnected('https://example.com')).toBe(true);
    });

    it('should handle account operations on connection with no accounts', () => {
      const emptyConnection = { ...mockConnection, connectedAccounts: [] };
      connections.add(emptyConnection);
      
      connections.addAccount('https://example.com', 0);
      expect(connections.getConnectedAccounts('https://example.com')).toContain(0);
    });

    it('should handle chain operations on connection with no chains', () => {
      const emptyConnection = { ...mockConnection, connectedChains: [] };
      connections.add(emptyConnection);
      
      connections.addChain('https://example.com', 0);
      expect(connections.getConnectedChains('https://example.com')).toContain(0);
    });

    it('should maintain data integrity after multiple operations', () => {
      connections.add(mockConnection);
      connections.addAccount('https://example.com', 5);
      connections.addChain('https://example.com', 1);
      connections.updatePermissions('https://example.com', { accounts: false });
      
      const connection = connections.list[0];
      expect(connection.connectedAccounts).toContain(5);
      expect(connection.connectedChains).toContain(1);
      expect(connection.permissions.accounts).toBe(false);
    });

    it('should handle connection without optional icon', () => {
      const noIconConnection = { ...mockConnection };
      delete noIconConnection.icon;
      
      connections.add(noIconConnection);
      expect(connections.list[0].icon).toBeUndefined();
    });

    it('should properly filter in getByAccount with overlapping accounts', () => {
      const conn1 = { ...mockConnection, connectedAccounts: [0, 1, 2] };
      const conn2 = { ...mockConnection2, connectedAccounts: [1, 3] };
      
      connections.add(conn1);
      connections.add(conn2);
      
      const result = connections.getByAccount(1);
      expect(result).toHaveLength(2);
    });
  });
});
