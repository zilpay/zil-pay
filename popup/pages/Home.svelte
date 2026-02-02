<script lang="ts">
    import globalStore from 'popup/store/global';
    import { viewChain } from 'lib/popup/url';
    import Header from '../components/Header.svelte';
    import AddressCopy from '../components/AddressCopy.svelte';
    import { getAccountChain } from 'popup/mixins/chains';
    import { push } from '../router/navigation';
    import Button from '../components/Button.svelte';
    import { _ } from 'popup/i18n';
    import TokenCard from '../components/TokenCard.svelte';
    import BottomTabs from '../components/BottomTabs.svelte';
    import UpRightIcon from '../components/icons/UpRight.svelte';
    import DownRightIcon from '../components/icons/DownRight.svelte';
    import HideIcon from '../components/icons/Hide.svelte';
    import EyeIcon from '../components/icons/Eye.svelte';
    import GridIcon from '../components/icons/Grid.svelte';
    import CloseIcon from '../components/icons/Close.svelte';
    import RowIcon from '../components/icons/Row.svelte';
    import FilterIcon from '../components/icons/Filter.svelte';
    import { setGlobalState } from 'popup/background/wallet';
    import { ftBalanceUpdate } from 'popup/background/provider';
    import { getChainTokens } from 'popup/filters/tokens';
    import { ftUpdateRates } from 'popup/background/token';

    const hideBalance = $derived($globalStore.hideBalance);
    const tokensRow = $derived($globalStore.tokensRow);
    const currentChain = $derived(getAccountChain($globalStore.selectedWallet));
    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const currentAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount]);
    const tokens = $derived(getChainTokens(currentWallet?.tokens ?? [], currentAccount));

    let tokensloading = $state(false);
    let error = $state<string | null>(null);
    let mounted = $state(false);

    $effect(() => {
        if (!mounted) {
            mounted = true;
            handleTokensUpdate();
        }
    });

    function dismissError() {
        error = null;
    }

    function handleAccountClick() {
        push('/accounts');
    }

    function handleSend(addr?: string) {
        const path = addr ? `/transfer?token=${addr}` : '/transfer';
        push(path);
    }

    function handleReceive() {
        push("/receive");
    }

    async function toggleViewMode() {
        globalStore.update(store => ({
            ...store,
            tokensRow: !store.tokensRow
        }));
        await setGlobalState();
    }

    async function toggleHideBalance() {
        globalStore.update(store => ({
            ...store,
            hideBalance: !store.hideBalance
        }));
        await setGlobalState();
    }

    function handleManageTokens() {
        push('/manage-tokens');
    }

    async function handleTokensUpdate() {
        tokensloading = true;
        error = null;
        
        try {
            await ftBalanceUpdate($globalStore.selectedWallet);

            if (!currentChain?.testnet) {
                await ftUpdateRates($globalStore.selectedWallet);
            }
        } catch (e) {
            console.error("ftUpdateRates", e);
            error = String(e);
        } finally {
            tokensloading = false;
        }

    }
</script>

