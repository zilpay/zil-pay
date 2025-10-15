<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { viewChain } from 'lib/popup/url';
    import { getAccountChain } from 'popup/mixins/chains';
    import Header from '../components/Header.svelte';
    import BottomTabs from '../components/BottomTabs.svelte';
    import TransactionItem from '../components/TransactionItem.svelte';
    import type { IHistoricalTransactionState } from 'background/rpc/history_tx';

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const currentChain = $derived(getAccountChain($globalStore.selectedWallet));
    const history = $derived(currentWallet?.history ?? []);

    const groupedTransactions = $derived(() => {
        const groups = new Map<string, IHistoricalTransactionState[]>();
        
        history.forEach(transaction => {
            const date = new Date(transaction.timestamp);
            const now = new Date();
            const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
            
            let groupKey: string;
            
            if (diffInDays === 0) {
                groupKey = $_('history.today');
            } else if (diffInDays === 1) {
                groupKey = $_('history.yesterday');
            } else if (diffInDays < 7) {
                groupKey = $_('history.thisWeek');
            } else if (diffInDays < 30) {
                groupKey = $_('history.thisMonth');
            } else if (date.getFullYear() === now.getFullYear()) {
                groupKey = date.toLocaleDateString(undefined, { month: 'long' });
            } else {
                groupKey = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
            }
            
            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }
            groups.get(groupKey)!.push(transaction);
        });
        
        return Array.from(groups.entries());
    });

    function handleClearAll() {
    }
</script>

<div class="page-container">
    <Header
        showNetworkButton={true}
        networkImageSrc={viewChain({
            network: currentChain,
            theme: $globalStore.appearances
        })}
        networkImageAlt={currentChain?.name || 'Network'}
    />

    <main class="content">
        <div class="header-section">
            <h1 class="title">{$_('history.title')}</h1>
            {#if history.length > 0}
                <button class="clear-button" onclick={handleClearAll}>
                    {$_('history.clearAll')}
                </button>
            {/if}
        </div>

        {#if history.length === 0}
            <div class="empty-state">
                <p class="empty-text">{$_('history.noTransactions')}</p>
            </div>
        {:else}
            <div class="transactions-container">
                {#each groupedTransactions() as [groupName, transactions]}
                    <div class="transaction-group">
                        <h2 class="group-title">{groupName}</h2>
                        <div class="transactions-list">
                            {#each transactions as transaction (transaction.timestamp)}
                                <TransactionItem {transaction} />
                            {/each}
                        </div>
                    </div>
                {/each}
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
        background: var(--color-neutral-background-base);
        padding: 0;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0;
        overflow-y: auto;
        min-height: 0;
    }

    .header-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px var(--padding-side) 16px;
        position: sticky;
        top: 0;
        background: var(--color-neutral-background-base);
        z-index: 10;
    }

    .title {
        font-size: 32px;
        font-weight: 700;
        line-height: 38px;
        color: var(--color-content-text-inverted);
        margin: 0;
    }

    .clear-button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
        color: var(--color-content-text-purple);
        padding: 4px 8px;
        border-radius: 6px;
        transition: background-color 0.2s ease;

        &:hover {
            background: var(--color-button-regular-quaternary-hover);
        }
    }

    .empty-state {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px;
    }

    .empty-text {
        color: var(--color-content-text-secondary);
        font-size: 16px;
        text-align: center;
    }

    .transactions-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 0 var(--padding-side) 24px;
    }

    .transaction-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .group-title {
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        color: var(--color-content-text-secondary);
        margin: 0;
        padding: 0 4px;
    }

    .transactions-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
</style>
