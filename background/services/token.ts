import { NetworkProvider, RpcProvider } from "background/rpc";
import { buildNFTRequests, NFTMetadataField, processEthNFTBalanceResponse, processEthNFTMetadataResponse, processZilBaseUriResponse, processZilNFTBalanceResponse, processZilNFTMetadataResponse } from "background/rpc/nft_parser";
import type { BackgroundState } from "background/storage";
import { RatesApiOptions } from "config/api";
import { ZERO_EVM } from "config/common";
import { ConnectError } from "config/errors";
import { NFTStandard } from "config/token";
import { AddressType } from "config/wallet";
import { Address } from "crypto/address";
import type { StreamResponse } from "lib/streem";
import { hexToUint8Array } from "lib/utils/hex";
import { hashXORHex } from "lib/utils/hashing";
import type { NFTMetadata, NFTTokenInfo } from "types/token";

interface CoinGeckoPrice {
  [currency: string]: number;
}

interface CoinGeckoResponse {
  [symbol: string]: CoinGeckoPrice;
}

interface PortfolioToken {
  address: string;
  symbol: string;
  decimals?: number;
  name: string;
  type: string;
  metadata?: {
    logoUrl?: string;
    protectionInfo?: {
      result: string;
    };
  };
}

interface PortfolioBalance {
  token: PortfolioToken;
  amount?: {
    raw: string;
  };
  priceUsd?: number;
}

interface PortfolioResponse {
  portfolio?: {
    balances: PortfolioBalance[];
  };
}

export class TokenService {
  #state: BackgroundState;

  constructor(state: BackgroundState) {
    this.#state = state;
  }

  async tokensHints(sendResponse: StreamResponse) {
    try {
      const currentAccount = this.#state.getCurrentAccount();
      if (!currentAccount) {
        throw new Error(ConnectError.AddressMismatch);
      }

      const chainConfig = this.#state.getChain(currentAccount.chainHash);
      if (!chainConfig) {
        throw new Error(ConnectError.ChainNotFound);
      }

      const addr: string = currentAccount.addr.split(":").at(-1) ?? currentAccount.addr;
      const url = "https://interface.gateway.uniswap.org/v2/data.v1.DataApiService/GetPortfolio";
      const requestBody = {
        walletAccount: {
          platformAddresses: [
            { address: addr, },
          ],
        },
        chainIds: [currentAccount.chainId],
        modifier: {
          address: addr,
          includeOverrides: [],
        },
      };
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://app.uniswap.org",
        },
        body: JSON.stringify(requestBody),
      });
      const result: PortfolioResponse = await response.json();
      const balances = result?.portfolio?.balances || [];
      const filteredTokens = balances.filter((balance) => {
        const token = balance.token;

        if (token?.metadata?.protectionInfo?.result === "PROTECTION_RESULT_MALICIOUS") {
          return false;
        }
        if (token?.metadata?.protectionInfo?.result === "PROTECTION_RESULT_WARNING") {
          return false;
        }

        if (token?.type !== "TOKEN_TYPE_ERC20" || token?.address == ZERO_EVM) {
          return false;
        }

        if (token?.address === ZERO_EVM) {
          return false;
        }

        return true;
      });

      const pubKeyHash = hashXORHex(currentAccount.pubKey);
      const tokens = filteredTokens.map((balance) => {
        const token = balance.token;
        return {
          name: token.name ?? "",
          symbol: token.symbol ?? "",
          decimals: token.decimals ?? 18,
          addr: token.address,
          addrType: currentAccount.addrType,
          logo: token.metadata?.logoUrl || chainConfig.ftokens[0].logo,
          balances: {
            [pubKeyHash]: balance.amount?.raw ?? "0"
          },
          rate: 0,
          default_: false,
          native: false,
          chainHash: currentAccount.chainHash,
        };
      });

      sendResponse({
        resolve: tokens,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async fetchNFTMetadata(
    contract: string,
    walletIndex: number,
    sendResponse: StreamResponse
  ) {
    try {
      const contractAddr = Address.fromStr(contract);
      const wallet = this.#state.wallets[walletIndex];
      await wallet.trhowSession();
      const account = wallet.accounts[wallet.selectedAccount];
      const chainConfig = this.#state.getChain(account.chainHash);

      if (!chainConfig) {
        throw new Error(ConnectError.ChainNotFound);
      }

      const provider = new RpcProvider(chainConfig);
      const pubKeys = wallet.accounts.map((a) => hexToUint8Array(a.pubKey));

      const requestsWithTypes = await buildNFTRequests(
        contractAddr,
        pubKeys,
      );

      const payloads = requestsWithTypes.map((r) => r.payload);
      const responses = await provider.req<any[]>(payloads);

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
      await wallet.trhowSession();

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
