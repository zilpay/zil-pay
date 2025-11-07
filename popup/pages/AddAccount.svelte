<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { addNextBip39Account, addLedgerAccount } from 'popup/background/wallet';
    import { ledgerController } from 'ledger/controller';
    import type { LedgerPublicAddress } from 'types/ledger';
    import { WalletTypes } from 'config/wallet';
    import { getAccountChain } from 'popup/mixins/chains';
    
    import NavBar from '../components/NavBar.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import Button from '../components/Button.svelte';
    import Counter from '../components/Counter.svelte';
    import EditIcon from '../components/icons/Edit.svelte';
    import LedgerSignModal from '../modals/LedgerSignModal.svelte';
    import { pop } from 'popup/router/navigation';

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const isLedgerWallet = $derived(currentWallet?.walletType === WalletTypes.Ledger);
    const currentChain = $derived(getAccountChain($globalStore.selectedWallet));

    let accountIndex = $state($globalStore.wallets[$globalStore.selectedWallet].accounts.length);
    let accountName = $state('');
    let isLoading = $state(false);
    let error = $state<string | null>(null);
    let showLedgerModal = $state(false);

    const defaultAccountName = $derived(
        isLedgerWallet 
            ? $_('addAccount.ledger.defaultName', { values: { index: accountIndex } })
            : $_('addAccount.bip39.defaultName', { values: { index: accountIndex } })
    );

    $effect(() => {
        if (!accountName) {
            accountName = defaultAccountName;
        }
    });
    
    const accountExists = $derived(() => {
        if (!currentWallet) return false;
        return currentWallet.accounts.some(account => account.index === accountIndex);
    });

    const isCreateDisabled = $derived(
        isLoading || !currentWallet || accountExists() || !accountName.trim()
    );

    async function handleLedgerSign(accountIndex: number): Promise<string> {
        const accounts = await ledgerController.generateAccounts(1, accountIndex);
        return JSON.stringify(accounts[0]);
    }

    async function handleLedgerSuccess(accountData: string) {
        try {
            const account: LedgerPublicAddress = JSON.parse(accountData);
            account.name = accountName;
            
            await addLedgerAccount($globalStore.selectedWallet, account);
            pop();
        } catch (err) {
            error = String(err);
        }
    }

    function handleLedgerError(errorMsg: string) {
        error = errorMsg;
    }

    async function handleCreate() {
        if (isCreateDisabled) return;
        
        if (isLedgerWallet) {
            showLedgerModal = true;
            return;
        }

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
    <NavBar title={$_(isLedgerWallet ? 'addAccount.ledger.title' : 'addAccount.bip39.title')} />

    <main class="content">
        <h3 class="section-title">
            {$_(isLedgerWallet ? 'addAccount.ledger.description' : 'addAccount.bip39.description')}
        </h3>

        <SmartInput
            bind:value={accountName}
            disabled={isLoading}
            loading={isLoading}
            placeholder={$_(isLedgerWallet ? 'addAccount.ledger.namePlaceholder' : 'addAccount.bip39.namePlaceholder')}
            hide={false}
            showToggle={false}
            hasError={!!error}
        >
            {#snippet rightAction()}
                <button type="button" class="edit-button" aria-label={$_(isLedgerWallet ? 'addAccount.ledger.editName' : 'addAccount.bip39.editName')}>
                    <EditIcon />
                </button>
            {/snippet}
        </SmartInput>

        <Counter
            bind:value={accountIndex}
            disabled={isLoading}
            title={$_(isLedgerWallet ? 'addAccount.ledger.indexLabel' : 'addAccount.bip39.indexLabel')}
            min={1}
            max={255}
            decrementLabel={$_(isLedgerWallet ? 'addAccount.ledger.decrementCount' : 'addAccount.bip39.decrementCount')}
            incrementLabel={$_(isLedgerWallet ? 'addAccount.ledger.incrementCount' : 'addAccount.bip39.incrementCount')}
        />

        {#if accountExists()}
            <div class="warning-message">
                {$_(isLedgerWallet ? 'addAccount.ledger.accountExists' : 'addAccount.bip39.accountExists', { values: { index: accountIndex } })}
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
            {$_(isLedgerWallet ? 'addAccount.ledger.createButton' : 'addAccount.bip39.createButton')}
        </Button>
    </footer>
</div>

{#if currentChain && isLedgerWallet}
    <LedgerSignModal
        bind:show={showLedgerModal}
        chain={currentChain}
        accountIndex={accountIndex}
        signFunction={handleLedgerSign}
        onSuccess={handleLedgerSuccess}
        onError={handleLedgerError}
    />
{/if}

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
