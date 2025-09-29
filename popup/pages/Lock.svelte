<script lang="ts">
    import type { IWalletState } from 'background/storage';
    import { tick } from 'svelte';
    import Button from '../components/Button.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import FastImg from '../components/FastImg.svelte';
    import PlusIcon from '../components/icons/Plus.svelte';
    import globalStore from 'popup/store/global';
    import { push } from '../router/navigation';
    import { hashChainConfig } from 'lib/utils/hashing';
    import { viewChain } from 'lib/popup/url';
    import { _ } from '../i18n';
    import { unlockWallet } from 'popup/background/wallet';
    import { truncate } from 'popup/mixins/address';

    let password = $state('');
    let isLoading = $state(false);
    let error = $state<string | null>(null);
    let selectedWalletIndex = $state<number | null>(
        $globalStore.wallets.length === 1 ? 0 : null,
    );

    const wallets = $derived($globalStore.wallets);
    const currentTheme = $derived($globalStore.appearances);
    const isWalletSelected = $derived(selectedWalletIndex !== null);

    $effect(() => {
        if (isWalletSelected) {
            tick().then(() => {
                const passwordInput = document.getElementById('password') as HTMLInputElement;
                passwordInput?.focus();
            });
        }
    });

    function getWalletLogo(wallet: IWalletState): string {
        const chain = $globalStore.chains.find((c) => {
            const hash = hashChainConfig(c.chainIds, c.slip44, c.chain);
            return hash === wallet.defaultChainHash;
        });

        if (chain) {
            return viewChain({
                network: chain,
                theme: currentTheme,
            });
        }

        return '/assets/icons/default_chain.svg';
    }

    async function handleWalletSelect(index: number) {
        if (isLoading) return;

        selectedWalletIndex = index;
        password = '';
        error = null;

        await tick();

        const passwordInput = document.getElementById('password') as HTMLInputElement;
        passwordInput?.focus();
    }

    async function handleUnlock(e: SubmitEvent) {
        e.preventDefault();
        if (!password.trim() || selectedWalletIndex === null || isLoading) return;

        isLoading = true;
        error = null;

        try {
            await unlockWallet(password, selectedWalletIndex);
            push('/');
        } catch (err) {
            error = `${$_('lockpage.invalidPassword')} ${err}`;
        } finally {
            isLoading = false;
        }
    }

    function handleAddWallet() {
        if (isLoading) return;
        push('/new-wallet-options');
    }
</script>

<div class="lock-page" class:disabled={isLoading}>
    <div class="header">
        <h1 class="title">{$_('lockpage.title')}</h1>
        <button
            class="add-button"
            onclick={handleAddWallet}
            disabled={isLoading}
            type="button"
        >
            <PlusIcon />
        </button>
    </div>

    <div class="content">
        <div class="wallets-section">
            <p class="wallets-label">{$_('lockpage.chooseWallet')}</p>
            <div class="wallets-list">
                {#each wallets as wallet, index}
                    <button 
                        class="wallet-item" 
                        class:selected={selectedWalletIndex === index}
                        onclick={() => handleWalletSelect(index)}
                    >
                        <div class="selector">
                            {#if selectedWalletIndex === index}
                                <div class="selector-inner"></div>
                            {/if}
                        </div>
                        <div class="icon-container">
                            <FastImg
                                src={getWalletLogo(wallet)} 
                                alt={wallet.walletName}
                                class="chain-logo"
                            />
                        </div>
                        <div class="info-container">
                            <div class="wallet-name">{wallet.walletName}</div>
                            <div class="wallet-address">{truncate(wallet.uuid)}</div>
                        </div>
                    </button>
                {/each}
            </div>
        </div>

        <form class="form-section" onsubmit={handleUnlock}>
            <SmartInput
                id="password"
                label=""
                placeholder={isWalletSelected
                    ? $_('lockpage.passwordPlaceholder')
                    : $_('lockpage.selectWalletPlaceholder')}
                bind:value={password}
                hide={true}
                disabled={isLoading || !isWalletSelected}
                oninput={() => (error = null)}
                hasError={!!error}
                errorMessage={error || ''}
                width="100%" />

            <Button
                type="submit"
                disabled={!password.trim() || !isWalletSelected}
                loading={isLoading}
                width="100%"
                height={48}>
                {$_('lockpage.unlockButton')}
            </Button>
        </form>
    </div>
</div>

<style lang="scss">
    .lock-page {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100%;
        max-width: 340px;
        margin: 0 auto;
        background-color: var(--color-neutral-background-base);
        box-sizing: border-box;
        transition: opacity 0.2s ease;

        &.disabled {
            pointer-events: none;
            opacity: 0.8;
        }
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 16px;
        height: 56px;
        flex-shrink: 0;
    }

    .title {
        font-size: 20px;
        font-weight: 700;
        line-height: 30px;
        color: var(--color-content-text-inverted);
        margin: 0;
    }

    .add-button {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        padding: 0;

        :global(svg) {
            width: 24px;
            height: 24px;
            stroke: var(--color-content-icon-primary);
        }

        &:active:not(:disabled) {
            transform: scale(0.95);
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 0.6;
        }
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        padding: 0 16px 16px 16px;
    }

    .wallets-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
        min-height: 0;
        margin-top: 24px;
        padding-bottom: 24px;
    }

    .wallets-label {
        font-size: 12px;
        font-family: Geist;
        font-weight: 400;
        line-height: 16px;
        color: var(--color-content-text-secondary);
        margin: 0;
    }

    .wallets-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .wallet-item {
        width: 100%;
        padding: 12px;
        background: var(--color-cards-regular-base-default);
        border-radius: 12px;
        outline: 1px solid var(--color-cards-regular-border-default);
        outline-offset: -1px;
        border: none;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;

        &:hover {
            outline-color: var(--color-cards-regular-border-hover);
        }

        &.selected {
            background: var(--color-cards-regular-base-selected);
            
            .selector {
                background: var(--color-controls-selector-select);
                border-color: var(--color-controls-selector-select);
            }

            .selector-inner {
                opacity: 1;
                transform: scale(1);
            }
        }
    }

    .selector {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 1px solid var(--color-controls-selector-border);
        background: var(--color-controls-selector-base);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .selector-inner {
        width: 12px;
        height: 12px;
        background: var(--color-controls-selector-checker);
        border-radius: 50%;
        opacity: 0;
        transform: scale(0);
        transition: all 0.2s ease;
    }

    .icon-container {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
    }

    .info-container {
        flex: 1 1 0;
        min-width: 0;
    }

    .wallet-name {
        color: var(--color-content-text-inverted);
        font-size: 16px;
        font-weight: 700;
        line-height: 22px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .wallet-address {
        color: var(--color-content-text-secondary);
        font-size: 12px;
        font-weight: 400;
        line-height: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .form-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
        flex-shrink: 0;
        margin-top: auto;
    }
</style>

