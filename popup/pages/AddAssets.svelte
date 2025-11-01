<script lang="ts">
    import { _ } from 'popup/i18n';
    import { currentParams } from 'popup/store/route';
    import globalStore from 'popup/store/global';
    import { push } from 'popup/router/navigation';
    import type { IFTokenState } from 'background/storage';
    import { processTokenLogo } from 'lib/popup/url';
    import { truncate } from 'popup/mixins/address';
    import { addEthereumWatchAssetResponse } from 'popup/background/token';
    
    import DAppInfo from '../components/DAppInfo.svelte';
    import Button from '../components/Button.svelte';
    import FastImg from '../components/FastImg.svelte';
    import CopyButton from '../components/CopyButton.svelte';
    import WarningIcon from '../components/icons/Warning.svelte';
    import CloseIcon from '../components/icons/Close.svelte';
    import SolidityIcon from '../components/icons/Solidity.svelte';

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const confirmRequests = $derived(currentWallet?.confirm ?? []);
    const addAssetEnvelope = $derived(confirmRequests.find(c => c.evmAddAssetRequest !== undefined));
    const assetsToAdd = $derived((addAssetEnvelope?.evmAddAssetRequest ?? []) as IFTokenState[]);
    const metadata = $derived(addAssetEnvelope?.metadata);

    let isLoading = $state(false);
    let errorMessage = $state<string | null>(null);

    function dismissError() {
        errorMessage = null;
    }

    function handleSessionError(e: unknown): boolean {
        if (String(e).includes('Session')) {
            if ($currentParams?.type === 'popup') {
                window.close();
            } else {
                push('/lock');
            }
            return true;
        }
        return false;
    }

    async function handleConfirm() {
        if (isLoading || !addAssetEnvelope) return;
        isLoading = true;
        errorMessage = null;

        try {
            await addEthereumWatchAssetResponse(addAssetEnvelope.uuid, $globalStore.selectedWallet, true);
            
            if ($currentParams?.type === 'popup') {
                window.close();
            } else {
                push('/');
            }
        } catch (e) {
            if (!handleSessionError(e)) {
                errorMessage = String(e);
            }
        } finally {
            isLoading = false;
        }
    }

    async function handleReject() {
        if (isLoading || !addAssetEnvelope) return;
        isLoading = true;
        errorMessage = null;

        try {
            await addEthereumWatchAssetResponse(addAssetEnvelope.uuid, $globalStore.selectedWallet, false);
            
            if ($currentParams?.type === 'popup') {
                window.close();
            } else {
                push('/');
            }
        } catch (e) {
            if (!handleSessionError(e)) {
                errorMessage = String(e);
            }
        } finally {
            isLoading = false;
        }
    }

    $effect(() => {
        if (!currentWallet) return;
        if (addAssetEnvelope === undefined) return;
        
        if (assetsToAdd.length === 0) {
            if ($currentParams?.type === 'popup') {
                window.close();
            } else {
                push('/');
            }
        }
    });
</script>

