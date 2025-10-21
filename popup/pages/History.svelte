<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { viewChain } from 'lib/popup/url';
    import { getAccountChain } from 'popup/mixins/chains';
    import Header from '../components/Header.svelte';
    import BottomTabs from '../components/BottomTabs.svelte';
    import TransactionItem from '../components/TransactionItem.svelte';
    import Modal from '../components/Modal.svelte';
    import TransactionDetails from '../modals/TransactionDetails.svelte';
    import type { IHistoricalTransactionState } from 'background/rpc/history_tx';
    import { checkTransactionsHistory } from 'popup/background/transactions';
    import { setGlobalState } from 'popup/background/wallet';

    const MILLISECONDS_PER_DAY = 86400000;

    let errorMessage = $state<string | null>(null);
    let isRefreshing = $state(false);
    let showTxModal = $state(false);
    let selectedTransaction = $state<IHistoricalTransactionState | null>(null);

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const currentChain = $derived(getAccountChain($globalStore.selectedWallet));
    const currentAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount]);
    
    const filteredHistory = $derived(() => {
        if (!currentWallet || !currentAccount) return [];
        
        return currentWallet.history.filter(
            tx => tx.metadata.chainHash === currentAccount.chainHash
        ).reverse();
    });

    const groupedTransactions = $derived(() => {
        const groups = new Map<string, IHistoricalTransactionState[]>();
        const now = Date.now();
        
        filteredHistory().forEach(transaction => {
            const txDate = new Date(transaction.timestamp * 1000);
            const diffInDays = Math.floor((now - txDate.getTime()) / MILLISECONDS_PER_DAY);
            
            let groupKey: string;
            
            if (diffInDays === 0) {
                groupKey = $_('history.today');
            } else if (diffInDays === 1) {
                groupKey = $_('history.yesterday');
            } else if (diffInDays < 7) {
                groupKey = $_('history.thisWeek');
            } else if (diffInDays < 30) {
                groupKey = $_('history.thisMonth');
            } else if (txDate.getFullYear() === new Date(now).getFullYear()) {
                groupKey = txDate.toLocaleDateString($globalStore.locale, { month: 'long' });
            } else {
                groupKey = txDate.toLocaleDateString($globalStore.locale, { 
                    month: 'long', 
                    year: 'numeric' 
                });
            }
            
            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }
            groups.get(groupKey)!.push(transaction);
        });
        
        return Array.from(groups.entries());
    });

    async function handleClearAll() {
        globalStore.update(state => {
            const newWallets = [...state.wallets];
            newWallets[state.selectedWallet] = {
                ...newWallets[state.selectedWallet],
                history: []
            };
            return { 
                ...state, 
                wallets: newWallets 
            };
        });

        await setGlobalState();
    }

    async function handleCheckTransactionsHistory() {
        if (isRefreshing) return;
        
        isRefreshing = true;
        errorMessage = null;

        try {
            const history = await checkTransactionsHistory($globalStore.selectedWallet);
            
            globalStore.update(state => {
                const newWallets = [...state.wallets];
                newWallets[$globalStore.selectedWallet] = {
                    ...newWallets[$globalStore.selectedWallet],
                    history
                };
                return {
                    ...state,
                    wallets: newWallets
                };
            });
        } catch (err) {
            errorMessage = String(err);
            console.error('Failed to check transaction history:', err);
        } finally {
            isRefreshing = false;
        }
    }

    function handleTransactionClick(transaction: IHistoricalTransactionState) {
        selectedTransaction = transaction;
        showTxModal = true;
    }
</script>

<div class="page-container">
    <Header
        showNetworkButton={true}
        networkImageSrc={viewChain({
            network: currentChain,
            theme: $globalStore.appearances
        })}
        networkImageAlt={currentChain?.name ?? ''}
        onRefresh={handleCheckTransactionsHistory}
        refreshDisabled={isRefreshing}
    />

    <main class="content">
        {#if errorMessage}
            <div class="error-banner">
                <span class="error-text">{errorMessage}</span>
                <button class="error-close" onclick={() => errorMessage = null}>×</button>
            </div>
        {/if}

        <div class="header-section">
            <h1 class="title">{$_('history.title')}</h1>
            {#if filteredHistory().length > 0}
                <button class="clear-button" onclick={handleClearAll}>
                    {$_('history.clearAll')}
                </button>
            {/if}
        </div>

        {#if filteredHistory().length === 0}
            <div class="empty-state">
                <p class="empty-text">{$_('history.noTransactions')}</p>
            </div>
        {:else}
            <div class="transactions-container">
                {#each groupedTransactions() as [groupName, transactions] (groupName)}
                    <section class="transaction-group">
                        <h2 class="group-title">{groupName}</h2>
                        <div class="transactions-list">
                            {#each transactions as transaction (transaction.timestamp)}
                                <button 
                                    class="transaction-button" 
                                    onclick={() => handleTransactionClick(transaction)}
                                >
                                    <TransactionItem {transaction} />
                                </button>
                            {/each}
                        </div>
                    </section>
                {/each}
            </div>
        {/if}
    </main>

    <BottomTabs />
</div>

{#if selectedTransaction}
    <Modal bind:show={showTxModal} title={$_('txDetails.title')}>
        <TransactionDetails transaction={selectedTransaction} />
    </Modal>
{/if}

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

    .error-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px var(--padding-side);
        background: var(--color-error-background);
        border-bottom: 1px solid var(--color-negative-border-primary);
    }

    .error-text {
        flex: 1;
        color: var(--color-error-text);
        font-size: 14px;
        line-height: 20px;
        word-break: break-word;
    }

    .error-close {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 24px;
        line-height: 1;
        color: var(--color-error-text);
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s ease;

        &:hover {
            background: color-mix(in srgb, var(--color-negative-border-primary) 20%, transparent);
        }
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

        &:active {
            transform: scale(0.98);
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
        margin: 0;
    }

    .transactions-container {
        display: flex;
        flex-direction: column;
        gap: 32px;
        padding: 0 var(--padding-side) 24px;
    }

    .transaction-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .group-title {
        font-size: 18px;
        font-weight: 600;
        line-height: 24px;
        color: var(--color-content-text-inverted);
        margin: 0;
        padding: 0 4px;
        text-transform: capitalize;
    }

    .transactions-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .transaction-button {
        width: 100%;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        text-align: left;

        &:focus-visible {
            outline: 2px solid var(--color-inputs-border-focus);
            outline-offset: 2px;
            border-radius: 12px;
        }
    }
</style>
