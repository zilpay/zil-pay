import { RpcProvider } from "background/rpc";
import { buildNFTRequests, NFTMetadataField, NFTStandard, processEthNFTBalanceResponse, processEthNFTMetadataResponse, processZilBaseUriResponse, processZilNFTBalanceResponse, processZilNFTMetadataResponse, type NFTMetadata, type NFTTokenInfo } from "background/rpc/nft_parser";
import type { BackgroundState } from "background/storage";
import { RatesApiOptions } from "config/api";
import { AddressType } from "config/wallet";
import { Address } from "crypto/address";
import type { StreamResponse } from "lib/streem";
import { hexToUint8Array } from "lib/utils/hex";

interface CoinGeckoPrice {
  [currency: string]: number;
}

interface CoinGeckoResponse {
  [symbol: string]: CoinGeckoPrice;
}

export class TokenService {
  #state: BackgroundState;

  constructor(state: BackgroundState) {
    this.#state = state;
  }

  async fetchNFTMetadata(
    contract: string,
    walletIndex: number,
    sendResponse: StreamResponse
  ) {
    try {
      const contractAddr = Address.fromStr(contract);
      const wallet = this.#state.wallets[walletIndex];
      const account = wallet.accounts[wallet.selectedAccount];
      const chainConfig = this.#state.getChain(account.chainHash);

      if (!chainConfig) {
        throw new Error("Chain configuration not found");
      }

      const provider = new RpcProvider(chainConfig);
      const pubKeys = wallet.accounts.map((a) => hexToUint8Array(a.pubKey));

      const requestsWithTypes = await buildNFTRequests(
        contractAddr,
        pubKeys,
      );

      const payloads = requestsWithTypes.map((r) => r.payload);
      console.log(JSON.stringify(payloads, null, 2));
      const responses = await provider.req<any[]>(payloads);
      console.log(JSON.stringify(responses, null, 2));

      let name = "";
      let symbol = "";
      let totalSupply: string | undefined;
      let standard = NFTStandard.ERC721;
      let baseURI: string | undefined;
      let balances: Record<number, Record<string, NFTTokenInfo>> = {};

      if (contractAddr.type === AddressType.Bech32) {
        const metadata = processZilNFTMetadataResponse(responses[0]);
        name = metadata.name;
        symbol = metadata.symbol;
        standard = NFTStandard.ZRC6;

        baseURI = processZilBaseUriResponse(responses[3]);

        const result = await processZilNFTBalanceResponse(
          responses[1],
          responses[2],
          baseURI,
          pubKeys
        );
    
        balances = result.balances;
      } else if (contractAddr.type === AddressType.EthCheckSum) {
        name = processEthNFTMetadataResponse(
          responses[0],
          NFTMetadataField.Name,
        );
        symbol = processEthNFTMetadataResponse(
          responses[1],
          NFTMetadataField.Symbol,
        );
        totalSupply = processEthNFTMetadataResponse(
          responses[2],
          NFTMetadataField.TotalSupply,
        );

        requestsWithTypes.slice(3).forEach((reqWithType, index) => {
          if (reqWithType.requestType.type === "Balance") {
            const response = responses[3 + index];
            const balance = processEthNFTBalanceResponse(response);
        
            if (balance > 0n) {
              balances[reqWithType.requestType.pubKeyHash] = {};
            }
          }
        });
      }

      const metadata: NFTMetadata = {
        name,
        symbol,
        totalSupply,
        standard,
        balances,
        contractAddress: contract,
        baseURI,
      };

      sendResponse({
        resolve: metadata,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async updateRates(walletIndex: number, sendResponse: StreamResponse) {
      const wallet = this.#state.wallets[walletIndex];

      if (wallet.settings.ratesApiOptions == RatesApiOptions.CoinGecko) {
        await this.#updateCoinGecko(walletIndex, sendResponse);
      } else {
        sendResponse({
          resolve: wallet.tokens,
        });
      }
  }

  async #updateCoinGecko(walletIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];
      const currency = wallet.settings.currencyConvert.toLowerCase();
      const symbols = wallet.tokens
        .map(token => token.symbol.toLowerCase())
        .join(',');

      if (!symbols) {
        sendResponse({
          resolve: wallet.tokens,
        });
        return;
      }

      const url = `https://api.coingecko.com/api/v3/simple/price?symbols=${symbols}&vs_currencies=${currency}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json() as CoinGeckoResponse;

      wallet.tokens.forEach(token => {
        const symbolLower = token.symbol.toLowerCase();
        const priceData = data[symbolLower];
        
        if (priceData && priceData[currency]) {
          token.rate = priceData[currency];
        }
      });

      await this.#state.sync();

      sendResponse({
        resolve: wallet.tokens,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }
}
