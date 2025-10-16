<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { setGlobalState } from 'popup/background/wallet';
    import type { IChainConfigState } from 'background/storage/chain';
    import { viewChain } from 'lib/popup/url';
    import { currentParams } from 'popup/store/route';
    
    import NavBar from '../components/NavBar.svelte';
    import FastImg from '../components/FastImg.svelte';
    import Switch from '../components/Switch.svelte';
    import DownIcon from '../components/icons/Down.svelte';
    import DeleteIcon from '../components/icons/Delete.svelte';

    let showAdvanced = $state(false);

    const chainIndex = $derived(Number($currentParams.index ?? 0));
    const chain = $derived<IChainConfigState | undefined>(
        $globalStore.chains[chainIndex]
    );

    const chainIcon = $derived(
        chain ? viewChain({ network: chain, theme: $globalStore.appearances }) : ''
    );

    async function toggleFallback() {
        if (!chain || chainIndex < 0) return;
        
        globalStore.update(state => {
            const chains = [...state.chains];
            chains[chainIndex] = {
                ...chains[chainIndex],
                fallbackEnabled: !chains[chainIndex].fallbackEnabled
            };
            return { ...state, chains };
        });
        
        await setGlobalState();
    }

    async function toggleBatchRequest() {
        if (!chain || chainIndex < 0) return;

        globalStore.update(state => {
            const chains = [...state.chains];
            chains[chainIndex] = {
                ...chains[chainIndex],
                batchRequest: !chains[chainIndex].batchRequest
            };
            return { ...state, chains };
        });
        await setGlobalState();
    }

    function handleRpcSelect(index: number) {
        // selectedRpcIndex = index;
    }

    async function handleRpcDelete(index: number) {
        if (!chain || chainIndex < 0) return;
        
        globalStore.update(state => {
            const chains = [...state.chains];
            chains[chainIndex] = {
                ...chains[chainIndex],
                rpc: chains[chainIndex].rpc.filter((_, i) => i !== index)
            };
            return { ...state, chains };
        });
        
        await setGlobalState();
    }
</script>

