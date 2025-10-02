<script lang="ts">
    import type { IAccountState, IFTokenState } from 'background/storage';
    import { _ } from 'popup/i18n';

    import Modal from '../components/Modal.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import TokenCard from '../components/TokenCard.svelte';
    import SearchIcon from '../components/icons/Search.svelte';

    let {
        show = $bindable(),
        tokens = [],
        account,
        selectedToken,
        onSelect
    }: {
        show: boolean;
        tokens: IFTokenState[];
        account: IAccountState;
        selectedToken: IFTokenState | undefined;
        onSelect: (token: IFTokenState) => void;
    } = $props();

    let searchTerm = $state('');

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

    function handleTokenSelect(token: IFTokenState) {
        onSelect(token);
        show = false;
    }
</script>

<Modal bind:show title={$_('receive.selectTokenTitle')}>
    <div class="token-selector-modal-content">
        <div class="search-container">
            <SmartInput
                bind:value={searchTerm}
                placeholder={$_('tokenManager.searchPlaceholder')}
                showToggle={false}
                autofocus={true}
            >
                {#snippet leftIcon()}
                    <SearchIcon />
                {/snippet}
            </SmartInput>
        </div>

        <div class="token-list">
            {#each filteredTokens() as token (token.addr)}
                <div 
                    class="token-item-wrapper" 
                    class:selected={selectedToken?.addr === token.addr}
                >
                    <TokenCard
                        {token}
                        {account}
                        hide={false}
                        tokensRow={true}
                        onSelect={() => handleTokenSelect(token)}
                    />
                </div>
            {/each}
        </div>
    </div>
</Modal>

<style lang="scss">
    .token-selector-modal-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .search-container {
        flex-shrink: 0;
    }

    .token-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 40vh;
        overflow-y: auto;
        padding-right: 4px;
    }

    .token-item-wrapper {
        border-radius: 12px;
        outline: 2px solid transparent;
        transition: outline-color 0.2s ease;
        
        &.selected {
            outline-color: var(--color-controls-selector-select);
        }

        :global(.token-card) {
            border: none;
            background-color: var(--color-neutral-background-container);
        }
    }
</style>
