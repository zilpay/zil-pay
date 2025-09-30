<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { viewChain } from 'lib/popup/url';
    import { getWalletChain } from 'popup/mixins/chains';

    import Header from '../components/Header.svelte';
    import BottomTabs from '../components/BottomTabs.svelte';
    import TransactionItem from '../components/TransactionItem.svelte';
    import type { IHistoricalTransactionState } from 'background/rpc/history_tx';
    
    const wallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const walletChain = $derived(getWalletChain($globalStore.selectedWallet));
    
    const transactions = $derived<IHistoricalTransactionState[]>(wallet?.history || []);

    function clearHistory() {
    }
</script>

<div class="page-container">
    <Header
        showNetworkButton={true}
        networkImageSrc={viewChain({
            network: walletChain,
            theme: $globalStore.appearances
        })}
        networkImageAlt={walletChain?.name || 'Network'}
    />

    <main class="content">
        <div class="history-header">
            <h1 class="title">{$_('history.title')}</h1>
            <button class="clear-button" onclick={clearHistory}>
                {$_('history.clearAll')}
            </button>
        </div>

        {#if transactions.length > 0}
            <div class="transactions-list">
                {#each transactions as tx (tx.transaction_hash)}
                    <div class="item-wrapper">
                        <TransactionItem transaction={tx} />
                    </div>
                {/each}
            </div>
        {:else}
            <div class="empty-state">
                <p>{$_('history.empty')}</p>
            </div>
        {/if}
    </main>

    <BottomTabs />
</div>

<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: var(--color-neutral-background-base);
        padding: 0;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        padding: 0 var(--padding-side, 20px);
    }

    .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        flex-shrink: 0;
    }

    .title {
        color: var(--color-content-text-inverted);
        font-size: 20px;
        font-family: Geist;
        font-weight: 700;
        line-height: 30px;
    }

    .clear-button {
        color: var(--color-content-text-purple);
        font-size: 14px;
        font-family: Geist;
        font-weight: 400;
        line-height: 20px;
        background: none;
        border: none;
        cursor: pointer;
    }

    .transactions-list {
        flex: 1;
        overflow-y: auto;
    }

    .item-wrapper {
        border-bottom: 1px solid var(--color-cards-regular-border-default);
    }

    .item-wrapper:last-child {
        border-bottom: none;
    }
    
    .empty-state {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-content-text-secondary);
        font-size: var(--font-size-large);
    }
</style>
