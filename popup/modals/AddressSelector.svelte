<script lang="ts">
    import type { WalletAddressInfo } from 'types/wallet';
    import { _ } from 'popup/i18n';
    import SmartInput from '../components/SmartInput.svelte';
    import SearchIcon from '../components/icons/Search.svelte';
    import Jazzicon from '../components/Jazzicon.svelte';
    import { truncate } from 'popup/mixins/address';

    let {
        addresses = [],
        currentAddress = '',
        onSelect
    }: {
        addresses: WalletAddressInfo[];
        currentAddress: string;
        onSelect: (address: string) => void;
    } = $props();

    let searchTerm = $state('');

    const groupedAddresses = $derived(() => {
        const groups = new Map<string, WalletAddressInfo[]>();
        
        addresses.forEach(addr => {
            const key = addr.walletName || 'My accounts';
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(addr);
        });
        
        return Array.from(groups.entries());
    });

    const filteredGroups = $derived(() => {
        if (!searchTerm) return groupedAddresses();
        
        const term = searchTerm.toLowerCase();
        return groupedAddresses()
            .map(([walletName, addrs]) => [
                walletName,
                addrs.filter(addr => 
                    addr.accountName?.toLowerCase().includes(term) ||
                    addr.addr.toLowerCase().includes(term)
                )
            ])
            .filter(([_, addrs]) => (addrs as WalletAddressInfo[]).length > 0) as [string, WalletAddressInfo[]][];
    });

    function handleSelect(address: string) {
        onSelect(address);
    }
</script>

<div class="address-selector-container">
    <div class="search-section">
        <SmartInput
            bind:value={searchTerm}
            placeholder={$_('addressSelector.searchPlaceholder')}
            showToggle={false}
            autofocus={true}
        >
            {#snippet leftIcon()}
                <SearchIcon />
            {/snippet}
        </SmartInput>
    </div>

    <div class="addresses-list">
        {#each filteredGroups() as [walletName, addrs] (walletName)}
            <div class="address-group">
                <h3 class="group-title">{walletName}</h3>
                <div class="group-addresses">
                    {#each addrs as addr (addr.addr)}
                        <button
                            class="address-item"
                            class:current={addr.addr.toLowerCase() === currentAddress.toLowerCase()}
                            onclick={() => handleSelect(addr.addr)}
                        >
                            <div class="address-avatar">
                                <Jazzicon seed={addr.addr} diameter={48} />
                            </div>
                            <div class="address-info">
                                <div class="address-name">{addr.accountName}</div>
                                <div class="address-value">{truncate(addr.addr, 6, 6)}</div>
                            </div>
                            <div class="address-tags">
                                {#if addr.addr.toLowerCase() === currentAddress.toLowerCase()}
                                    <span class="tag tag-sender">{$_('addressSelector.sender')}</span>
                                {/if}
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
    .address-selector-container {
        display: flex;
        flex-direction: column;
        height: 450px;
        max-height: 60vh;
    }

    .search-section {
        padding: 24px 24px 16px;
        flex-shrink: 0;
    }

    .addresses-list {
        flex: 1;
        overflow-y: auto;
        padding: 0 24px 24px;
        min-height: 0;
    }

    .address-group {
        margin-bottom: 24px;

        &:last-child {
            margin-bottom: 0;
        }
    }

    .group-title {
        color: var(--color-content-text-inverted);
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        margin: 0 0 16px 0;
    }

    .group-addresses {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .address-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px;
        background: var(--color-cards-regular-base-default);
        border: 1px solid var(--color-cards-regular-border-default);
        border-radius: 12px;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;

        &:hover:not(.current) {
            border-color: var(--color-cards-regular-border-hover);
            background: var(--color-cards-regular-base-hover);
        }

        &:active:not(.current) {
            transform: scale(0.98);
        }

        &.current {
            background: var(--color-cards-regular-base-selected);
            border-color: var(--color-neutral-tag-purple-border);
            cursor: default;
        }
    }

    .address-avatar {
        flex-shrink: 0;
    }

    .address-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .address-name {
        color: var(--color-content-text-inverted);
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .address-value {
        color: var(--color-content-text-secondary);
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
    }

    .address-tags {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
    }

    .tag-sender {
        background: color-mix(in srgb, var(--color-neutral-tag-purple-fg) 12%, transparent);
        border: 1px solid var(--color-neutral-tag-purple-border);
        color: var(--color-neutral-tag-purple-text);
    }

    .addresses-list::-webkit-scrollbar {
        width: 6px;
    }

    .addresses-list::-webkit-scrollbar-track {
        background: transparent;
    }

    .addresses-list::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--color-content-text-secondary) 30%, transparent);
        border-radius: 3px;

        &:hover {
            background: color-mix(in srgb, var(--color-content-text-secondary) 50%, transparent);
        }
    }
</style>
