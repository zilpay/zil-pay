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
    import RowIcon from '../components/icons/Row.svelte';
    import FilterIcon from '../components/icons/Filter.svelte';
    import { setGlobalState } from 'popup/background/wallet';

    const hideBalance = $derived($globalStore.hideBalance);
    const tokensRow = $derived($globalStore.tokensRow);
    const currentChain = $derived(getAccountChain($globalStore.selectedWallet));
    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const currentAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount]);
    const tokens = $derived(currentWallet?.tokens || []);

    function handleAccountClick() {
        push('/account-details');
    }

    function handleSend() {}
    function handleReceive() {}

    async function toggleViewMode() {
        console.log(tokensRow);
        globalStore.set({
            ...$globalStore,
            tokensRow: !$globalStore.tokensRow,
        });

        await setGlobalState();
    }

    async function toggleHideBalance() {
        globalStore.set({
            ...$globalStore,
            hideBalance: !$globalStore.hideBalance,
        });

        await setGlobalState();
    }

    function handleManageTokens() {
        push('/manage-tokens');
    }
</script>

<div class="home-container">
    <Header
        showNetworkButton={true}
        networkImageSrc={viewChain({
            network: currentChain,
            theme: $globalStore.appearances
        })}
        networkImageAlt={currentChain?.name || 'Network'}
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
                    <Button onclick={handleSend} variant="primary" height ={40}>
                        {$_('home.send')}
                        <UpRightIcon class="rightup"/>
                    </Button>
                    <Button onclick={handleReceive} variant="secondary" height ={40}>
                        {$_('home.receive')}
                        <DownRightIcon class="rightdown" />
                    </Button>
                </div>
            </div>

            <div class="tokens-area">
                <div class="tokens-header">
                    <div class="tokens-title-section">
                        <button class="control-button" onclick={toggleHideBalance}>
                            {#if hideBalance}
                                <HideIcon />
                            {:else}
                                <EyeIcon />
                            {/if}
                        </button>
                    </div>
                    <div class="view-controls">
                        <button class="control-button" onclick={toggleViewMode}>
                            {#if !tokensRow}
                                <GridIcon />
                            {:else}
                                <RowIcon />
                            {/if}
                        </button>
                        <button class="control-button" onclick={handleManageTokens}>
                            <FilterIcon />
                        </button>
                    </div>
                </div>

                <div class="tokens-grid" class:row-view={tokensRow}>
                    {#each tokens as token, index (index)}
                        <TokenCard
                            token={token}
                            tokensRow={tokensRow}
                            account={currentAccount}
                            hide={hideBalance }
                        />
                    {/each}
                </div>
            </div>
        {/if}
    </main>

    <BottomTabs />
</div>

<style lang="scss">
    .home-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100%;
        max-width: var(--max-content-width);
        margin: 0 auto;
        background: var(--color-neutral-background-base);
        box-sizing: border-box;
        overflow: hidden;
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
        padding: 20px var(--padding-side) 24px var(--padding-side);
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
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
        gap: 12px;
        align-content: start;
        padding-bottom: 16px;
        overflow-y: auto;
    }

    .tokens-grid.row-view {
        grid-template-columns: 1fr;
    }
</style>
