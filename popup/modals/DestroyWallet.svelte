<script lang="ts">
    import { _ } from 'popup/i18n';
    import { destroyWallet } from 'popup/background/wallet';
    import globalStore from 'popup/store/global';
    import SmartInput from '../components/SmartInput.svelte';
    import Button from '../components/Button.svelte';
    import WarningIcon from '../components/icons/Warning.svelte';
    import { push } from 'popup/router/navigation';
    import { WalletTypes } from 'config/wallet';

    let password = $state('');
    let isLoading = $state(false);
    let error = $state<string | null>(null);

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);

    async function handleDelete(e: SubmitEvent) {
        e.preventDefault();
        if (isLoading) return;

        isLoading = true;
        error = null;

        const walletIndexToDelete = $globalStore.selectedWallet;

        try {
            await destroyWallet(password, walletIndexToDelete);

            if ($globalStore.wallets.length > 0) {
                push("/lock");
            } else {
                window.close();
            }
        } catch (err) {
            error = String(err);
        } finally {
            isLoading = false;
        }
    }

    $effect(() => {
        if (password) {
            error = null;
        }
    });
</script>

<div class="delete-wallet-modal">
    <div class="warning-banner">
        <div class="warning-icon">
            <WarningIcon />
        </div>
        <p class="warning-text">
            {$_('deleteWallet.warning')}
        </p>
    </div>

    <p class="description">
        {$_('deleteWallet.description')}
    </p>

    <form class="form" onsubmit={handleDelete}>
        {#if currentWallet.walletType == WalletTypes.SecretKey || currentWallet.walletType == WalletTypes.SecretPhrase}
            <SmartInput
                bind:value={password}
                placeholder={$_('deleteWallet.passwordPlaceholder')}
                disabled={isLoading}
                hasError={!!error}
                errorMessage={error || ''}
                loading={isLoading}
                autofocus
                hide
            />
        {/if}
        <Button
      type="submit"
            variant="outline"
            loading={isLoading}
        >
            {$_('deleteWallet.confirmButton')}
        </Button>
    </form>
</div>

<style lang="scss">
    .delete-wallet-modal {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 16px;
    }

    .warning-banner {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 12px;
        background: color-mix(in srgb, var(--color-notification-negative-border) 5%, transparent);
        border-radius: 16px;
        border: 1px solid var(--color-notification-negative-border);
    }

    .warning-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        color: var(--color-notification-negative-content);

        :global(svg) {
            width: 100%;
            height: 100%;
        }
    }

    .warning-text {
        flex: 1;
        margin: 0;
        color: var(--color-content-text-inverted);
        font-size: 12px;
        font-weight: 400;
        line-height: 16px;
    }

    .description {
        margin: 0;
        color: var(--color-content-text-inverted);
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
</style>
