<script lang="ts">
    import type { Snippet } from 'svelte';
    import RoundImageButton from './RoundImageButton.svelte';
    import FullScreenIcon from './icons/FullScreen.svelte';
    import RefreshIcon from './icons/Refresh.svelte';
    import LinkIcon from './icons/Link.svelte';
    import LockIcon from './icons/Locker.svelte';
    import { logout } from 'popup/background/wallet';
    import { push } from '../router/navigation';
    import globalStore from 'popup/store/global';
    import { linksExpand, openAddressInExplorer } from 'popup/mixins/links';
    import { hashChainConfig } from 'lib/utils/hashing';


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
      const chain = $globalStore.chains.find
          ((c) => account.chainHash == hashChainConfig(c.chainIds, c.slip44, c.chain)
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
    }

    .header-right {
        display: flex;
        align-items: center;
        gap: 4px;
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
