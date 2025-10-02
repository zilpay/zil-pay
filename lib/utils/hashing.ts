export function hashNumber(hash: number, value: number): number {
  hash = (hash << 5) - hash + value;
  return hash >>> 0; 
}

export function hashString(hash: number, str: string): number {
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash >>> 0; 
  }
  return hash;
}

export function hashChainConfig(chainIds: number[], slip44: number, chain: string): number {
  let hash = 0;
  const chainIdsSum = chainIds[0] + chainIds[1];
  hash = hashNumber(hash, chainIdsSum);
  hash = hashNumber(hash, slip44);
  hash = hashString(hash, chain);
  return hash >>> 0;
}

export function hashXOR(arr: Uint8Array): number {
  let h = 0;
  for (let i = 0; i < arr.length; i++) h ^= arr[i];
  return h % 0x100000;
}
