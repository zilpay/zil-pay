import { describe, it, expect } from 'vitest';
import { processTokenLogo, formExplorerUrl, viewChain } from '../../lib/popup/url';
import { CHAINS, ZERO_ADDR_HEX } from '../data';
import type { IExplorerState, IChainConfigState, IFTokenState } from "../../background/storage";
import { Themes } from "../../config/theme";

const zilliqaChain: IChainConfigState = CHAINS[0];
const bscChain: IChainConfigState = CHAINS[1];
const sepoliaChain: IChainConfigState = CHAINS[2];

describe('Image and URL processing utilities', () => {

  describe('processTokenLogo', () => {
    it('should correctly process the logo URL for a Zilliqa native token with a light theme', () => {
      const zilToken: IFTokenState = zilliqaChain.ftokens[1];
      const expectedUrl = `https://raw.githubusercontent.com/zilpay/tokens_meta/refs/heads/master/ft/zilliqa/${zilToken.addr}/dark.webp`;
      const result = processTokenLogo({
        token: zilToken,
        shortName: zilliqaChain.shortName,
        theme: Themes.Light
      });
      expect(result).toBe(expectedUrl);
    });

    it('should correctly process the logo URL for a Zilliqa native token with a dark theme', () => {
      const zilToken: IFTokenState = zilliqaChain.ftokens[1];
      const expectedUrl = `https://raw.githubusercontent.com/zilpay/tokens_meta/refs/heads/master/ft/zilliqa/${zilToken.addr}/light.webp`;
      const result = processTokenLogo({
        token: zilToken,
        shortName: zilliqaChain.shortName,
        theme: Themes.Dark
      });
      expect(result).toBe(expectedUrl);
    });

    it('should correctly process the logo URL for a BNB token with a light theme', () => {
      const bnbToken: IFTokenState = bscChain.ftokens[0];
      const expectedUrl = `https://raw.githubusercontent.com/zilpay/tokens_meta/refs/heads/master/ft/bnbchain/${ZERO_ADDR_HEX}/dark.webp`;
      const result = processTokenLogo({
        token: bnbToken,
        shortName: bscChain.shortName,
        theme: Themes.Light
      });
      expect(result).toBe(expectedUrl);
    });

    it('should return a default warning icon if the token has no logo', () => {
      const tokenWithoutLogo: IFTokenState = { ...sepoliaChain.ftokens[0], logo: null };
      const expected = 'assets/icons/warning.svg';
      const result = processTokenLogo({
        token: tokenWithoutLogo,
        shortName: sepoliaChain.shortName,
        theme: Themes.Light
      });
      expect(result).toBe(expected);
    });
  });

  describe('formExplorerUrl', () => {
    it('should correctly form the explorer URL for a transaction', () => {
      const explorer: IExplorerState = zilliqaChain.explorers[0];
      const txHash = '0x1234567890abcdef';
      const expectedUrl = `${explorer.url}/tx/${txHash}`;
      const result = formExplorerUrl(explorer, txHash);
      expect(result).toBe(expectedUrl);
    });

    it('should handle explorer URLs that end with a slash', () => {
      const explorerWithSlash: IExplorerState = { ...bscChain.explorers[0], url: 'https://testnet.bscscan.com/' };
      const txHash = '0xabcdef1234567890';
      const expectedUrl = `https://testnet.bscscan.com/tx/${txHash}`;
      const result = formExplorerUrl(explorerWithSlash, txHash);
      expect(result).toBe(expectedUrl);
    });
  });

  describe('viewChain', () => {
    it('should correctly process the chain logo URL with a light theme', () => {
      const expectedUrl = 'https://raw.githubusercontent.com/zilpay/tokens_meta/refs/heads/master/ft/zilliqa/chain/dark.svg';
      const result = viewChain({
        network: zilliqaChain,
        theme: Themes.Light
      });
      expect(result).toBe(expectedUrl);
    });

    it('should correctly process the chain logo URL with a dark theme', () => {
      const expectedUrl = 'https://raw.githubusercontent.com/zilpay/tokens_meta/refs/heads/master/ft/zilliqa/chain/light.svg';
      const result = viewChain({
        network: zilliqaChain,
        theme: Themes.Dark
      });
      expect(result).toBe(expectedUrl);
    });

    it('should return a default icon if the network has no logo URL', () => {
      const networkWithoutLogo: IChainConfigState = { ...zilliqaChain, logo: '' };
      const expected = 'assets/icons/default_chain.svg';
      const result = viewChain({
        network: networkWithoutLogo,
        theme: Themes.Light
      });
      expect(result).toBe(expected);
    });

    it('should correctly process the logo URL for a different chain (Sepolia)', () => {
        const expectedUrl = 'https://raw.githubusercontent.com/zilpay/tokens_meta/refs/heads/master/ft/ethereum/chain/dark.svg';
        const result = viewChain({
          network: sepoliaChain,
          theme: Themes.Light
        });
        expect(result).toBe(expectedUrl);
      });
  });
});
