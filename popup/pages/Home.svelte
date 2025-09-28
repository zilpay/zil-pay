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

    const fakeTokens = [
        {
            symbol: 'ZIL',
            balance: '9.6855K',
            convertedBalance: 'BTC 0.0010888',
            iconSrc: 'https://static.debank.com/image/token/logo_url/zil/b8b4c09d6a3a6d25326555513cbe3e36.png'
        },
        {
            symbol: 'ETH',
            balance: '9.6855K',
            convertedBalance: 'BTC 0.0010888',
            iconSrc: 'https://static.debank.com/image/token/logo_url/eth/935ae4c4d1d12d59a59409263a95996f.png'
        },
        {
            symbol: 'BNB',
            balance: '9.6855K',
            convertedBalance: 'BTC 0.0010888',
            iconSrc: 'https://static.debank.com/image/token/logo_url/bnb/598a96d22239644771f543a9b2a472c4.png'
        },
        {
            symbol: 'ZIL',
            balance: '9.6855K',
            convertedBalance: 'BTC 0.0010888',
            iconSrc: 'https://static.debank.com/image/token/logo_url/zil/b8b4c09d6a3a6d25326555513cbe3e36.png'
        },
        {
            symbol: 'ZIL',
            balance: '9.6855K',
            convertedBalance: 'BTC 0.0010888',
            iconSrc: 'https://static.debank.com/image/token/logo_url/zil/b8b4c09d6a3a6d25326555513cbe3e36.png'
        },
        {
            symbol: 'BNB',
            balance: '9.6855K',
            convertedBalance: 'BTC 0.0010888',
            iconSrc: 'https://static.debank.com/image/token/logo_url/bnb/598a96d22239644771f543a9b2a472c4.png'
        }
    ];

    let tokenViewMode = $state('grid');
    let hideBalance = $state(false);

    const currentChain = $derived(getAccountChain($globalStore.selectedWallet));
    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const currentAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount]);

    function handleAccountClick() {
        push('/account-details');
    }

    function handleUnlockWallet() {}

    function toggleViewMode() {
        tokenViewMode = tokenViewMode === 'grid' ? 'row' : 'grid';
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
                    <Button onclick={handleUnlockWallet} class="unlock-button-pink">
                        Unlock Wallet
                        <UpRightIcon />
                    </Button>
                    <Button onclick={handleUnlockWallet} class="unlock-button-purple">
                        Unlock Wallet
                        <DownRightIcon />
                    </Button>
                </div>
            </div>

            <div class="tokens-section">
                <div class="tokens-header">
                    <div class="tokens-title-section">
                        <h2 class="tokens-title">Tokens</h2>
                        <button class="control-button" onclick={() => hideBalance = !hideBalance}>
                            {#if hideBalance}
                                <HideIcon />
                            {:else}
                                <EyeIcon />
                            {/if}
                        </button>
                    </div>
                    <div class="view-controls">
                        <button class="control-button" onclick={toggleViewMode}>
                            {#if tokenViewMode === 'grid'}
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

                <div class="tokens-grid">
                    {#each fakeTokens as token}
                        <TokenCard
                            symbol={token.symbol}
                            balance={hideBalance ? '******' : token.balance}
                            convertedBalance={hideBalance ? '************' : token.convertedBalance}
                            imageUrl={token.iconSrc}
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
        background: var(--color-neutral-background-base);
        box-sizing: border-box;
    }

    .content-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        padding: 0 16px;
        gap: 20px;
        overflow-y: auto;
    }

    .account-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
        flex-shrink: 0;
        padding-top: 16px;
    }

    .actions-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    .actions-row :global(.unlock-button-pink) {
        background-color: var(--color-button-regular-primary-default);
        color: var(--color-content-text-primary);
        
        &:hover:not(:disabled) {
            background-color: var(--color-button-regular-primary-hover);
        }
        &:active:not(:disabled) {
            background-color: var(--color-button-regular-primary-pressed);
        }
    }

    .actions-row :global(.unlock-button-purple) {
        background-color: #ac59ff;
        color: var(--color-content-text-primary);
        
        &:hover:not(:disabled) {
            background-color: #9a4eeb;
        }
        &:active:not(:disabled) {
            background-color: #8742d8;
        }
    }

    .actions-row :global(button) {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        height: 44px;
        font-size: var(--font-size-medium);
        font-weight: 600;
        border-radius: 12px;
    }

    .actions-row :global(svg) {
        width: 16px;
        height: 16px;
    }

    .tokens-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    .tokens-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-shrink: 0;
    }

    .tokens-title-section {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .tokens-title {
        font-size: var(--font-size-xl);
        font-weight: 700;
        color: var(--color-content-text-inverted);
        margin: 0;
    }

    .view-controls {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .control-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 6px;
        border-radius: 50%;
        color: var(--color-content-icon-secondary);
        transition: all 0.2s ease;

        &:hover {
            background-color: var(--color-button-regular-quaternary-hover);
            color: var(--color-content-text-inverted);
        }

        :global(svg) {
            width: 20px;
            height: 20px;
        }
    }

    .tokens-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        flex: 1;
        align-content: start;
        padding-bottom: 16px;
    }
</style>