<div class="page-container">
    <NavBar title={$_('networkDetails.title')} />

    {#if chain}
        <div class="content">
            <div class="info-card">
                <div class="chain-header">
                    <div class="chain-icon">
                        <FastImg src={chainIcon} alt={chain.name} />
                    </div>
                    <div class="chain-info">
                        <div class="chain-name">{chain.name}</div>
                        <div class="chain-symbol">{chain.chain}</div>
                    </div>
                </div>

                <div class="chain-details">
                    <div class="detail-row">
                        <span class="detail-label">{$_('networkDetails.chainId')}</span>
                        <span class="detail-value">{chain.chainIds[0]}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">{$_('networkDetails.slip44')}</span>
                        <span class="detail-value">{chain.slip44}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">{$_('networkDetails.blockTime')}</span>
                        <span class="detail-value">{chain.diffBlockTime} sec</span>
                    </div>
                </div>
            </div>

            <div class="toggles-card">
                <div class="toggle-row">
                    <span class="toggle-label">{$_('networkDetails.fallbackEnabled')}</span>
                    <Switch
                        checked={chain.fallbackEnabled}
                        variant="default"
                        onChange={toggleFallback}
                    />
                </div>
                <div class="toggle-row">
                    <span class="toggle-label">{$_('networkDetails.batchRequest')}</span>
                    <Switch
                        checked={true}
                        variant="default"
                        onChange={toggleBatchRequest}
                    />
                </div>
            </div>

            <button class="advanced-toggle" onclick={() => showAdvanced = !showAdvanced}>
                <span class="advanced-text">{$_('networkDetails.advancedSettings')}</span>
                <DownIcon />
            </button>

            {#if showAdvanced}
                <div class="section-card">
                    <div class="section-header">
                        <h3 class="section-title">{$_('networkDetails.explorers')}</h3>
                    </div>
                    
                    <div class="list-items">
                        {#each chain.explorers as explorer}
                            <div class="explorer-item">
                                <div class="explorer-icon">
                                    {#if explorer.icon}
                                        <FastImg src={explorer.icon} alt={explorer.name} />
                                    {:else}
                                        <div class="placeholder-icon"></div>
                                    {/if}
                                </div>
                                <div class="explorer-info">
                                    <div class="explorer-name">{explorer.name}</div>
                                    <div class="explorer-url">{explorer.url}</div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <h3 class="section-title">{$_('networkDetails.rpcNodes')}</h3>
                    </div>
                    
                    <div class="list-items">
                        {#each chain.rpc as rpc, index}
                            <div
                                class="rpc-item"
                                role="button"
                                tabindex="0"
                                onclick={() => handleRpcSelect(index)}
                                onkeydown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleRpcSelect(index);
                                    }
                                }}
                            >
                                <div class="rpc-url">{rpc}</div>
                                <button
                                    class="delete-btn"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        handleRpcDelete(index);
                                    }}
                                >
                                    <DeleteIcon />
                                </button>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    {/if}
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

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 24px var(--padding-side);
        overflow-y: auto;
    }

    .info-card, .toggles-card, .section-card {
        padding: 12px;
        background: var(--color-neutral-background-container);
        border-radius: 12px;
    }

    .chain-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 12px;
    }

    .chain-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
    }

    .chain-info {
        flex: 1;
    }

    .chain-name {
        color: var(--color-content-text-inverted);
        font-size: 16px;
        font-weight: 700;
        line-height: 22px;
    }

    .chain-symbol {
        color: var(--color-content-text-secondary);
        font-size: 12px;
        line-height: 16px;
    }

    .chain-details {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }

    .detail-label {
        color: var(--color-content-text-secondary);
        font-size: 14px;
        line-height: 20px;
    }

    .detail-value {
        color: var(--color-content-text-inverted);
        font-size: 14px;
        line-height: 20px;
        text-align: right;
    }

    .toggles-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .toggle-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .toggle-label {
        color: var(--color-content-text-inverted);
        font-size: 14px;
        line-height: 20px;
    }

    .advanced-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 6px 12px;
        border-radius: 8px;
        align-self: center;
        transition: background-color 0.2s ease;

        &:hover {
            background-color: var(--color-button-regular-quaternary-hover);
        }

        &:hover .advanced-text {
            text-decoration: underline;
        }

        :global(svg) {
            width: 24px;
            height: 24px;
            color: var(--color-content-text-purple);
        }
    }

    .advanced-text {
        color: var(--color-content-text-purple);
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
    }

    .section-card {
        padding: 16px;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    .section-title {
        color: var(--color-content-text-inverted);
        font-size: 16px;
        font-weight: 700;
        line-height: 22px;
        margin: 0;
    }

    .list-items {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .explorer-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 12px;
        background: var(--color-cards-regular-base-default);
        border-radius: 12px;
    }

    .explorer-icon {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
    }

    .placeholder-icon {
        width: 100%;
        height: 100%;
        background: var(--color-cards-navigation-base-hover);
        border-radius: 6px;
    }

    .explorer-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .explorer-name {
        color: var(--color-content-text-inverted);
        font-size: 14px;
        line-height: 20px;
    }

    .explorer-url {
        color: var(--color-content-text-secondary);
        font-size: 12px;
        line-height: 16px;
        word-break: break-all;
    }

    .rpc-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: var(--color-cards-regular-base-default);
        border: 1px solid transparent;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            border-color: var(--color-cards-regular-border-hover);
        }

        &:focus-visible {
            outline: 2px solid var(--color-inputs-border-focus);
            outline-offset: 2px;
        }
    }

    .rpc-url {
        flex: 1;
        color: var(--color-content-text-inverted);
        font-size: 14px;
        line-height: 20px;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .delete-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;

        :global(svg) {
            width: 24px;
            height: 24px;
            color: var(--color-negative-border-primary);
        }
    }
</style>
