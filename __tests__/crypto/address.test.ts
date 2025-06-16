import { describe, it, expect } from 'vitest';
import { Address, AddressType } from '../../crypto/address';
import { KeyPair } from '../../crypto/keypair';
import { ZILLIQA, ETHEREUM } from '../../config/slip44';
import { toBech32Address } from '../../lib/zilliqa';
import { hexToUint8Array, uint8ArrayToHex } from '../../lib/utils/hex';

describe('Address', () => {
    const zilData = new Uint8Array(20).fill(1);
    const ethData = new Uint8Array(20).fill(2);

    const zilAddr = new Address(zilData, AddressType.Bech32);
    const ethAddr = new Address(ethData, AddressType.EthCheckSum);

    const knownPrivateKeyHex = 'e93c035175b08613c4b0251ca92cd007026ca032ba53bafa3c839838f8b52d04';
    const privateKeyBytes = hexToUint8Array(knownPrivateKeyHex);

    it('should create addresses and hold correct bytes', () => {
        expect(zilAddr.bytes).toEqual(zilData);
        expect(ethAddr.bytes).toEqual(ethData);
    });

    it('should format ZIL address to bech32 string correctly', async () => {
        const expected = await toBech32Address(uint8ArrayToHex(zilData));
        expect(await zilAddr.toZilBech32()).toBe(expected);
    });

    it('should format ETH address to checksummed string correctly', async () => {
        const anotherValidAddress = '0x7793A8E8c09d189d4D421Ce5bC5B3674656c5Ac1';
        const ethAddrFromHex = await Address.fromStr(anotherValidAddress);
        expect(await ethAddrFromHex.toEthChecksum()).toBe(anotherValidAddress);
    });

    it('should derive a ZIL address from a public key', async () => {
        const keyPair = await KeyPair.fromPrivateKey(privateKeyBytes, ZILLIQA);
        const derivedAddr = await Address.fromPubKey(keyPair.pubKey, ZILLIQA);
        const expectedAddr = 'zil1a0vtxuxamd3kltmyzpqdyxqu25vsss8mp58jtu';

        expect(await derivedAddr.toZilBech32()).toBe(expectedAddr);
        expect(derivedAddr.type).toBe(AddressType.Bech32);
    });

    it('should derive an ETH address from a public key', async () => {
        const keyPair = await KeyPair.fromPrivateKey(privateKeyBytes, ETHEREUM);
        const derivedAddr = await Address.fromPubKey(keyPair.pubKey, ETHEREUM);
        const expectedAddr = '0xC315295101461753b838E0BE8688E744cf52Dd6b';

        expect(await derivedAddr.toEthChecksum()).toBe(expectedAddr);
        expect(derivedAddr.type).toBe(AddressType.EthCheckSum);
    });

    it('should create an ETH address from a valid hex string', async () => {
        const hexEthAddr = '0xf06686B5Eb5cAe38c09f12412B729045647E74e3';
        const addr = await Address.fromStr(hexEthAddr);
        expect(addr.type).toBe(AddressType.EthCheckSum);
        expect(await addr.toEthChecksum()).toBe(hexEthAddr);
    });

    it('should create a ZIL address from a valid bech32 string', async () => {
        const bech32Addr = 'zil1a0vtxuxamd3kltmyzpqdyxqu25vsss8mp58jtu';
        const addr = await Address.fromStr(bech32Addr);
        expect(addr.type).toBe(AddressType.Bech32);
        expect(await addr.toZilBech32()).toBe(bech32Addr);
    });

    it('should throw an error for invalid address string formats', async () => {
        await expect(Address.fromStr('invalid-address-string')).rejects.toThrow('Unsupported address format');
        await expect(Address.fromStr('0x12345')).rejects.toThrow('address must be 40-char hex, got 7-char 0x12345');
    });

    it('should perform a roundtrip for ZIL address', async () => {
        const originalAddr = 'zil1a0vtxuxamd3kltmyzpqdyxqu25vsss8mp58jtu';
        const addrObject = await Address.fromStr(originalAddr);
        const finalAddr = await addrObject.toZilBech32();
        expect(finalAddr).toBe(originalAddr);
    });

    it('should perform a roundtrip for ETH address', async () => {
        const originalAddr = '0xf06686b5eb5cae38c09f12412b729045647e74e3';
        const expectedChecksumAddr = '0xf06686B5Eb5cAe38c09f12412B729045647E74e3';
        const addrObject = await Address.fromStr(originalAddr);
        const finalAddr = await addrObject.toEthChecksum();
        expect(finalAddr).toBe(expectedChecksumAddr);
    });

    it('should derive correct addresses from specific public keys (Rust equivalent)', async () => {
        const pubKeyHex = '03150a7f37063b134cde30070431a69148d60b252f4c7b38de33d813d329a7b7da';
        const pubKeyBytes = Uint8Array.from(hexToUint8Array(pubKeyHex));

        // Test for Zilliqa
        const addrZil = await Address.fromPubKey(pubKeyBytes, ZILLIQA);
        const expectedAddrZil = 'zil1a0vtxuxamd3kltmyzpqdyxqu25vsss8mp58jtu';
        expect(await addrZil.toZilBech32()).toBe(expectedAddrZil);

        // Test for Ethereum
        const addrEth = await Address.fromPubKey(pubKeyBytes, ETHEREUM);
        const expectedAddrEth = '0xC315295101461753b838E0BE8688E744cf52Dd6b';
        expect(await addrEth.toEthChecksum()).toBe(expectedAddrEth);
    });
});

