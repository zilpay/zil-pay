export interface TokenBalance {
  amount: string;
  lastUpdated: string;
}

export interface NftIdentifier {
  contractAddress: string;
  tokenId: string;
  name?: string;
  imageUrl?: string;
  collectionName?: string;
}

export enum WalletType {
  HD,
  PrivateKey,
  Ledger,
  ReadOnly,
}

export class Wallet {
  name: string;
  type: WalletType;
  address: string;
  publicKey: string;
  hdPath?: string;
  index?: number;
  encryptedPrivateKey?: string;
  balances: { [tokenIdentifier: string]: TokenBalance };
  nfts: NftIdentifier[];
  createdAt: string;

  constructor(data: Record<string, unknown>) {
    this.name = String(data.name);
    this.type = (data.type as WalletType);
    this.address = String(data.address);
    this.publicKey = String(data.publicKey as string);
    this.hdPath = data.hdPath as string | undefined;
    this.index = data.index as number | undefined;
    this.encryptedPrivateKey = data.encryptedPrivateKey as string | undefined;
    this.balances = (data.balances as { [tokenIdentifier: string]: TokenBalance }) ?? {};
    this.nfts = (data.nfts as NftIdentifier[]) ?? [];
    this.createdAt = (data.createdAt as string) ?? new Date().toISOString();
  }
}
