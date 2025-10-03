<script lang="ts">
    import { _ } from 'popup/i18n';
    import { getChains, type ChainData } from 'popup/mixins/chains';
    import { viewChain } from 'lib/popup/url';
    import globalStore from 'popup/store/global';
    import type { IChainConfigState } from 'background/storage';

    import NavBar from '../components/NavBar.svelte';
    import Switch from '../components/Switch.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import SearchIcon from '../components/icons/Search.svelte';
    import EditIcon from '../components/icons/Edit.svelte';
    import PlusIcon from '../components/icons/Plus.svelte';
    import OptionCard from '../components/OptionCard.svelte';

    type DisplayChain = IChainConfigState & { isTestnet: boolean };

    let showTestnets = $state(false);
    let searchTerm = $state('');
    let allAvailableChains = $state<ChainData>({ mainnet: [], testnet: [] });

    const addedChains = $derived($globalStore.chains);
    const currentTheme = $derived($globalStore.appearances);

    const availableChains = $derived(() => {
        const addedIds = new Set(addedChains.map((chain) => chain.chainIds.join()));
        const mainnet = allAvailableChains.mainnet
            .filter((chain) => !addedIds.has(chain.chainIds.join()))
            .map<DisplayChain>((chain) => ({ ...chain, isTestnet: false }));
        const testnet = allAvailableChains.testnet
            .filter((chain) => !addedIds.has(chain.chainIds.join()))
            .map<DisplayChain>((chain) => ({ ...chain, isTestnet: true }));

        return { mainnet, testnet };
    });

    const filteredChains = $derived(() => {
        const term = searchTerm.trim().toLowerCase();

        const predicate = (chain: DisplayChain) => {
            if (!showTestnets && chain.isTestnet) {
                return false;
            }
            if (!term) {
                return true;
            }
            return (
                chain.name.toLowerCase().includes(term) ||
                chain.chain.toLowerCase().includes(term)
            );
        };

        return {
            added: addedChains
                .map<DisplayChain>((chain) => ({ ...chain, isTestnet: chain.testnet === true }))
                .filter(predicate),
            available: [...availableChains().mainnet, ...availableChains().testnet].filter(predicate),
        };
    });

    function createTags(chain: DisplayChain) {
        const tags: { text: string; type: 'id' | 'mainnet' | 'testnet' }[] = [];

        if (chain.chainIds?.[0]) {
            tags.push({ text: `ID: ${chain.chainIds[0]}`, type: 'id' });
        }
        tags.push({ text: chain.isTestnet ? 'TESTNET' : 'MAINNET', type: chain.isTestnet ? 'testnet' : 'mainnet' });

        return tags;
    }

    function handleEdit(_chain: DisplayChain) {}

    function handleAdd(_chain: DisplayChain) {}

    function iconFor(chain: DisplayChain) {
        return viewChain({ network: chain, theme: currentTheme });
    }

    $effect(() => {
        async function loadChains() {
            allAvailableChains = await getChains();
        }

        loadChains();
    });
</script>

<div class="page-container">
    <NavBar title={$_('networks.title')} />

    <section class="controls">
        <div class="toggle-row">
            <span class="toggle-label">{$_('networks.showTestnet')}</span>
            <Switch bind:checked={showTestnets} variant="default" />
        </div>

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
                            icon={iconFor(chain)}
                            selected={true}
                            compact={true}
                            tags={createTags(chain)}
                            onclick={() => handleEdit(chain)}
                        >
                            {#snippet rightAccessory()}
                                <button
                                    type="button"
                                    class="icon-button"
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
                            icon={iconFor(chain)}
                            compact={true}
                            tags={createTags(chain)}
                            onclick={() => handleAdd(chain)}
                        >
                            {#snippet rightAccessory()}
                                <button
                                    type="button"
                                    class="icon-button"
                                    aria-label={$_('networks.addNetwork', { values: { name: chain.name } })}
                                >
                                    <PlusIcon />
                                </button>
                            {/snippet}
                        </OptionCard>
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
        padding: 0 var(--padding-side);
        box-sizing: border-box;
        background: var(--color-neutral-background-base);
    }

    .controls {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-top: 16px;
    }

    .toggle-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .toggle-label {
        font-size: 16px;
        font-weight: 400;
        line-height: 22px;
        color: var(--color-content-text-inverted);
    }

    .lists {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 32px;
        overflow-y: auto;
        padding: 24px 0;
    }

    .group {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .group-title {
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
        border-radius: 8px;
        border: 1px solid var(--color-neutral-border-default);
        background: var(--color-button-regular-quaternary-default);
        color: var(--color-cards-navigation-icon-secondary);
        transition: background 0.2s ease, border-color 0.2s ease;

        &:hover {
            background: var(--color-button-regular-quaternary-hover);
            border-color: var(--color-neutral-border-hover);
        }

        &:focus-visible {
            outline: 2px solid var(--color-inputs-border-focus);
            outline-offset: 2px;
        }

        :global(svg) {
            width: 20px;
            height: 20px;
        }
    }
</style>