<div class="page-container">
    <Header
        showNetworkButton={true}
        networkImageSrc={viewChain({
            network: currentChain,
            theme: $globalStore.appearances
        })}
        isTestnet={Boolean(currentChain?.testnet)}
        refreshDisabled={tokensloading}
        networkImageAlt={currentChain?.name}
        onRefresh={handleTokensUpdate}
    />
    <main class="content-area">
        {#if currentAccount?.addr}
            <div class="account-section">
                <AddressCopy
                    name={currentAccount.name}
                    address={currentAccount.addr}
                    onclick={handleAccountClick}
                />
                <div class="actions-row">
                    <Button onclick={() => handleSend()} variant="primary" height={40}>
                        {$_('home.send')}
                        <UpRightIcon class="rightup"/>
                    </Button>
                    <Button onclick={handleReceive} variant="secondary" height={40}>
                        {$_('home.receive')}
                        <DownRightIcon class="rightdown" />
                    </Button>
                </div>
            </div>
            <div class="tokens-area">
                <div class="tokens-header">
                    <div class="tokens-title-section">
                        <button class="control-button" onclick={toggleHideBalance} type="button">
                            {#if hideBalance}
                                <HideIcon />
                            {:else}
                                <EyeIcon />
                            {/if}
                        </button>
                    </div>
                    <div class="view-controls">
                        {#if tokens.length > 1}
                            <button class="control-button" onclick={toggleViewMode} type="button">
                                {#if !tokensRow}
                                    <GridIcon />
                                {:else}
                                    <RowIcon />
                                {/if}
                            </button>
                        {/if}
                        <button class="control-button" onclick={handleManageTokens} type="button">
                            <FilterIcon />
                        </button>
                    </div>
                </div>
                {#if error}
                    <div class="error-banner">
                        <div class="error-header">
                            <span class="error-title">{$_('home.error.title')}</span>
                            <button class="error-close" onclick={dismissError} type="button" aria-label="Close error">
                                <CloseIcon />
                            </button>
                        </div>
                        <p class="error-message">{error}</p>
                    </div>
                {/if}
                <div class="tokens-grid" class:row-mode={tokensRow || tokens.length === 1}>
                    {#each tokens as token, index (index)}
                        <TokenCard
                            {token}
                            loading={tokensloading}
                            tokensRow={tokensRow || tokens.length === 1}
                            account={currentAccount}
                            hide={hideBalance}
                            onSelect={() => handleSend(token.addr)}
                        />
                    {/each}
                </div>
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
        width: 100%;
        max-width: var(--max-content-width);
        margin: 0 auto;
        background: var(--color-neutral-background-base);
        box-sizing: border-box;
        overflow: hidden;
        padding: 0;
    }

    .content-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    .account-section {
        display: flex;
        flex-direction: column;
        gap: 24px;
        flex-shrink: 0;
        padding: 0 var(--padding-side) 24px var(--padding-side);
    }

    .actions-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }

    :global(.rightup),
    :global(.rightdown) {
        width: 24px;
        height: 24px;
        :global(path) {
            stroke: var(--color-content-icon-primary);
        }
    }

    .tokens-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        background: var(--color-neutral-background-container);
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        padding: 8px var(--padding-side-min) 0 var(--padding-side-min);
    }

    .tokens-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-shrink: 0;
        padding-left: 8px;
        padding-right: 8px;
    }

    .tokens-title-section {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .view-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .control-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-button-regular-quaternary-default);
        border: 1px solid var(--color-neutral-border-default);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        color: var(--color-content-icon-inverted);
        transition: all 0.2s ease;
        &:hover {
            background-color: var(--color-button-regular-quaternary-hover);
        }
        :global(svg) {
            width: 24px;
            height: 24px;
        }
    }

    .tokens-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        padding-bottom: 16px;
        overflow-y: auto;

        &:not(.row-mode) {
            justify-content: flex-start;
            align-content: flex-start;
            margin: 0 auto;
            max-width: calc(148px * 2 + 12px);

            > :global(*) {
                flex: 0 0 148px;
                max-width: 148px;
            }
        }

        &.row-mode {
            flex-direction: column;
            flex-wrap: nowrap;

            > :global(*) {
                flex: 0 0 auto;
                width: 100%;
                max-width: 100%;
            }
        }
    }

    .error-banner {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        margin: 0 8px 12px 8px;
        background: var(--color-notification-negative-background);
        border: 1px solid var(--color-negative-border-primary);
        border-radius: 12px;
        flex-shrink: 0;
    }

    .error-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .error-title {
        color: var(--color-content-text-primary);
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
    }

    .error-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: none;
        border: none;
        color: var(--color-content-text-primary);
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        padding: 0;

        &:hover {
            background-color: color-mix(in srgb, var(--color-negative-border-primary) 20%, transparent);
        }

        :global(svg > path) {
            stroke: var(--color-content-text-inverted);
        }
    }

    .error-message {
        color: var(--color-content-text-inverted);
        font-size: 12px;
        line-height: 16px;
        margin: 0;
        word-break: break-word;
    }
</style>
