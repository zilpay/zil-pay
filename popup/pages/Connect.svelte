<script lang="ts">
    import { _ } from 'popup/i18n';
    import { currentParams } from 'popup/store/route';
    import globalStore from 'popup/store/global';
    import { push } from 'popup/router/navigation';
    import type { IWeb3ConnectionPermissions } from 'background/storage/connections';
    import type { ConnectParams } from 'types/connect';
    import { responseToConnect } from 'popup/background/connect';

    import AccountCard from '../components/AccountCard.svelte';
    import Button from '../components/Button.svelte';
    import Switch from '../components/Switch.svelte';
    import DAppInfo from '../components/DAppInfo.svelte';
    import DownIcon from '../components/icons/Down.svelte';
    import WarningIcon from '../components/icons/Warning.svelte';
    import CloseIcon from '../components/icons/Close.svelte';

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const accounts = $derived(currentWallet?.accounts ?? []);
    const confirmRequests = $derived(currentWallet?.confirm ?? []);
    const connectRequest = $derived(confirmRequests.find(c => c.connect !== undefined));
    const connectParams = $derived(connectRequest?.connect as ConnectParams | undefined);

    let selectedAccountsSet = $state<Set<number>>(new Set());
    let initializedSelection = $state(false);

    $effect(() => {
        if (!initializedSelection && accounts.length > 0) {
            selectedAccountsSet = new Set(accounts.map((_, index) => index));
            initializedSelection = true;
        }
    });

    let permissions = $state<IWeb3ConnectionPermissions>({
        signTransactions: true,
        signMessages: true,
        readChainData: true
    });

    let showAdvanced = $state(false);
    let isLoading = $state(false);
    let errorMessage = $state<string | null>(null);

    function dismissError() {
        errorMessage = null;
    }

    function toggleAdvanced() {
        showAdvanced = !showAdvanced;
    }

    function toggleAccount(index: number) {
        initializedSelection = true;

        const next = new Set(selectedAccountsSet);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        selectedAccountsSet = next;
    }

    function handleSessionError(e: unknown): boolean {
        if (String(e).includes('Session')) {
            if ($currentParams?.type === 'popup') {
                window.close();
            } else {
                push('/lock');
            }
            return true;
        }
        return false;
    }

    async function handleConnect() {
        if (selectedAccountsSet.size === 0 || isLoading) return;
        isLoading = true;
        try {
            if (connectRequest) {
                await responseToConnect(connectRequest.uuid, $globalStore.selectedWallet, true, permissions);
            }
        } catch (e) {
            if (!handleSessionError(e)) {
                errorMessage = String(e);
            }
        } finally {
            isLoading = false;
        }
    }

    async function handleCancel() {
        if (isLoading) return;
        isLoading = true;
        try {
            if (connectRequest) {
                await responseToConnect(connectRequest.uuid, $globalStore.selectedWallet, false, permissions);
            }
        } catch (e) {
            if (!handleSessionError(e)) {
                errorMessage = String(e);
            }
        } finally {
            isLoading = false;
        }
    }

    $effect(() => {
        if (!connectRequest) {
            if ($currentParams?.type === 'popup') {
                window.close();
            } else {
                push('/');
            }
        }
    });
</script>

