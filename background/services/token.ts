import type { BackgroundState } from "background/storage";
import type { StreamResponse } from "lib/streem";

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

  async updateCoinGecko(walletIndex: number, sendResponse: StreamResponse) {
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

      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=${currency}`;
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
