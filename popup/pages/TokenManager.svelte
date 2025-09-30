<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import NavBar from '../components/NavBar.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import SearchIcon from '../components/icons/Search.svelte';
    import PlusIcon from '../components/icons/Plus.svelte';
    import TokenToggleItem from '../components/TokenToggle.svelte';
    import { setGlobalState } from 'popup/background/wallet';

    let searchTerm = $state('');

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    let tokens = $derived(currentWallet?.tokens || []);

    const filteredTokens = $derived(() => {
        if (!searchTerm) {
            return tokens;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return tokens.filter(
            (token) =>
                token.name.toLowerCase().includes(lowercasedFilter) ||
                token.symbol.toLowerCase().includes(lowercasedFilter)
        );
    });

    function handleTokenVisibilityChange(tokenAddr: string, newVisibility: boolean) {
        const tokenIndex = tokens.findIndex(t => t.addr === tokenAddr);
        if (tokenIndex !== -1) {
            tokens[tokenIndex].default_ = newVisibility;
            tokens = [...tokens];
            
            const wallet = $globalStore.wallets[$globalStore.selectedWallet];
            if (wallet) {
                wallet.tokens = tokens;
                globalStore.update(s => ({ ...s }));
                setGlobalState();
            }
        }
    }
</script>

<div class="page-container">
    <NavBar title={$_('tokenManager.title', { default: 'Tokens' })} />

    <div class="search-container">
        <SmartInput
            bind:value={searchTerm}
            placeholder={$_('tokenManager.searchPlaceholder')}
            showToggle={false}
        >
            {#snippet leftIcon()}
                <SearchIcon />
            {/snippet}
            {#snippet rightAction()}
                <button class="add-button">
                    <PlusIcon />
                </button>
            {/snippet}
        </SmartInput>
    </div>

    <div class="token-list-container">
        {#each filteredTokens() as token}
            <TokenToggleItem
                {token}
                visible={token.default_}
                onchange={(e) => handleTokenVisibilityChange(token.addr, Boolean((e as CustomEvent).detail))}
            />
        {/each}
    </div>
</div>

<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--color-neutral-background-base);
        padding: 0 16px;
        box-sizing: border-box;
    }

    .search-container {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 24px;
        margin-bottom: 24px;
    }

    .add-button {
        width: 30px;
        height: 30px;
        background: var(--color-cards-regular-border-default);
        border-radius: 8px;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;

        :global(svg > path) {
            stroke: var(--color-content-icon-primary);
        }

        &:hover {
            background: var(--color-cards-regular-border-hover);
        }
    }

    .token-list-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
        padding-bottom: 24px;
    }
</style>
