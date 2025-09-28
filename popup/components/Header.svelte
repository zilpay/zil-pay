<script lang="ts">
    import type { Snippet } from 'svelte';
    import RoundImageButton from './RoundImageButton.svelte';
    import FullScreenIcon from './icons/FullScreen.svelte';
    import RefreshIcon from './icons/Refresh.svelte';
    import LinkIcon from './icons/Link.svelte';
    import LockIcon from './icons/Locker.svelte';

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
        settingsDisabled = false,
        lockDisabled = false,
        onNetworkButton = () => {},
        onExpand = () => {},
        onRefresh = () => {},
        onSettings = () => {},
        onLock = () => {},
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
        settingsDisabled?: boolean;
        lockDisabled?: boolean;
        onNetworkButton?: () => void;
        onExpand?: () => void;
        onRefresh?: () => void;
        onSettings?: () => void;
        onLock?: () => void;
        left?: Snippet;
    } = $props();
</script>

<header class="system-header">
    <div class="header-left">
        {#if showNetworkButton}
            <RoundImageButton
                imageSrc={networkImageSrc}
                alt={networkImageAlt}
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
                class:disabled={settingsDisabled}
                onclick={settingsDisabled ? undefined : onSettings}
                disabled={settingsDisabled}
                aria-label="Explorer Link"
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
        padding-left: 12px ;
        padding-right: 12px ;
        background: var(--color-neutral-background-base);
        border-bottom: 1px solid var(--color-neutral-border-default);
        min-height: 40px;
        box-sizing: border-box;
    }

    .header-left {
        display: flex;
        align-items: center;
        flex: 1;
    }

    .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .system-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: 0;
        background: transparent;
        border: none;
        border-radius: 50%;
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
            width: 20px;
            height: 20px;
        }
    }
</style>
