<script lang="ts">
    import type { IFTokenState } from 'background/storage';
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import NavBar from '../components/NavBar.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import SearchIcon from '../components/icons/Search.svelte';
    import TokenToggleItem from '../components/TokenToggle.svelte';
    import { setGlobalState } from 'popup/background/wallet';
    import { fetchFTMeta } from 'popup/background/provider';

    let searchTerm = $state('');
    let foundToken = $state<IFTokenState | null>(null);
    let isSearchingContract = $state(false);
    let searchError = $state<string | null>(null);

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const tokens = $derived(currentWallet?.tokens || []);

    const isTokenAlreadyAdded = $derived((tokenToCheck: IFTokenState | null) => {
        if (!tokenToCheck || !currentWallet) return false;
        const lowerCaseAddr = tokenToCheck.addr.toLowerCase();
        return currentWallet.tokens.some(t => t.addr.toLowerCase() === lowerCaseAddr);
    });

    $effect(() => {
        const term = searchTerm.trim();
        foundToken = null;
        searchError = null;
        isSearchingContract = false;

        if (term.startsWith('0x') || term.startsWith('zil1')) {
            const performSearch = async () => {
                isSearchingContract = true;
                try {
                    foundToken = await fetchFTMeta($globalStore.selectedWallet, term);
                } catch (e) {
                    searchError = $_('tokenManager.errorFetching');
                    console.error(e);
                } finally {
                    isSearchingContract = false;
                }
            };
            
            const timeoutId = setTimeout(performSearch, 500);
            return () => clearTimeout(timeoutId);
        }
    });

    const filteredTokens = $derived(() => {
        if (!searchTerm || searchTerm.startsWith('0x') || searchTerm.startsWith('zil1')) {
            return tokens;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return tokens.filter(
            (token) =>
                token.name.toLowerCase().includes(lowercasedFilter) ||
                token.symbol.toLowerCase().includes(lowercasedFilter)
        );
    });

    function handleTokenToggle(token: IFTokenState, isEnabled: boolean) {
        const wallet = $globalStore.wallets[$globalStore.selectedWallet];
        if (!wallet) return;

        const tokenAddress = token.addr.toLowerCase();
        const existingTokenIndex = wallet.tokens.findIndex(t => t.addr.toLowerCase() === tokenAddress);

        if (existingTokenIndex !== -1) {
            const isNative = wallet.tokens[existingTokenIndex].native;
            if (isNative) return;

            if (!isEnabled) {
                wallet.tokens.splice(existingTokenIndex, 1);
                globalStore.update(s => ({ ...s }));
                setGlobalState();
            }
        } else if (isEnabled) {
            wallet.tokens.push({ ...token, default_: true });
            globalStore.update(s => ({ ...s }));
            setGlobalState();
            foundToken = null;
        }

        searchTerm = "";
    }
</script>

<div class="page-container">
    <NavBar title={$_('tokenManager.title')} />

    <div class="search-container">
        <SmartInput
            bind:value={searchTerm}
            placeholder={$_('tokenManager.searchPlaceholder')}
            showToggle={false}
            autofocus
        >
            {#snippet leftIcon()}
                <SearchIcon />
            {/snippet}
        </SmartInput>
    </div>

    <div class="token-list-container">
        {#if isSearchingContract}
            <div class="status-message">{$_('tokenManager.searching')}...</div>
        {:else if searchError}
            <div class="status-message error">{searchError}</div>
        {:else if foundToken && !isTokenAlreadyAdded(foundToken)}
            <div class="found-token-section">
                <span class="section-label">{$_('tokenManager.foundTokenTitle')}</span>
                <TokenToggleItem
                    token={foundToken}
                    disabled={false}
                    value={false}
                    onchange={(e) => handleTokenToggle(foundToken, (e as CustomEvent).detail)}
                />
            </div>
        {/if}

        {#each filteredTokens() as token (token.addr)}
            <TokenToggleItem
                {token}
                disabled={token.native}
                value={token.default_}
                onchange={(e) => handleTokenToggle(token, (e as CustomEvent).detail)}
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
        padding: 0;
        box-sizing: border-box;
    }

    .search-container,
    .token-list-container {
        padding: 0 var(--padding-side, 20px);
    }

    .search-container {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 24px;
        margin-bottom: 24px;
    }

    .token-list-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
        padding-bottom: 24px;
    }

    .status-message {
        text-align: center;
        padding: 20px;
        color: var(--color-content-text-secondary);
        font-size: var(--font-size-large);

        &.error {
            color: var(--color-inputs-border-error);
        }
    }

    .found-token-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .section-label {
        font-size: var(--font-size-medium);
        color: var(--color-content-text-secondary);
        font-weight: 500;
        padding: 0 4px;
    }
</style>
