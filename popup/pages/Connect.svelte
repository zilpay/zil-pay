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

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const accounts = $derived(currentWallet?.accounts ?? []);
    const confirmRequests = $derived(currentWallet?.confirm ?? []);
    const connectRequest = $derived(confirmRequests.find(c => c.connect !== undefined));
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
        if (selectedAccountsSet.size === 0) return;
        try {
            if (connectRequest) {
                await responseToConnect(connectRequest.uuid, $globalStore.selectedWallet, true, permissions);
            }
        } catch (e) {
            if (String(e).includes("Session")) {
                if ($currentParams?.type === 'popup') {
                    window.close();
                } else {
                    push('/lock');
                }
            }
        }
    }

    async function handleCancel() {
        try {
            if (connectRequest) {
                await responseToConnect(connectRequest.uuid, $globalStore.selectedWallet, false, permissions);
            }
        } catch (e) {
            if (String(e).includes("Session")) {
                if ($currentParams?.type === 'popup') {
                    window.close();
                } else {
                    push('/lock');
                }
            }
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
            <Button variant="outline" onclick={handleCancel}>
                {$_('common.cancel')}
            </Button>
            <Button variant="primary" onclick={handleConnect} disabled={selectedAccountsSet.size === 0}>
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
