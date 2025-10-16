<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { addNextBip39Account } from 'popup/background/wallet';
    
    import NavBar from '../components/NavBar.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import Button from '../components/Button.svelte';
    import Counter from '../components/Counter.svelte';
    import EditIcon from '../components/icons/Edit.svelte';
    import { pop } from 'popup/router/navigation';

    let accountName = $state($_('addAccount.defaultName', { values: { index: 1 } }));
    let accountIndex = $state($globalStore.wallets[$globalStore.selectedWallet].accounts.length + 1);
    let isLoading = $state(false);
    let error = $state<string | null>(null);

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    
    const accountExists = $derived(() => {
        if (!currentWallet) return false;
        return currentWallet.accounts.some(account => account.index === accountIndex);
    });

    const isCreateDisabled = $derived(
        isLoading || !currentWallet || accountExists() || !accountName.trim()
    );

    async function handleCreate() {
        if (isCreateDisabled) return;
        
        isLoading = true;
        error = null;
        
        try {
            await addNextBip39Account({
                walletIndex: $globalStore.selectedWallet,
                account: {
                    name: accountName,
                    index: accountIndex,
                }
            });
            pop();
        } catch (err) {
            error = String(err);
        } finally {
            isLoading = false;
        }
    }

    $effect(() => {
        if (accountName || accountIndex) {
            error = null;
        }
    });
</script>

<div class="page-container">
    <NavBar title={$_('addAccount.title')} />

    <main class="content">
        <h3 class="section-title">{$_('addAccount.bip39Title')}</h3>

        <SmartInput
            bind:value={accountName}
            disabled={isLoading}
            loading={isLoading}
            placeholder={$_('addAccount.namePlaceholder')}
            hide={false}
            showToggle={false}
            hasError={!!error}
        >
            {#snippet rightAction()}
                <button type="button" class="edit-button" aria-label={$_('addAccount.editName')}>
                    <EditIcon />
                </button>
            {/snippet}
        </SmartInput>

        <Counter
            bind:value={accountIndex}
            disabled={isLoading}
            title={$_('addAccount.bip39Title')}
            min={1}
            max={255}
            decrementLabel={$_('addAccount.decrementCount')}
            incrementLabel={$_('addAccount.incrementCount')}
        />

        {#if accountExists()}
            <div class="warning-message">
                {$_('addAccount.accountExists', { values: { index: accountIndex } })}
            </div>
        {/if}

        {#if error}
            <div class="error-message">
                {error}
            </div>
        {/if}
    </main>

    <footer class="footer">
        <Button onclick={handleCreate} loading={isLoading} disabled={isCreateDisabled}>
            {$_('addAccount.createButton', { values: { count: accountIndex } })}
        </Button>
    </footer>
</div>

<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--color-neutral-background-base);
        padding: 0;
        box-sizing: border-box;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 24px var(--padding-side);
        overflow-y: auto;
    }

    .section-title {
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        margin: 0;
    }

    .edit-button {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        :global(svg) {
            width: 24px;
            height: 24px;
            color: var(--color-content-icon-secondary);
        }
    }

    .warning-message {
        padding: 12px;
        background: var(--color-warning-background);
        color: var(--color-warning-text);
        font-size: 14px;
        line-height: 20px;
        border-radius: 12px;
        text-align: center;
    }

    .error-message {
        padding: 12px;
        background: var(--color-error-background);
        color: var(--color-error-text);
        font-size: 14px;
        line-height: 20px;
        border-radius: 12px;
        text-align: center;
    }

    .footer {
        padding: 16px var(--padding-side) calc(16px + env(safe-area-inset-bottom));
        background: var(--color-neutral-background-base);
    }
</style>
