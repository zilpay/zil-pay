<script lang="ts">
    import { _ } from 'popup/i18n';
    import { getChains, type ChainData } from 'popup/mixins/chains';
    import { viewChain } from 'lib/popup/url';
    import { hashChainConfig } from 'lib/utils/hashing';
    import globalStore from 'popup/store/global';
    import type { IChainConfigState } from 'background/storage';
    import { setGlobalState } from 'popup/background/wallet';

    import NavBar from '../components/NavBar.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import SearchIcon from '../components/icons/Search.svelte';
    import EditIcon from '../components/icons/Edit.svelte';
    import OptionCard from '../components/OptionCard.svelte';

    type DisplayChain = IChainConfigState & { 
        isTestnet: boolean;
        isAdded: boolean;
        hash: number;
        iconUrl: string;
    };

    let searchTerm = $state('');
    let allAvailableChains = $state<ChainData>({ mainnet: [], testnet: [] });

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const currentAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount]);
    const currentAccountChainHash = $derived(currentAccount?.chainHash ?? -1);
    const addedChains = $derived($globalStore.chains);
    const currentTheme = $derived($globalStore.appearances);

    const chainHashMap = $derived(() => {
        const map = new Map<string, boolean>();
        addedChains.forEach(chain => {
            map.set(chain.chainIds.join(), true);
        });
        return map;
    });

    const allChains = $derived(() => {
        const added = addedChains.map<DisplayChain>(chain => {
            const hash = hashChainConfig(chain.chainIds, chain.slip44, chain.chain);
            return {
                ...chain,
                isTestnet: chain.testnet === true,
                isAdded: true,
                hash,
                iconUrl: viewChain({ network: chain, theme: currentTheme })
            };
        });

        const available = [
            ...allAvailableChains.mainnet,
            ...allAvailableChains.testnet
        ]
            .filter(chain => !chainHashMap().has(chain.chainIds.join()))
            .map<DisplayChain>(chain => {
                const hash = hashChainConfig(chain.chainIds, chain.slip44, chain.chain);
                return {
                    ...chain,
                    isTestnet: chain.testnet === true,
                    isAdded: false,
                    hash,
                    iconUrl: viewChain({ network: chain, theme: currentTheme })
                };
            });

        return { added, available };
    });

    const filteredChains = $derived(() => {
        const term = searchTerm.trim().toLowerCase();
        
        if (!term) return allChains();

        const filterFn = (chain: DisplayChain) => 
            chain.name.toLowerCase().includes(term) ||
            chain.chain.toLowerCase().includes(term);

        return {
            added: allChains().added.filter(filterFn),
            available: allChains().available.filter(filterFn)
        };
    });

    function createTags(chain: DisplayChain) {
        const tags: { text: string; type: 'id' | 'mainnet' | 'testnet' }[] = [];

        if (chain.chainIds?.[0]) {
            tags.push({ text: `ID: ${chain.chainIds[0]}`, type: 'id' });
        }
        
        tags.push({ 
            text: chain.isTestnet ? 'TESTNET' : 'MAINNET', 
            type: chain.isTestnet ? 'testnet' : 'mainnet' 
        });

        return tags;
    }

    async function handleAdd(chain: DisplayChain) {
        globalStore.update(state => ({
            ...state,
            chains: [...state.chains, chain]
        }));
        await setGlobalState();
    }

    async function handleEdit(chain: DisplayChain) {
    }

    async function handleSelect(chain: DisplayChain) {
        if (!currentWallet || !currentAccount) return;

        const walletIndex = $globalStore.selectedWallet;
        const accountIndex = currentWallet.selectedAccount;

        globalStore.update(state => {
            const newWallets = [...state.wallets];
            newWallets[walletIndex].accounts[accountIndex].chainHash = chain.hash;
            newWallets[walletIndex].accounts[accountIndex].chainId = chain.chainId;
            newWallets[walletIndex].accounts[accountIndex].slip44 = chain.slip44;
            return { ...state, wallets: newWallets };
        });

        await setGlobalState();
    }

    $effect(() => {
        getChains().then(chains => {
            allAvailableChains = chains;
        });
    });
</script>

<div class="page-container">
    <NavBar title={$_('networks.title')} />

    <section class="controls">
        <SmartInput
            bind:value={searchTerm}
            placeholder={$_('networks.searchPlaceholder')}
            showToggle={false}
        >
            {#snippet leftIcon()}
                <SearchIcon />
            {/snippet}
        </SmartInput>
    </section>

    <section class="lists">
        {#if filteredChains().added.length > 0}
            <div class="group">
                <h3 class="group-title">{$_('networks.added')}</h3>
                <div class="card-grid">
                    {#each filteredChains().added as chain (chain.chainIds.join())}
                        <OptionCard
                            title={chain.name}
                            description={chain.chain}
                            icon={chain.iconUrl}
                            selected={chain.hash === currentAccountChainHash}
                            compact={true}
                            tags={createTags(chain)}
                            onclick={() => handleSelect(chain)}
                        >
                            {#snippet rightAccessory()}
                                <button
                                    type="button"
                                    class="icon-button"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(chain);
                                    }}
                                    aria-label={$_('networks.manageNetwork', { values: { name: chain.name } })}
                                >
                                    <EditIcon />
                                </button>
                            {/snippet}
                        </OptionCard>
                    {/each}
                </div>
            </div>
        {/if}

        {#if filteredChains().available.length > 0}
            <div class="group">
                <h3 class="group-title">{$_('networks.available')}</h3>
                <div class="card-grid">
                    {#each filteredChains().available as chain (chain.chainIds.join())}
                        <OptionCard
                            title={chain.name}
                            description={chain.chain}
                            icon={chain.iconUrl}
                            compact={true}
                            tags={createTags(chain)}
                            onclick={() => handleAdd(chain)}
                        />
                    {/each}
                </div>
            </div>
        {/if}
    </section>
</div>

<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--color-neutral-background-base);
        box-sizing: border-box;
        padding: 0;
    }

    .controls {
        flex-shrink: 0;
        padding: var(--padding-side) var(--padding-side);
    }

    .lists {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 32px;
        min-height: 0;
        overflow-y: auto;
        padding: var(--padding-side) var(--padding-side);
    }

    .group {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .group-title {
        margin: 0;
        font-size: 12px;
        font-weight: 400;
        line-height: 16px;
        color: var(--color-content-text-secondary);
    }

    .card-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .icon-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: var(--color-button-regular-quaternary-default);
        border: 1px solid var(--color-neutral-border-default);
        border-radius: 8px;
        cursor: pointer;
        color: var(--color-cards-navigation-icon-secondary);
        transition: all 0.2s ease;

        &:hover {
            background: var(--color-button-regular-quaternary-hover);
            border-color: var(--color-neutral-border-hover);
        }

        &:focus-visible {
            outline: 2px solid var(--color-inputs-border-focus);
            outline-offset: 2px;
        }

        &:active {
            transform: scale(0.95);
        }

        :global(svg) {
            width: 20px;
            height: 20px;
        }
    }
</style>
