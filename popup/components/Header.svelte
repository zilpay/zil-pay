<script lang="ts">
    import type { Snippet } from 'svelte';
    import { Runtime } from 'lib/runtime';
    import { hashXOR } from 'lib/utils/hashing';
    import { hexToUint8Array } from 'lib/utils/hex';
    import globalStore from 'popup/store/global';
    import { linksExpand, openAddressInExplorer } from 'popup/mixins/links';
    import { hashChainConfig } from 'lib/utils/hashing';

    import RoundImageButton from './RoundImageButton.svelte';
    import FullScreenIcon from './icons/FullScreen.svelte';
    import RefreshIcon from './icons/Refresh.svelte';
    import LinkIcon from './icons/Link.svelte';
    import LockIcon from './icons/Locker.svelte';
    import FastImg from './FastImg.svelte';
    import { logout } from 'popup/background/wallet';
    import { push } from '../router/navigation';

    let {
        showNetworkButton = true,
        networkImageSrc = '',
        networkImageAlt = '',
        networkButtonDisabled = false,
        showExpand = true,
        showRefresh = true,
        showSettings = true,
        showLock = true,
        expandDisabled = false,
        refreshDisabled = false,
        lockDisabled = false,
        isTestnet = false,
        onRefresh = () => {},
        left = undefined
    }: {
        showNetworkButton?: boolean;
        networkImageSrc?: string;
        networkImageAlt?: string;
        networkButtonDisabled?: boolean;
        showExpand?: boolean;
        showRefresh?: boolean;
        showSettings?: boolean;
        showLock?: boolean;
        expandDisabled?: boolean;
        refreshDisabled?: boolean;
        lockDisabled?: boolean;
        isTestnet?: boolean;
        onRefresh?: () => void;
        left?: Snippet;
    } = $props();

    let tabOrigin = $state<string | null>(null);
    let tabFavicon = $state<string | null>(null);
    let isConnected = $state(false);
    let isLoadingTab = $state(true);

    $effect(() => {
        async function getTabInfo() {
            isLoadingTab = true;
            try {
                const [tab] = await Runtime.tabs.query({ active: true, lastFocusedWindow: true });
                if (!tab?.url || !tab.url.startsWith('http')) {
                    tabOrigin = null;
                    return;
                }
                
                const url = new URL(tab.url);
                const hostname = url.hostname;
                tabOrigin = hostname;
                tabFavicon = tab.favIconUrl || null;

                const wallet = $globalStore.wallets[$globalStore.selectedWallet];
                const account = wallet?.accounts[wallet.selectedAccount];
                const connections = $globalStore.connections;

                if (account?.pubKey && connections?.list) {
                    const accountPubKeyBytes = hexToUint8Array(account.pubKey);
                    const accountHash = hashXOR(accountPubKeyBytes);
                    const connection = connections.list.find(c => c.domain === hostname);

                    isConnected = connection?.connectedAccounts.includes(accountHash) ?? false;
                } else {
                    isConnected = false;
                }
            } catch (e) {
                tabOrigin = null;
                isConnected = false;
            } finally {
                isLoadingTab = false;
            }
        }

        if ($globalStore.selectedWallet > -1) {
            getTabInfo();
        } else {
            isLoadingTab = false;
            tabOrigin = null;
        }
    });

    async function onLock() {
        const walletIndex = $globalStore.selectedWallet;
        await logout(walletIndex);
        push('/lock');
    };

    async function onNetworkButton() {
        push('/networks');
    };

    function onExpand() {
        linksExpand();
    };

    function onSettings() {
        const wallet = $globalStore.wallets[$globalStore.selectedWallet];
        const account = wallet.accounts[wallet.selectedAccount];
        const chain = $globalStore.chains.find(
            (c) => account.chainHash === hashChainConfig(c.chainIds, c.slip44, c.chain)
        );

        if (chain) {
            openAddressInExplorer(account.addr, chain);
        }
    };
</script>

<header class="system-header">
    <div class="header-left">
        {#if showNetworkButton}
            <RoundImageButton
                imageSrc={networkImageSrc}
                alt={networkImageAlt}
                isTestnet={isTestnet}
                disabled={networkButtonDisabled}
                onclick={onNetworkButton}
            />
        {/if}
        {#if left}
            {@render left()}
        {/if}
    </div>

    <div class="header-right">
        {#if !isLoadingTab && tabOrigin}
            <div
                class="connection-status"
                class:connected={isConnected}
                title={isConnected ? `Connected to ${tabOrigin}` : `Not connected to ${tabOrigin}`}
            >
                {#if tabFavicon}
                    <FastImg src={tabFavicon} alt="Site favicon" />
                {:else}
                    <LinkIcon />
                {/if}
            </div>
        {/if}
        {#if showExpand}
            <button
                class="system-button"
                class:disabled={expandDisabled}
                onclick={expandDisabled ? undefined : onExpand}
                disabled={expandDisabled}
                aria-label="Expand"
            >
                <FullScreenIcon />
            </button>
        {/if}

        {#if showRefresh}
            <button
                class="system-button"
                class:disabled={refreshDisabled}
                onclick={refreshDisabled ? undefined : onRefresh}
                disabled={refreshDisabled}
                aria-label="Refresh"
            >
                <RefreshIcon />
            </button>
        {/if}

        {#if showSettings}
            <button
                class="system-button"
                onclick={onSettings}
            >
                <LinkIcon />
            </button>
        {/if}

        {#if showLock}
            <button
                class="system-button"
                class:disabled={lockDisabled}
                onclick={lockDisabled ? undefined : onLock}
                disabled={lockDisabled}
                aria-label="Lock"
            >
                <LockIcon />
            </button>
        {/if}
    </div>
</header>

<style lang="scss">
    .system-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 60px;
        padding: 0 16px;
        background: var(--color-neutral-background-base);
        box-sizing: border-box;
        flex-shrink: 0;
    }

    .header-left {
        display: flex;
        align-items: center;
        flex: 1;
        gap: 8px;
    }

    .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .connection-status {
        width: 28px;
        height: 28px;
        padding: 3px;
        border-radius: 50%;
        border: 2px solid;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--color-neutral-background-base);
        flex-shrink: 0;

        &.connected {
            border-color: var(--color-inputs-border-success);
        }

        &:not(.connected) {
            border-color: var(--color-warning-text);
        }

        :global(img),
        :global(svg) {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            object-fit: cover;
        }

        :global(svg) {
            color: var(--color-content-icon-secondary);
        }
    }

    .system-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        background: transparent;
        border: 1px solid var(--color-neutral-border-default);
        border-radius: 6px;
        cursor: pointer;
        color: var(--color-content-icon-secondary);
        transition: all 0.2s ease;

        &:hover:not(:disabled) {
            background: var(--color-button-regular-quaternary-hover);
            color: var(--color-content-text-inverted);
        }

        &:focus-visible:not(:disabled) {
            outline: 2px solid var(--color-inputs-border-focus);
            outline-offset: 2px;
        }

        &:active:not(:disabled) {
            transform: scale(0.95);
        }

        &.disabled,
        &:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }

        :global(svg) {
            width: 24px;
            height: 24px;
        }
    }
</style>
