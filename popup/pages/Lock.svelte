<script lang="ts">
    import type { IWalletState } from 'background/storage';
    import { tick } from 'svelte';
    import Button from '../components/Button.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import FastImg from '../components/FastImg.svelte';
    import PlusIcon from '../components/icons/Plus.svelte';
    import Bip39Icon from '../components/icons/BIP39.svelte';
    import LedgerIcon from '../components/icons/Ledger.svelte';
    import EyeIcon from '../components/icons/Eye.svelte';
    import ShieldIcon from '../components/icons/Shield.svelte';
    import globalStore from 'popup/store/global';
    import { push } from '../router/navigation';
    import { hashChainConfig } from 'lib/utils/hashing';
    import { viewChain } from 'lib/popup/url';
    import { _ } from '../i18n';
    import { unlockWallet } from 'popup/background/wallet';
    import { truncate } from 'popup/mixins/address';
    import { linksExpand } from 'popup/mixins/links';
    import { WalletTypes } from 'config/wallet';

    const CACHE_KEY = 'zilpay_last_wallet_index';
    const WALLET_TYPE_ICONS = {
        [WalletTypes.SecretPhrase]: Bip39Icon,
        [WalletTypes.SecretKey]: ShieldIcon,
        [WalletTypes.Ledger]: LedgerIcon,
        [WalletTypes.Watch]: EyeIcon
    };

    let password = $state('');
    let isLoading = $state(false);
    let error = $state<string | null>(null);
    let selectedWalletIndex = $state<number | null>(null);

    const wallets = $derived($globalStore.wallets);
    const currentTheme = $derived($globalStore.appearances);
    const isWalletSelected = $derived(selectedWalletIndex !== null);
    const selectedWallet = $derived(selectedWalletIndex !== null ? wallets[selectedWalletIndex] : null);
    const needsPassword = $derived(
        selectedWallet && 
        selectedWallet.walletType !== WalletTypes.Watch && 
        selectedWallet.walletType !== WalletTypes.Ledger
    );

    function isPasswordlessWallet(walletType: WalletTypes): boolean {
        return walletType === WalletTypes.Watch || walletType === WalletTypes.Ledger;
    }

    $effect(() => {
        const cachedIndex = localStorage.getItem(CACHE_KEY);
        
        if (cachedIndex !== null) {
            const index = parseInt(cachedIndex, 10);
            if (!isNaN(index) && index >= 0 && index < wallets.length) {
                selectedWalletIndex = index;
                return;
            }
        }

        if (wallets.length === 1) {
            selectedWalletIndex = 0;
        }
    });

    $effect(() => {
        if (isWalletSelected && needsPassword) {
            tick().then(() => {
                document.getElementById('password')?.focus();
            });
        }
    });

    function getWalletLogo(wallet: IWalletState): string {
        const chain = $globalStore.chains.find((c) => {
            const hash = hashChainConfig(c.chainIds, c.slip44, c.chain);
            return hash === wallet.defaultChainHash;
        });

        return chain ? viewChain({ network: chain, theme: currentTheme }) : '/assets/icons/default_chain.svg';
    }

    async function performUnlock(walletPassword: string, index: number) {
        if (isLoading) return;

        isLoading = true;
        error = null;

        try {
            await unlockWallet(walletPassword, index);
            localStorage.setItem(CACHE_KEY, index.toString());
            push('/');
        } catch (err) {
            error = walletPassword ? `${$_('lockpage.invalidPassword')} ${err}` : String(err);
        } finally {
            isLoading = false;
        }
    }

    async function handleWalletSelect(index: number) {
        if (isLoading) return;

        selectedWalletIndex = index;
        password = '';
        error = null;

        const wallet = wallets[index];
        
        if (isPasswordlessWallet(wallet.walletType)) {
            await performUnlock('', index);
            return;
        }

        await tick();
        document.getElementById('password')?.focus();
    }

    async function handleUnlock(e: SubmitEvent) {
        e.preventDefault();
        
        if (selectedWalletIndex === null || isLoading) return;

        const wallet = wallets[selectedWalletIndex];

        if (isPasswordlessWallet(wallet.walletType)) {
            await performUnlock('', selectedWalletIndex);
            return;
        }

        if (!password.trim()) return;

        await performUnlock(password, selectedWalletIndex);
    }

    function handleAddWallet() {
        if (!isLoading) linksExpand("/new-wallet-options");
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' && selectedWallet && !needsPassword) {
            handleUnlock(e as any);
        }
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
                        onkeydown={handleKeyDown}
                    >
                        {#if wallet.confirm?.length > 0}
                            <div class="badge">{wallet.confirm.length}</div>
                        {/if}
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
                        <div class="type-icon">
                            {#snippet typeIcon()}
                                {@const TypeIcon = WALLET_TYPE_ICONS[wallet.walletType] || ShieldIcon}
                                <TypeIcon />
                            {/snippet}
                            {@render typeIcon()}
                        </div>
                    </button>
                {/each}
            </div>
        </div>

        <form class="form-section" onsubmit={handleUnlock}>
            {#if needsPassword}
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
                    loading={isLoading}
                    width="100%" />
            {:else if isWalletSelected}
                <div class="no-password-message">
                    {#snippet messageIcon()}
                        {@const Icon = selectedWallet?.walletType === WalletTypes.Watch ? EyeIcon : LedgerIcon}
                        <Icon />
                    {/snippet}
                    {@render messageIcon()}
                    <span>{$_(selectedWallet?.walletType === WalletTypes.Watch ? 'lockpage.watchWallet' : 'lockpage.ledgerWallet')}</span>
                </div>
            {/if}

            <Button
                type="submit"
                disabled={needsPassword ? (!password.trim() || !isWalletSelected) : !isWalletSelected}
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
        max-width: var(--max-content-width);
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
        position: relative;

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

    .badge {
        position: absolute;
        top: 8px;
        right: 8px;
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        background: var(--color-notification-negative-background);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        z-index: 1;
    }

    .icon-container {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
    }

    .info-container {
        flex: 1;
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

    .type-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        :global(svg) {
            width: 20px;
            height: 20px;
            stroke: var(--color-content-icon-secondary);
        }
    }

    .form-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
        flex-shrink: 0;
        margin-top: auto;
    }

    .no-password-message {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 16px;
        background: var(--color-cards-regular-base-default);
        border-radius: 12px;
        outline: 1px solid var(--color-cards-regular-border-default);
        outline-offset: -1px;

        :global(svg) {
            width: 20px;
            height: 20px;
            stroke: var(--color-content-icon-primary);
        }

        span {
            font-size: 14px;
            font-weight: 500;
            line-height: 20px;
            color: var(--color-content-text-inverted);
        }
    }
</style>