<div class="page-container">
    <main class="content">
        {#if connectParams}
            <DAppInfo
                icon={connectParams.icon}
                title={connectParams.title}
                domain={connectParams.domain}
                message={$_('connect.request_connection')}
            />

            {#if errorMessage}
                <div class="error-banner" role="alert">
                    <div class="error-left">
                        <div class="error-icon">
                            <WarningIcon />
                        </div>
                        <div class="error-text">{errorMessage}</div>
                    </div>
                    <button class="error-close" onclick={dismissError} aria-label="Dismiss error">
                        <CloseIcon />
                    </button>
                </div>
            {/if}

            <section class="accounts-section">
                <h3 class="section-title">{$_('connect.select_accounts')}</h3>
                <div class="accounts-list">
                    {#each accounts as account, index (account.pubKey)}
                        <button class="account-item" type="button" onclick={() => toggleAccount(index)}>
                            <AccountCard
                                name={account.name}
                                address={account.addr}
                                selected={selectedAccountsSet.has(index)}
                            />
                        </button>
                    {/each}
                </div>
            </section>

            <section class="permissions-section">
                <button class="advanced-toggle" onclick={toggleAdvanced}>
                    <span class="advanced-text">{$_('connect.advanced_options')}</span>
                    <span class="arrow" class:rotated={showAdvanced}><DownIcon /></span>
                </button>

                {#if showAdvanced}
                    <div class="permissions-list">
                        <div class="permission-item">
                            <div class="permission-info">
                                <span class="permission-label">{$_('connect.permission.sign_transactions')}</span>
                                <span class="permission-description">{$_('connect.permission.sign_transactions_desc')}</span>
                            </div>
                            <Switch bind:checked={permissions.signTransactions} variant="default" />
                        </div>

                        <div class="permission-item">
                            <div class="permission-info">
                                <span class="permission-label">{$_('connect.permission.sign_messages')}</span>
                                <span class="permission-description">{$_('connect.permission.sign_messages_desc')}</span>
                            </div>
                            <Switch bind:checked={permissions.signMessages} variant="default" />
                        </div>

                        <div class="permission-item">
                            <div class="permission-info">
                                <span class="permission-label">{$_('connect.permission.read_chain')}</span>
                                <span class="permission-description">{$_('connect.permission.read_chain_desc')}</span>
                            </div>
                            <Switch bind:checked={permissions.readChainData} variant="default" />
                        </div>
                    </div>
                {/if}
            </section>
        {/if}
    </main>

    <footer class="footer">
        <div class="action-buttons">
            <Button variant="outline" onclick={handleCancel} disabled={isLoading}>
                {$_('common.cancel')}
            </Button>
            <Button variant="primary" onclick={handleConnect} disabled={isLoading || selectedAccountsSet.size === 0}>
                {$_('connect.connect')}
            </Button>
        </div>
    </footer>
</div>

<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--color-neutral-background-base);
        box-sizing: border-box;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: var(--padding-side);
        padding-top: 12px;
        overflow-y: auto;
    }

    .error-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px;
        background: var(--color-error-background);
        border: 1px solid var(--color-negative-border-primary);
        border-radius: 12px;
    }

    .error-left {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        flex: 1;
    }

    .error-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;

        :global(svg) {
            width: 20px;
            height: 20px;
            color: var(--color-negative-border-primary);
        }
    }

    .error-text {
        color: var(--color-error-text);
        font-size: 14px;
        line-height: 20px;
        word-break: break-word;
    }

    .error-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: none;
        border: none;
        border-radius: 6px;
        color: var(--color-error-text);
        cursor: pointer;
        transition: background-color 0.2s ease;

        :global(svg) {
            width: 18px;
            height: 18px;
        }

        &:hover {
            background: color-mix(in srgb, var(--color-negative-border-primary) 20%, transparent);
        }
    }

    .accounts-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .section-title {
        font-size: var(--font-size-large);
        font-weight: 600;
        color: var(--color-content-text-inverted);
        margin: 0;
    }

    .accounts-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .account-item {
        all: unset;
        display: block;
        width: 100%;
        cursor: pointer;
        border-radius: 12px;
    }

    .account-item :global(.account-card) {
        width: 100%;
    }

    .permissions-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .advanced-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 12px 16px;
        background: var(--color-cards-regular-base-default);
        border: 1px solid var(--color-cards-regular-border-default);
        border-radius: 12px;
        cursor: pointer;
        transition: background-color 0.2s ease, border-color 0.2s ease;
        color: var(--color-content-text-inverted);
    }

    .advanced-toggle:hover {
        background: var(--color-cards-regular-base-selected-hover);
        border-color: var(--color-cards-regular-border-hover);
    }

    .advanced-text {
        font-size: var(--font-size-medium);
        font-weight: 600;
        color: var(--color-content-text-inverted);
    }

    .arrow {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
        color: var(--color-content-icon-secondary);
    }

    .arrow.rotated {
        transform: rotate(180deg);
    }

    .permissions-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        background: var(--color-cards-regular-base-default);
        border: 1px solid var(--color-cards-regular-border-default);
        border-radius: 12px;
    }

    .permission-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 0;
        border-bottom: 1px solid var(--color-cards-regular-border-default);
    }

    .permission-item:last-child {
        border-bottom: none;
    }

    .permission-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 0;
    }

    .permission-label {
        font-size: var(--font-size-large);
        font-weight: 600;
        color: var(--color-content-text-inverted);
    }

    .permission-description {
        font-size: var(--font-size-medium);
        color: var(--color-content-text-secondary);
        line-height: 1.4;
    }

    .footer {
        padding: 16px var(--padding-side) calc(16px + env(safe-area-inset-bottom));
        background: var(--color-neutral-background-base);
        border-top: 1px solid var(--color-cards-regular-border-default);
    }

    .action-buttons {
        display: flex;
        gap: 8px;
    }

    .action-buttons :global(button) {
        flex: 1;
        max-height: 48px;
    }
</style>
