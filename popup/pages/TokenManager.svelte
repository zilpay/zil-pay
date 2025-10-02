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
    let loading = $state(false);
    let searchError = $state<string | null>(null);
    let deletedTokens = $state<IFTokenState[]>([]);

    const DELETED_TOKENS_KEY_PREFIX = 'deleted_tokens_';
    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const tokens = $derived(currentWallet?.tokens || []);

    function getDeletedTokens(walletId: string): IFTokenState[] {
        const key = `${DELETED_TOKENS_KEY_PREFIX}${walletId}`;
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to parse deleted tokens from LocalStorage', e);
            return [];
        }
    }

    function saveDeletedTokens(walletId: string, tokens: IFTokenState[]) {
        const key = `${DELETED_TOKENS_KEY_PREFIX}${walletId}`;
        try {
            localStorage.setItem(key, JSON.stringify(tokens));
        } catch (e) {
            console.error('Failed to save deleted tokens to LocalStorage', e);
        }
    }

    $effect(() => {
        if (currentWallet?.uuid) {
            deletedTokens = getDeletedTokens(currentWallet.uuid);
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

    function handleTokenToggle(token: IFTokenState | null, isEnabled: boolean) {
        const walletIndex = $globalStore.selectedWallet;
        const originalWallet = $globalStore.wallets[walletIndex];

        if (!originalWallet || !token) return;

        const tokenAddress = token.addr.toLowerCase();
        const activeTokenIndex = originalWallet.tokens.findIndex(t => t.addr.toLowerCase() === tokenAddress);
        
        let newTokens: IFTokenState[];

        if (activeTokenIndex !== -1) {
            if (token.native || isEnabled) return;

            const removedToken = originalWallet.tokens[activeTokenIndex];
            newTokens = originalWallet.tokens.filter((_, index) => index !== activeTokenIndex);
            
            const currentDeleted = getDeletedTokens(originalWallet.uuid);
            saveDeletedTokens(originalWallet.uuid, [...currentDeleted, removedToken]);
            deletedTokens = getDeletedTokens(originalWallet.uuid);
        } else if (isEnabled) {
            newTokens = [...originalWallet.tokens, token];

            const updatedDeleted = deletedTokens.filter(t => t.addr.toLowerCase() !== tokenAddress);
            saveDeletedTokens(originalWallet.uuid, updatedDeleted);
            deletedTokens = updatedDeleted;
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
                <span class="section-label">{$_('tokenManager.deletedTokens')}</span>
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

    .section-label {
        font-size: var(--font-size-medium);
        color: var(--color-content-text-secondary);
        font-weight: 500;
        padding: 0 4px;
    }
</style>
