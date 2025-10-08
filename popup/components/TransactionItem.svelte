<script lang="ts">
    import type { IHistoricalTransactionState } from 'background/rpc/history_tx';
    import globalStore from 'popup/store/global';
    import DownRightIcon from './icons/DownRight.svelte';
    import UpRightIcon from './icons/UpRight.svelte';

    let {
        transaction
    }: {
        transaction: IHistoricalTransactionState;
    } = $props();
    
    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const currentAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount]);
    
    const isReceive = $derived(
        transaction.recipient.toLowerCase() === currentAccount?.addr.toLowerCase()
    );

    const formattedDate = $derived(() => {
        return new Intl.DateTimeFormat($globalStore.locale, {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(new Date(transaction.timestamp));
    });

    const formattedAmount = $derived(() => {
        const amount = transaction.metadata?.tokenInfo
            ? Number(transaction.metadata.tokenInfo.amount) / (10 ** transaction.metadata.tokenInfo.decimals)
            : Number(transaction.amount) / (10 ** 18);
        
        const symbol = transaction.metadata?.tokenInfo?.symbol;
        const sign = isReceive ? '+' : '-';
        
        return `${sign}${amount.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ${symbol}`;
    });

</script>

<button class="transaction-item">
    <div class="icon-container">
        {#if isReceive}
            <DownRightIcon />
        {:else}
            <UpRightIcon />
        {/if}
    </div>

    <div class="details-container">
        <div class="info-column">
            <span class="title">{transaction.title || (isReceive ? 'Receive' : 'Withdrawal')}</span>
            <span class="date">{formattedDate}</span>
        </div>
        <div class="amount-column">
            <span class="amount" class:receive={isReceive} class:withdrawal={!isReceive}>
                {formattedAmount}
            </span>
            <span class="secondary-amount">
                BTC 0.0010888
            </span>
        </div>
    </div>
</button>

<style lang="scss">
    .transaction-item {
        display: flex;
        align-items: flex-start;
        width: 100%;
        gap: 8px;
        padding: 12px 0;
        border: none;
        background: none;
        cursor: pointer;
        text-align: left;
    }

    .icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        background: rgba(172, 89, 255, 0.10);
        border-radius: 100px;

        :global(svg) {
            width: 24px;
            height: 24px;
            color: var(--color-content-icon-accent-secondary);
        }
    }

    .details-container {
        flex: 1 1 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: 0;
        padding-top: 1px;
    }

    .info-column,
    .amount-column {
        display: flex;
        flex-direction: column;
    }

    .info-column {
        align-items: flex-start;
    }

    .amount-column {
        align-items: flex-end;
    }

    .title {
        color: var(--color-content-text-inverted);
        font-size: 16px;
        font-family: Geist;
        font-weight: 400;
        line-height: 22px;
    }

    .date,
    .secondary-amount {
        color: var(--color-content-text-secondary);
        font-size: 12px;
        font-family: Geist;
        font-weight: 400;
        line-height: 16px;
    }

    .amount {
        font-size: 16px;
        font-family: Geist;
        font-weight: 700;
        line-height: 22px;
    }
    
    .amount.receive {
        color: var(--color-notification-positive-content);
    }
    
    .amount.withdrawal {
        color: var(--color-negative-border-primary);
    }
</style>
