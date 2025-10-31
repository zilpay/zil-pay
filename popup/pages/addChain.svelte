<script lang="ts">
    import { _ } from 'popup/i18n';
    import { currentParams } from 'popup/store/route';
    import globalStore from 'popup/store/global';
    import { push } from 'popup/router/navigation';
    import type { EvmAddChainRequest } from 'types/chain';

    import DAppInfo from '../components/DAppInfo.svelte';
    import Button from '../components/Button.svelte';
    import Dropdown, { type DropdownOption } from '../components/Dropdown.svelte';
    import WarningIcon from '../components/icons/Warning.svelte';
    import CloseIcon from '../components/icons/Close.svelte';

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const confirmRequests = $derived(currentWallet?.confirm ?? []);
    const addChainEnvelope = $derived(confirmRequests.find(c => c.evmAddChainRequest !== undefined));
    const addChain = $derived(addChainEnvelope?.evmAddChainRequest as EvmAddChainRequest | undefined);

    const params = $derived(addChain?.params);
    const native = $derived(params?.nativeCurrency);
    const chainIdHex = $derived(params?.chainId ?? '');

    const chainIdDec = $derived(() => {
        try {
            const raw = (chainIdHex || '').toString().toLowerCase();
            if (raw.startsWith('0x')) return parseInt(raw, 16).toString();
            const n = Number(raw);
            return Number.isFinite(n) ? String(n) : '';
        } catch {
            return '';
        }
    });

    const existingChain = $derived(() => {
        try {
            if (!chainIdDec()) return undefined;
            const idNum = Number(chainIdDec());
            return $globalStore.chains.find(c => (c.chainIds || []).includes(idNum));
        } catch {
            return undefined;
        }
    });

    const rpcOptions = $derived(() => {
        const urls = params?.rpcUrls ?? [];
        return urls.map<DropdownOption>(u => ({ code: u, label: u }));
    });

    const explorerOptions = $derived(() => {
        const urls = params?.blockExplorerUrls ?? [];
        return urls.map<DropdownOption>(u => ({ code: u, label: u }));
    });

    let selectedRpc = $state('');
    let selectedExplorer = $state('');

    $effect(() => {
        selectedRpc = rpcOptions()?.[0]?.code ?? '';
        selectedExplorer = explorerOptions()?.[0]?.code ?? '';
    });

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

    async function handleApprove() {
        if (!addChainEnvelope || isLoading) return;
        isLoading = true;
        try {
        } catch (e) {
            if (!handleSessionError(e)) {
                errorMessage = String(e);
            }
        } finally {
            isLoading = false;
        }
    }

    async function handleCancel() {
        if (!addChainEnvelope || isLoading) return;
        isLoading = true;
        try {
        } catch (e) {
            if (!handleSessionError(e)) {
                errorMessage = String(e);
            }
        } finally {
            isLoading = false;
        }
    }

    $effect(() => {
        if (!addChain) {
            if ($currentParams?.type === 'popup') {
                window.close();
            } else {
                push('/');
            }
        }
    });
</script>

{#if addChain && params}
<div class="page-container">
    <main class="content">
        <div class="title-section">
            <h1 class="title">
                {#if existingChain()}
                    {$_('addChain.updateTitle', { values: { name: existingChain()?.name } })}
                {:else}
                    {$_('addChain.addTitle', { values: { name: params.chainName } })}
                {/if}
            </h1>
            <p class="subtitle">
                {#if existingChain()}
                    {$_('addChain.updateSubtitle')}
                {:else}
                    {$_('addChain.subtitle')}
                {/if}
            </p>
        </div>

        <DAppInfo 
            icon={addChain.icon} 
            title={addChain.title} 
            domain={addChain.domain} 
            compact={true}
            iconSize={40}
        />

        <div class="warning-banner">
            <div class="warning-icon">
                <WarningIcon />
            </div>
            <p class="warning-text">
                {$_('addChain.securityWarning')}
            </p>
        </div>

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

        <div class="details-card">
            <div class="detail-row">
                <span class="detail-label">{$_('addChain.networkName')}</span>
                <span class="detail-value">{params.chainName}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">{$_('addChain.chainId')}</span>
                <div class="detail-value">
                    <span class="mono">{chainIdHex}</span>
                    {#if chainIdDec()}
                        <span class="hint">({chainIdDec()})</span>
                    {/if}
                </div>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">{$_('addChain.symbol')}</span>
                <span class="detail-value">{native?.symbol}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">{$_('addChain.decimals')}</span>
                <span class="detail-value">{native?.decimals}</span>
            </div>

            <div class="divider"></div>

            <div class="dropdown-section">
                <span class="dropdown-label">{$_('addChain.rpcUrl')}</span>
                <div class="dropdown-wrapper">
                    <Dropdown
                        options={rpcOptions()}
                        selected={selectedRpc}
                        placeholder={$_('addChain.selectRpc')}
                        onSelect={(code) => (selectedRpc = code)}
                        width="100%"
                    />
                </div>
            </div>

            {#if explorerOptions()?.length > 0}
                <div class="dropdown-section">
                    <span class="dropdown-label">{$_('addChain.explorer')}</span>
                    <Dropdown
                        options={explorerOptions()}
                        selected={selectedExplorer}
                        placeholder={$_('addChain.selectExplorer')}
                        onSelect={(code) => (selectedExplorer = code)}
                        width="100%"
                    />
                </div>
            {/if}
        </div>
    </main>

    <footer class="footer">
        <Button 
            variant="outline" 
            onclick={handleCancel} 
            disabled={isLoading}
        >
            {$_('common.cancel')}
        </Button>
        <Button 
            onclick={handleApprove} 
            loading={isLoading}
        >
            {#if existingChain()}
                {$_('addChain.update')}
            {:else}
                {$_('addChain.approve')}
            {/if}
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
        padding: 0;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
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

    .warning-banner {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px;
        background: color-mix(in srgb, var(--color-warning-text) 8%, transparent);
        border-radius: 12px;
    }

    .warning-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;

        :global(svg) {
            width: 20px;
            height: 20px;
            color: var(--color-warning-text);
        }
    }

    .warning-text {
        margin: 0;
        color: var(--color-content-text-inverted);
        font-size: 12px;
        font-weight: 400;
        line-height: 16px;
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

    .details-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        background: var(--color-cards-regular-base-default);
        border: 1px solid var(--color-cards-regular-border-default);
        border-radius: 12px;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        min-height: 20px;
    }

    .detail-label {
        color: var(--color-content-text-secondary);
        font-size: 13px;
        line-height: 18px;
        flex-shrink: 0;
    }

    .detail-value {
        color: var(--color-content-text-inverted);
        font-size: 13px;
        font-weight: 500;
        line-height: 18px;
        text-align: right;
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
        justify-content: flex-end;
    }

    .mono {
        font-family: Geist, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 180px;
    }

    .hint {
        color: var(--color-content-text-secondary);
        font-size: 11px;
        line-height: 14px;
        white-space: nowrap;
    }

    .divider {
        height: 1px;
        background: var(--color-cards-regular-border-default);
        margin: 4px 0;
    }

    .dropdown-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .dropdown-label {
        color: var(--color-content-text-secondary);
        font-size: 12px;
        font-weight: 500;
        line-height: 16px;
    }

    .dropdown-wrapper {
        display: flex;
        align-items: flex-start;
        gap: 8px;
    }

    .copy-wrapper {
        flex-shrink: 0;
        padding-top: 12px;
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
</style>
