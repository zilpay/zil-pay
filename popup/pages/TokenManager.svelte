<script lang="ts">
    import type { IFTokenState } from 'background/storage';
    import { onMount } from 'svelte';
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import NavBar from '../components/NavBar.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import SearchIcon from '../components/icons/Search.svelte';
    import TokenToggleItem from '../components/TokenToggle.svelte';
    import { setGlobalState } from 'popup/background/wallet';
    import { fetchFTMeta } from 'popup/background/provider';
    import { tokensAutoHints } from 'popup/background/token';

    let searchTerm = $state('');
    let foundToken = $state<IFTokenState | null>(null);
    let loading = $state(false);
    let searchError = $state<string | null>(null);
    let deletedTokens = $state<IFTokenState[]>([]);
    let autoHintedTokens = $state<IFTokenState[]>([]);

    const DELETED_TOKENS_KEY = 'deleted_tokens_cache';
    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const currentAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount]);
    const currentChainHash = $derived(currentAccount?.chainHash ?? -1);
    const allTokens = $derived(currentWallet?.tokens || []);
    
    const tokens = $derived(allTokens.filter(t => t.chainHash === currentChainHash));

    type DeletedTokensCache = Record<number, IFTokenState[]>;

    function getDeletedTokensCache(): DeletedTokensCache {
        try {
            const stored = localStorage.getItem(DELETED_TOKENS_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    }

    function saveDeletedTokensCache(cache: DeletedTokensCache) {
        try {
            localStorage.setItem(DELETED_TOKENS_KEY, JSON.stringify(cache));
        } catch (e) {
            //
        }
    }

    function getDeletedTokensForChain(chainHash: number): IFTokenState[] {
        const cache = getDeletedTokensCache();
        return cache[chainHash] || [];
    }

    function saveDeletedTokensForChain(chainHash: number, tokens: IFTokenState[]) {
        const cache = getDeletedTokensCache();
        cache[chainHash] = tokens;
        saveDeletedTokensCache(cache);
    }

    function clearDeletedTokens() {
        if (currentChainHash === -1) return;
        saveDeletedTokensForChain(currentChainHash, []);
        deletedTokens = [];
    }

    $effect(() => {
        if (currentChainHash !== -1) {
            deletedTokens = getDeletedTokensForChain(currentChainHash);
        } else {
            deletedTokens = [];
        }
    });

    onMount(async () => {
        try {
            const hintedTokens = await tokensAutoHints();
            autoHintedTokens = hintedTokens;
        } catch (e) {
            console.error('Failed to fetch auto-hinted tokens:', e);
        }
    });

    const isTokenAlreadyAdded = $derived((tokenToCheck: IFTokenState | null) => {
        if (!tokenToCheck || !currentWallet) return false;
        const lowerCaseAddr = tokenToCheck.addr.toLowerCase();
        return currentWallet.tokens.some(t => t.addr.toLowerCase() === lowerCaseAddr);
    });

    $effect(() => {
        const term = searchTerm.trim();
        foundToken = null;
        searchError = null;
        loading = false;

        if (term.startsWith('0x') || term.startsWith('zil1')) {
            const performSearch = async () => {
                loading = true;
                try {
                    foundToken = await fetchFTMeta($globalStore.selectedWallet, term);
                } catch (e) {
                    searchError = $_('tokenManager.errorFetching');
                    console.error(e);
                } finally {
                    loading = false;
                }
            };
            const timeoutId = setTimeout(performSearch, 500);
            return () => clearTimeout(timeoutId);
        }
    });

    const filteredTokens = $derived(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        
        if (!searchTerm || searchTerm.startsWith('0x') || searchTerm.startsWith('zil1')) {
            return {
                native: tokens.filter(t => t.native),
                user: tokens.filter(t => !t.native)
            };
        }

        const filtered = tokens.filter(
            (token) =>
                token.name.toLowerCase().includes(lowercasedFilter) ||
                token.symbol.toLowerCase().includes(lowercasedFilter)
        );

        return {
            native: filtered.filter(t => t.native),
            user: filtered.filter(t => !t.native)
        };
    });
    
    const filteredDeletedTokens = $derived(() => {
        if (!searchTerm || searchTerm.startsWith('0x') || searchTerm.startsWith('zil1')) {
            return deletedTokens;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return deletedTokens.filter(
            (token) =>
                token.name.toLowerCase().includes(lowercasedFilter) ||
                token.symbol.toLowerCase().includes(lowercasedFilter)
        );
    });

    const filteredAutoHintedTokens = $derived(() => {
        // Filter auto-hinted tokens for current chain
        const chainTokens = autoHintedTokens.filter(t => t.chainHash === currentChainHash);

        // Apply search filter
        let filtered = chainTokens;
        if (searchTerm && !searchTerm.startsWith('0x') && !searchTerm.startsWith('zil1')) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = chainTokens.filter(
                (token) =>
                    token.name.toLowerCase().includes(lowercasedFilter) ||
                    token.symbol.toLowerCase().includes(lowercasedFilter)
            );
        }

        // Separate into already-added and not-yet-added
        const alreadyAdded: IFTokenState[] = [];
        const notYetAdded: IFTokenState[] = [];

        filtered.forEach(token => {
            if (isTokenAlreadyAdded(token)) {
                alreadyAdded.push(token);
            } else {
                notYetAdded.push(token);
            }
        });

        return {
            alreadyAdded,
            notYetAdded
        };
    });

    function handleTokenToggle(token: IFTokenState | null, isEnabled: boolean) {
        const walletIndex = $globalStore.selectedWallet;
        const originalWallet = $globalStore.wallets[walletIndex];

        if (!originalWallet || !token || currentChainHash === -1) return;

        if (token.chainHash !== currentChainHash) {
            searchError = $_('tokenManager.wrongChain');
            return;
        }

        const tokenAddress = token.addr.toLowerCase();
        const activeTokenIndex = originalWallet.tokens.findIndex(t => t.addr.toLowerCase() === tokenAddress);
        
        let newTokens: IFTokenState[];

        if (activeTokenIndex !== -1) {
            if (token.native || isEnabled) return;

            const removedToken = originalWallet.tokens[activeTokenIndex];
            newTokens = originalWallet.tokens.filter((_, index) => index !== activeTokenIndex);
            
            const currentDeleted = getDeletedTokensForChain(currentChainHash);
            const updatedDeleted = currentDeleted.filter(t => 
                t.addr.toLowerCase() !== tokenAddress
            );
            updatedDeleted.push(removedToken);
            saveDeletedTokensForChain(currentChainHash, updatedDeleted);
            deletedTokens = getDeletedTokensForChain(currentChainHash);
        } else if (isEnabled) {
            newTokens = [...originalWallet.tokens, token];

            const currentDeleted = getDeletedTokensForChain(currentChainHash);
            const updatedDeleted = currentDeleted.filter(t => t.addr.toLowerCase() !== tokenAddress);
            saveDeletedTokensForChain(currentChainHash, updatedDeleted);
            deletedTokens = getDeletedTokensForChain(currentChainHash);
            foundToken = null;
        } else {
            return;
        }

        globalStore.update(state => {
            const newWallets = [...state.wallets];
            newWallets[walletIndex] = {
                ...originalWallet,
                tokens: newTokens
            };
            return {
                ...state,
                wallets: newWallets
            };
        });

        setGlobalState();
        searchTerm = '';
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
            {loading}
        >
            {#snippet leftIcon()}
                <SearchIcon />
            {/snippet}
        </SmartInput>
    </div>

    <div class="token-list-container">
        {#if searchError}
            <div class="status-message error">{searchError}</div>
        {:else if foundToken && !isTokenAlreadyAdded(foundToken)}
            <div class="token-group">
                <span class="section-label">{$_('tokenManager.foundTokenTitle')}</span>
                <TokenToggleItem
                    token={foundToken}
                    disabled={false}
                    value={false}
                    onchange={(e) => handleTokenToggle(foundToken, (e as CustomEvent).detail)}
                />
            </div>
        {/if}

        {#if filteredTokens().native.length > 0}
            <div class="token-group">
                <span class="section-label">{$_('tokenManager.defaultTokens')}</span>
                {#each filteredTokens().native as token (token.addr)}
                    <TokenToggleItem
                        {token}
                        disabled={token.native}
                        value={true}
                        onchange={(e) => handleTokenToggle(token, (e as CustomEvent).detail)}
                    />
                {/each}
            </div>
        {/if}

        {#if filteredAutoHintedTokens().alreadyAdded.length > 0}
            <div class="token-group">
                <span class="section-label">{$_('tokenManager.autoHintedCached')}</span>
                {#each filteredAutoHintedTokens().alreadyAdded as token (token.addr)}
                    <TokenToggleItem
                        {token}
                        disabled={false}
                        value={true}
                        onchange={(e) => handleTokenToggle(token, (e as CustomEvent).detail)}
                    />
                {/each}
            </div>
        {/if}

        {#if filteredAutoHintedTokens().notYetAdded.length > 0}
            <div class="token-group">
                <span class="section-label">{$_('tokenManager.autoHintedSuggested')}</span>
                {#each filteredAutoHintedTokens().notYetAdded as token (token.addr)}
                    <TokenToggleItem
                        {token}
                        disabled={false}
                        value={false}
                        onchange={(e) => handleTokenToggle(token, (e as CustomEvent).detail)}
                    />
                {/each}
            </div>
        {/if}

        {#if filteredTokens().user.length > 0}
            <div class="token-group">
                <span class="section-label">{$_('tokenManager.addedTokens')}</span>
                {#each filteredTokens().user as token (token.addr)}
                    <TokenToggleItem
                        {token}
                        disabled={false}
                        value={true}
                        onchange={(e) => handleTokenToggle(token, (e as CustomEvent).detail)}
                    />
                {/each}
            </div>
        {/if}

        {#if filteredDeletedTokens().length > 0}
            <div class="token-group">
                <div class="section-header">
                    <span class="section-label">{$_('tokenManager.deletedTokens')}</span>
                    <button class="clear-button" onclick={clearDeletedTokens}>
                        {$_('tokenManager.clearDeleted')}
                    </button>
                </div>
                {#each filteredDeletedTokens() as token (token.addr)}
                    <TokenToggleItem
                        {token}
                        disabled={false}
                        value={false}
                        onchange={(e) => handleTokenToggle(token, (e as CustomEvent).detail)}
                    />
                {/each}
            </div>
        {/if}
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
        flex-shrink: 0;
    }

    .token-list-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 24px;
        overflow-y: auto;
        padding-bottom: 24px;
        min-height: 0;
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

    .token-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 4px;
    }

    .section-label {
        font-size: var(--font-size-medium);
        color: var(--color-content-text-secondary);
        font-weight: 500;
        padding: 0 4px;
    }

    .clear-button {
        background: none;
        border: none;
        padding: 0;
        font-size: var(--font-size-medium);
        font-weight: 600;
        color: var(--color-content-text-pink);
        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover {
            opacity: 0.8;
        }
    }
</style>
