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
    import FastImg from '../components/FastImg.svelte';

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const accounts = $derived(currentWallet?.accounts ?? []);

    const confirmRequests = $derived(currentWallet?.confirm ?? []);
    const connectRequest = $derived(
        confirmRequests.find(c => c.connect !== undefined)
    );
    const connectParams = $derived(connectRequest?.connect as ConnectParams | undefined);

    let selectedAccountsSet = $state<Set<number>>(new Set());
    
    $effect(() => {
        selectedAccountsSet = new Set(accounts.map((_, index) => index));
    });

    let permissions = $state<IWeb3ConnectionPermissions>({
        signTransactions: true,
        signMessages: true,
        readChainData: true
    });

    let showAdvanced = $state(false);

    function toggleAdvanced() {
        showAdvanced = !showAdvanced;
    }

    async function handleConnect() {
        if (selectedAccountsSet.size === 0) {
            return;
        }

        if (connectRequest) {
            await responseToConnect(connectRequest.uuid, $globalStore.selectedWallet, true, permissions);
        }
    }

    async function handleCancel() {
        if (connectRequest) {
            await responseToConnect(connectRequest.uuid, $globalStore.selectedWallet, false, permissions);
        }
    }

    $effect(() => {
        if (!connectRequest) {
            if ($currentParams?.type === 'popup') {
                window.close();
            } else {
                push("/");
            }
        }
    });
</script>

<div class="page-container">
    <main class="content">
        {#if connectParams}
            <div class="site-info">
                <div class="site-header">
                    {#if connectParams.icon}
                        <div class="site-icon">
                            <FastImg src={connectParams.icon} alt={connectParams.title} />
                        </div>
                    {/if}
                    <div class="site-details">
                        <h2 class="site-title">{connectParams.title}</h2>
                        <p class="site-domain">{connectParams.domain}</p>
                    </div>
                </div>
                <div class="connection-message">
                    <p>{$_('connect.request_connection')}</p>
                </div>
            </div>

            <section class="accounts-section">
                <h3 class="section-title">{$_('connect.select_accounts')}</h3>
                <div class="accounts-list">
                    {#each accounts as account, index (account.pubKey)}
                        <div class="account-item">
                            <AccountCard
                                name={account.name}
                                address={account.addr}
                                selected={selectedAccountsSet.has(index)}
                            />
                        </div>
                    {/each}
                </div>
            </section>

            <section class="permissions-section">
                <button class="advanced-toggle" onclick={toggleAdvanced}>
                    <span>{$_('connect.advanced_options')}</span>
                    <span class="toggle-icon" class:expanded={showAdvanced}>▼</span>
                </button>

                {#if showAdvanced}
                    <div class="permissions-list">
                        <div class="permission-item">
                            <div class="permission-info">
                                <span class="permission-label">{$_('connect.permission.sign_transactions')}</span>
                                <span class="permission-description">{$_('connect.permission.sign_transactions_desc')}</span>
                            </div>
                            <Switch
                                bind:checked={permissions.signTransactions}
                                variant="default"
                            />
                        </div>

                        <div class="permission-item">
                            <div class="permission-info">
                                <span class="permission-label">{$_('connect.permission.sign_messages')}</span>
                                <span class="permission-description">{$_('connect.permission.sign_messages_desc')}</span>
                            </div>
                            <Switch
                                bind:checked={permissions.signMessages}
                                variant="default"
                            />
                        </div>

                        <div class="permission-item">
                            <div class="permission-info">
                                <span class="permission-label">{$_('connect.permission.read_chain')}</span>
                                <span class="permission-description">{$_('connect.permission.read_chain_desc')}</span>
                            </div>
                            <Switch
                                bind:checked={permissions.readChainData}
                                variant="default"
                            />
                        </div>
                    </div>
                {/if}
            </section>
        {/if}
    </main>

    <footer class="footer">
        <div class="action-buttons">
            <Button variant="outline" onclick={handleCancel}>
                {$_('common.cancel')}
            </Button>
            <Button
                variant="primary"
                onclick={handleConnect}
                disabled={selectedAccountsSet.size === 0}
            >
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
        padding: 0;
        box-sizing: border-box;
        padding: 0;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: var(--padding-side) 0;
        overflow-y: auto;
    }

    .site-info {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        background: var(--color-neutral-background-container);
        border: 1px solid var(--color-neutral-border-default);
        border-radius: 12px;
    }

    .site-header {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .site-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;

        :global(img) {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .site-details {
        flex: 1;
        min-width: 0;
    }

    .site-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-action-text-primary);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .site-domain {
        font-size: 14px;
        color: var(--color-action-text-secondary);
        margin: 4px 0 0 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .connection-message {
        padding-top: 8px;
        border-top: 1px solid var(--color-neutral-border-default);

        p {
            margin: 0;
            font-size: 14px;
            color: var(--color-action-text-secondary);
            line-height: 1.5;
        }
    }

    .accounts-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .section-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-action-text-primary);
        margin: 0;
    }

    .accounts-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .account-item {
        :global(.account-card) {
            width: 100%;
        }
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
        background: var(--color-neutral-background-container);
        border: 1px solid var(--color-neutral-border-default);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--color-action-text-primary);
        font-size: 14px;
        font-weight: 500;

        &:hover {
            background: var(--color-action-background-hover);
            border-color: var(--color-neutral-border-hover);
        }

        .toggle-icon {
            transition: transform 0.2s ease;
            font-size: 12px;
            color: var(--color-action-text-secondary);

            &.expanded {
                transform: rotate(180deg);
            }
        }
    }

    .permissions-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        background: var(--color-neutral-background-container);
        border: 1px solid var(--color-neutral-border-default);
        border-radius: 8px;
    }

    .permission-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 0;

        &:not(:last-child) {
            border-bottom: 1px solid var(--color-neutral-border-default);
        }
    }

    .permission-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 0;
    }

    .permission-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-action-text-primary);
    }

    .permission-description {
        font-size: 12px;
        color: var(--color-action-text-secondary);
        line-height: 1.4;
    }

    .footer {
        padding: var(--padding-side) 0;
        border-top: 1px solid var(--color-neutral-border-default);
        background: var(--color-neutral-background-base);
    }

    .action-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;

        :global(button) {
            width: 100%;
        }
    }
</style>
