export class Account {
  addr: string;
  addrType: number;
  name: string;
  pubKey: string;
  chainHash: number;
  chainId: number;
  slip44: number;
  index: number;

  constructor(data: {
    addr: string;
    addrType: number;
    name: string;
    pubKey: string;
    chainHash: number;
    chainId: number;
    slip44: number;
    index: number;
  }) {
    this.addr = data.addr;
    this.addrType = data.addrType;
    this.name = data.name;
    this.pubKey = data.pubKey;
    this.chainHash = data.chainHash;
    this.chainId = data.chainId;
    this.slip44 = data.slip44;
    this.index = data.index;
  }
}
