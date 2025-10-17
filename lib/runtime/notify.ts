// zil-pay/lib/notify.ts

import { Runtime } from "lib/runtime";
import { TransactionStatus } from "config/tx";
import type { IHistoricalTransactionState } from "background/rpc/history_tx";
import type { IChainConfigState } from "background/storage";
import { formExplorerUrl } from "lib/popup/url";
import { Locales } from "config/locale";

export interface NotificationOptions {
  title: string;
  message: string;
  iconUrl?: string;
  txHash: string;
  explorerUrl: string;
}

export class TransactionNotifier {
  #notificationMap = new Map<string, string>();
  #translations: Record<string, string> = {};
  #chain: IChainConfigState;

  private constructor(chain: IChainConfigState, translations: Record<string, string>) {
    this.#chain = chain;
    this.#translations = translations;
  }

  static async init(locale: Locales, chain: IChainConfigState): Promise<TransactionNotifier> {
    const translations = await this.#loadTranslations(locale);
    return new TransactionNotifier(chain, translations);
  }

  static async #loadTranslations(locale: Locales): Promise<Record<string, string>> {
    try {
      const browserLang = Locales.Auto === locale ? navigator.language.toLowerCase().split('-')[0] : locale;
      const url = Runtime.runtime.getURL(`lang/${browserLang}.json`);
      const response = await fetch(url);
      const data = await response.json();
      return data.notify || {};
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  #t(key: string): string {
    return this.#translations[key] ?? key;
  }

  async notifyTransactionStatus(tx: IHistoricalTransactionState): Promise<void> {
    if (tx.status === TransactionStatus.Pending) {
      return;
    }

    const txHash = tx.scilla?.hash || tx.evm?.transactionHash;
    if (!txHash) {
      return;
    }

    if (this.#notificationMap.has(txHash)) {
      return;
    }

    const explorer = this.#chain.explorers[0];
    if (!explorer) {
      return;
    }

    const explorerUrl = formExplorerUrl(explorer, txHash);
    const options = this.#buildNotificationOptions(tx, explorerUrl);

    await this.#createNotification(txHash, options);
    this.#notificationMap.set(txHash, explorerUrl);
  }

  #buildNotificationOptions(
    tx: IHistoricalTransactionState,
    explorerUrl: string,
  ): NotificationOptions {
    const txHash = tx.scilla?.hash || tx.evm?.transactionHash || '';
    const symbol = tx.metadata.token.symbol;
    const truncatedHash = this.#truncateHash(txHash);

    let title: string;
    let message: string;
    const iconUrl = 'icons/icon48.png';

    if (tx.status === TransactionStatus.Success) {
      title = this.#t('tx.success.title');
      message = this.#t('tx.success.message')
        .replace('{symbol}', symbol)
        .replace('{hash}', truncatedHash);
    } else {
      title = this.#t('tx.failed.title');
      message = this.#t('tx.failed.message')
        .replace('{symbol}', symbol)
        .replace('{hash}', truncatedHash);
    }

    return {
      title,
      message,
      iconUrl: Runtime.runtime.getURL(iconUrl),
      txHash,
      explorerUrl,
    };
  }

  async #createNotification(
    notificationId: string,
    options: NotificationOptions,
  ): Promise<void> {
    try {
      Runtime.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: options.iconUrl || Runtime.runtime.getURL('icons/icon128.png'),
        title: options.title,
        message: options.message,
        priority: 2,
        requireInteraction: false,
      });

      this.#setupNotificationClickHandler(notificationId, options.explorerUrl);
    } catch (error) {
      console.error(error);
    }
  }

  #setupNotificationClickHandler(
    notificationId: string,
    explorerUrl: string,
  ): void {
    const handler = (clickedId: string) => {
      if (clickedId === notificationId) {
        Runtime.tabs.create({ url: explorerUrl });
        Runtime.notifications.clear(notificationId);
        this.#notificationMap.delete(notificationId);
      }
    };

    Runtime.notifications.onClicked.addListener(handler);

    Runtime.notifications.onClosed.addListener((closedId: string) => {
      if (closedId === notificationId) {
        this.#notificationMap.delete(closedId);
      }
    });
  }

  #truncateHash(hash: string): string {
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  }

  clearAll(): void {
    this.#notificationMap.clear();
  }
}