{#if assetsToAdd.length > 0}
<div class="page-container">
    <main class="content">
        <div class="title-section">
            <h1 class="title">{$_('addAssets.title')}</h1>
            <p class="subtitle">
                {$_('addAssets.subtitle', { values: { count: assetsToAdd.length } })}
            </p>
        </div>

        {#if metadata}
            <DAppInfo
                icon={metadata.icon}
                title={metadata.title ?? ''}
                domain={metadata.domain ?? ''}
            />
        {/if}

        {#if errorMessage}
            <div class="error-banner" role="alert">
                <div class="error-content">
                    <div class="error-icon">
                        <WarningIcon />
                    </div>
                    <div class="error-text">{errorMessage}</div>
                </div>
                <button 
                    class="error-close" 
                    onclick={dismissError} 
                    aria-label="Dismiss error"
                    type="button"
                >
                    <CloseIcon />
                </button>
            </div>
        {/if}

        <div class="assets-section">
            <div class="section-header">
                <h3 class="section-title">{$_('addAssets.tokensToAdd')}</h3>
                <span class="token-count">{assetsToAdd.length}</span>
            </div>

            <div class="assets-list">
                {#each assetsToAdd as token (token.addr)}
                    <div class="asset-card">
                        <div class="asset-header">
                            <div class="asset-icon-wrapper">
                                <div class="asset-icon">
                                    <FastImg 
                                        src={processTokenLogo({ token, theme: $globalStore.appearances })} 
                                        alt={token.symbol}
                                    />
                                </div>
                                <div class="address-type-badge">
                                    <SolidityIcon class="icon" />
                                </div>
                            </div>
                            <div class="asset-main">
                                <div class="asset-name">{token.name}</div>
                                <div class="asset-symbol">{token.symbol}</div>
                            </div>
                        </div>

                        <div class="asset-details">
                            <div class="detail-row">
                                <span class="detail-label">{$_('addAssets.contract')}</span>
                                <CopyButton 
                                    label={truncate(token.addr, 6, 4)} 
                                    value={token.addr} 
                                />
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">{$_('addAssets.decimals')}</span>
                                <span class="detail-value">{token.decimals}</span>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </main>

    <footer class="footer">
        <Button 
            variant="outline" 
            onclick={handleReject} 
            disabled={isLoading}
        >
            {$_('common.cancel')}
        </Button>
        <Button 
            onclick={handleConfirm} 
            loading={isLoading}
        >
            {$_('addAssets.addTokens', { values: { count: assetsToAdd.length } })}
        </Button>
    </footer>
</div>
{/if}

<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--color-neutral-background-base);
        box-sizing: border-box;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px var(--padding-side);
        overflow-y: auto;
        min-height: 0;
    }

    .title-section {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .title {
        font-size: 20px;
        font-weight: 700;
        line-height: 28px;
        color: var(--color-content-text-inverted);
        margin: 0;
    }

    .subtitle {
        font-size: 13px;
        font-weight: 400;
        line-height: 18px;
        color: var(--color-content-text-secondary);
        margin: 0;
    }

    .error-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 12px;
        background: var(--color-error-background);
        border-radius: 12px;
    }

    .error-content {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        flex: 1;
    }

    .error-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;

        :global(svg) {
            width: 20px;
            height: 20px;
            color: var(--color-error-text);
        }
    }

    .error-text {
        color: var(--color-error-text);
        font-size: 12px;
        line-height: 16px;
        word-break: break-word;
    }

    .error-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: none;
        border: none;
        border-radius: 6px;
        color: var(--color-error-text);
        cursor: pointer;
        transition: background-color 0.2s ease;
        flex-shrink: 0;
        padding: 0;

        :global(svg) {
            width: 18px;
            height: 18px;
        }

        &:hover {
            background: color-mix(in srgb, var(--color-negative-border-primary) 20%, transparent);
        }
    }

    .assets-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
        min-height: 0;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 4px;
    }

    .section-title {
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        margin: 0;
    }

    .token-count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        height: 24px;
        padding: 0 8px;
        background: color-mix(in srgb, var(--color-neutral-tag-purple-fg) 12%, transparent);
        border: 1px solid var(--color-neutral-tag-purple-border);
        border-radius: 12px;
        color: var(--color-neutral-tag-purple-text);
        font-size: 12px;
        font-weight: 600;
        line-height: 16px;
    }

    .assets-list {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
        min-height: 0;
        padding-right: 4px;
        margin-right: -4px;
    }

    .asset-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        background: var(--color-cards-regular-base-default);
        border: 1px solid var(--color-cards-regular-border-default);
        border-radius: 12px;
        transition: all 0.2s ease;

        &:hover {
            border-color: var(--color-neutral-tag-purple-border);
            background: var(--color-cards-regular-base-selected-hover);
        }
    }

    .asset-header {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .asset-icon-wrapper {
        position: relative;
        flex-shrink: 0;
    }

    .asset-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        background: var(--color-neutral-background-container);
        display: flex;
        align-items: center;
        justify-content: center;

        :global(img) {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .address-type-badge {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-neutral-background-base);
        border-radius: 50%;
        border: 2px solid var(--color-neutral-background-base);

        :global(svg) {
            width: 14px;
            height: 14px;
        }

        :global(.icon > path) {
            fill: var(--color-content-text-secondary);
        }
    }

    .asset-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    .asset-name {
        font-size: 16px;
        font-weight: 700;
        line-height: 22px;
        color: var(--color-content-text-inverted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .asset-symbol {
        font-size: 12px;
        font-weight: 400;
        line-height: 16px;
        color: var(--color-content-text-secondary);
    }

    .asset-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        background: var(--color-neutral-background-container);
        border-radius: 8px;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
    }

    .detail-label {
        font-size: 12px;
        line-height: 16px;
        color: var(--color-content-text-secondary);
        flex-shrink: 0;
    }

    .detail-value {
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        text-align: right;
    }

    .footer {
        position: sticky;
        bottom: 0;
        padding: 16px var(--padding-side) calc(16px + env(safe-area-inset-bottom));
        background: var(--color-neutral-background-base);
        border-top: 1px solid var(--color-cards-regular-border-default);
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        flex-shrink: 0;
        z-index: 10;
    }

    .assets-list::-webkit-scrollbar {
        width: 6px;
    }

    .assets-list::-webkit-scrollbar-track {
        background: transparent;
    }

    .assets-list::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--color-content-text-secondary) 30%, transparent);
        border-radius: 3px;

        &:hover {
            background: color-mix(in srgb, var(--color-content-text-secondary) 50%, transparent);
        }
    }
</style>
