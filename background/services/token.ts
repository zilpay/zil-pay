import { RpcProvider } from "background/rpc";
import { buildNFTRequests, NFTMetadataField, processEthNFTBalanceResponse, processEthNFTMetadataResponse, processZilBaseUriResponse, processZilNFTBalanceResponse, processZilNFTMetadataResponse } from "background/rpc/nft_parser";
import type { BackgroundState } from "background/storage";
import type { FToken } from "background/storage/ftoken";
import type { ChainConfig } from "background/storage/chain";
import { RatesApiOptions } from "config/api";
import { ZERO_EVM } from "config/common";
import { ConnectError } from "config/errors";
import { NFTStandard } from "config/token";
import { ETHEREUM, ZILLIQA } from "config/slip44";
import { AddressType } from "config/wallet";
import { Address } from "crypto/address";
import type { StreamResponse } from "lib/streem";
import { hexToUint8Array } from "lib/utils/hex";
import { hashXORHex } from "lib/utils/hashing";
import type { NFTMetadata, NFTTokenInfo } from "types/token";

interface ZilstreamToken {
  symbol: string;
  price_eth: string;
}

interface ZilstreamResponse {
  data: ZilstreamToken[];
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
      if (!chainConfig || chainConfig.testnet) {
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
    try {
      const wallet = this.#state.wallets[walletIndex];
      await wallet.trhowSession();

      const account = wallet.accounts[wallet.selectedAccount];
      const chain = this.#state.getChain(account.chainHash);

      if (!chain) {
        throw new Error(ConnectError.ChainNotFound);
      }

      const nativeToken = chain.ftokens[0];
      if (!nativeToken) {
        throw new Error("Native token not found");
      }

      const currency = wallet.settings.currencyConvert;
      const convertRate = await this.#fetchConvertRate(
        wallet.settings.ratesApiOptions,
        nativeToken.symbol,
        currency
      );

      if (convertRate === null) {
        sendResponse({ resolve: wallet.tokens });
        return;
      }

      const chainHash = chain.hash();
      const chainTokens = wallet.tokens.filter((t) => t.chainHash === chainHash);

      await this.#updateChainRates(chain, chainTokens, convertRate, currency);
      await this.#state.sync();

      sendResponse({ resolve: wallet.tokens });
    } catch (err) {
      sendResponse({ reject: String(err) });
    }
  }

  async #fetchConvertRate(
    ratesApiOptions: RatesApiOptions,
    symbol: string,
    currency: string
  ): Promise<number | null> {
    switch (ratesApiOptions) {
      case RatesApiOptions.CoinGecko:
        return this.#fetchCoinGeckoRate(symbol, currency);
      case RatesApiOptions.CryptoCompare:
        return this.#fetchCryptoCompareRate(symbol, currency);
      default:
        return null;
    }
  }

  async #fetchCoinGeckoRate(symbol: string, currency: string): Promise<number> {
    const symbolId = symbol.toLowerCase();
    const url = `https://api.coingecko.com/api/v3/simple/price?symbols=${symbolId}&vs_currencies=${currency.toLowerCase()}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "ZilPay-Wallet/1.0" }
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    return data[symbolId]?.[currency.toLowerCase()] ?? 0;
  }

  async #fetchCryptoCompareRate(symbol: string, currency: string): Promise<number> {
    const url = `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=${currency.toUpperCase()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`CryptoCompare API error: ${response.status}`);
    }

    const data = await response.json();
    return data[currency.toUpperCase()] ?? 0;
  }

  async #updateChainRates(
    chain: ChainConfig,
    tokens: FToken[],
    convertRate: number,
    currency: string
  ): Promise<void> {
    switch (chain.slip44) {
      case ZILLIQA:
        await this.#updateZilliqaRates(tokens, convertRate);
        break;
      case ETHEREUM:
        await this.#updateEthereumRates(chain.chainId, tokens, convertRate, currency);
        break;
      default:
        this.#updateNativeRate(tokens, convertRate);
        break;
    }
  }

  async #updateZilliqaRates(tokens: FToken[], convertRate: number): Promise<void> {
    const response = await fetch("https://api-v2.zilstream.com/tokens?page=1&per_page=500");

    if (!response.ok) {
      throw new Error(`Zilstream API error: ${response.status}`);
    }

    const data: ZilstreamResponse = await response.json();
    const rateMap = new Map<string, number>();

    for (const token of data.data) {
      const rate = parseFloat(token.price_eth);
      if (!isNaN(rate)) {
        rateMap.set(token.symbol.toUpperCase(), rate);
      }
    }

    for (const token of tokens) {
      const symbolUpper = token.symbol.toUpperCase();
      const rateZil = rateMap.get(symbolUpper);

      if (rateZil !== undefined) {
        token.rate = rateZil * convertRate;
      } else if (token.native) {
        token.rate = convertRate;
      }
    }
  }

  async #updateEthereumRates(
    chainId: number,
    tokens: FToken[],
    convertRate: number,
    currency: string
  ): Promise<void> {
    if (tokens.length === 0) return;

    const tokenAddresses = tokens.map((t) => t.addr.toLowerCase());
    const addressesParam = tokenAddresses.join(",");
    const url = `https://price.api.cx.metamask.io/v2/chains/${chainId}/spot-prices?tokenAddresses=${addressesParam}&vsCurrency=${currency.toUpperCase()}&includeMarketData=false`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`MetaMask price API error: ${response.status}`);
    }

    const prices: Record<string, Record<string, number>> = await response.json();
    const currencyKey = currency.toLowerCase();

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const addr = tokenAddresses[i];
      const priceData = prices[addr];

      if (priceData?.[currencyKey] !== undefined) {
        token.rate = token.native ? convertRate : priceData[currencyKey];
      }
    }
  }

  #updateNativeRate(tokens: FToken[], convertRate: number): void {
    const nativeToken = tokens.find((t) => t.native);
    if (nativeToken) {
      nativeToken.rate = convertRate;
    }
  }
}
