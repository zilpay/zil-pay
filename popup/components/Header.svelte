<script lang="ts">
  import type { Snippet } from 'svelte';
  import RoundImageButton from './RoundImageButton.svelte';

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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    {/if}

    {#if showSettings}
      <button
        class="system-button"
        class:disabled={settingsDisabled}
        onclick={settingsDisabled ? undefined : onSettings}
        disabled={settingsDisabled}
        aria-label="Settings"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
          <path d="M12 1v6m0 10v6m11-7h-6m-10 0H1m15.5-6.5l-4.24 4.24M6.74 6.74L2.5 2.5m15 15l-4.24-4.24M6.74 17.26L2.5 21.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="16" r="1" fill="currentColor"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2"/>
        </svg>
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
    padding: 12px 16px;
    background: var(--background-color);
    border-bottom: 1px solid color-mix(in srgb, var(--text-secondary) 10%, transparent);
    min-height: 48px;
    box-sizing: border-box;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
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
    width: 32px;
    height: 32px;
    padding: 0;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--text-secondary) 20%, transparent);
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--primary-purple) 10%, transparent);
      border-color: color-mix(in srgb, var(--primary-purple) 30%, transparent);
      color: var(--primary-purple);
    }

    &:focus:not(:disabled) {
      outline: none;
      background: color-mix(in srgb, var(--primary-purple) 15%, transparent);
      border-color: var(--primary-purple);
      color: var(--primary-purple);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-purple) 20%, transparent);
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }

    &.disabled,
    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
      background: transparent;
      color: var(--text-secondary);
      border-color: color-mix(in srgb, var(--text-secondary) 10%, transparent);

      &:hover {
        transform: none;
        background: transparent;
        border-color: color-mix(in srgb, var(--text-secondary) 10%, transparent);
        color: var(--text-secondary);
      }
    }

    svg {
      flex-shrink: 0;
    }
  }

  @media (max-width: 480px) {
    .system-header {
      padding: 10px 12px;
      min-height: 44px;
    }

    .header-left {
      gap: 8px;
    }

    .header-right {
      gap: 6px;
    }

    .system-button {
      width: 28px;
      height: 28px;

      svg {
        width: 14px;
        height: 14px;
      }
    }
  }

  @media (max-width: 360px) {
    .system-header {
      padding: 8px 10px;
      min-height: 40px;
    }

    .header-left {
      gap: 6px;
    }

    .header-right {
      gap: 4px;
    }

    .system-button {
      width: 26px;
      height: 26px;

      svg {
        width: 12px;
        height: 12px;
      }
    }
  }
</style>
