<script module lang="ts">
  export type AddressCopySize = "Small" | "Medium" | "Large";
</script>

<script lang="ts">
  import { truncate } from "popup/mixins/address";

  let {
    address,
    title,
    size = "Small",
  }: {
    address: string;
    title: string;
    size?: AddressCopySize;
  } = $props();

  let isCopied = $state(false);
  let copyTimeoutId: number | null = $state(null);

  const truncatedAddress = $derived.by(() => truncate(address));

  async function handleCopy() {
    if (isCopied) return;

    try {
      await navigator.clipboard.writeText(address);
      isCopied = true;

      if (copyTimeoutId) {
        clearTimeout(copyTimeoutId);
      }

      copyTimeoutId = setTimeout(() => {
        isCopied = false;
        copyTimeoutId = null;
      }, 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    event.preventDefault();
    handleCopy();
  }
</script>

<div class="address-copy-container">
  <h3 class="title">{title}</h3>
  <button
    class:small={size === "Small"}
    class:medium={size === "Medium"}
    class:large={size === "Large"}
    class:copied={isCopied}
    class="copy-button"
    onclick={handleCopy}
    onkeydown={handleKeydown}
    title={address}
    aria-label={`Copy address: ${address}`}
    type="button"
  >
    <span class="address-text">
      {truncatedAddress}
    </span>
    <span class="icon-container">
      <svg class="copy-icon" viewBox="0 0 24 24">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
      </svg>
      <svg class="check-icon" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    </span>
  </button>
</div>

<style lang="scss">
  .address-copy-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .title {
    font-size: var(--font-size-large);
    font-weight: 600;
    color: var(--text-secondary);
    margin: 0;
  }

  .copy-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid color-mix(in srgb, var(--text-secondary) 15%, transparent);
    border-radius: 12px;
    background-color: var(--card-background);
    color: var(--text-primary);
    font-family: 'Courier New', monospace;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
    width: auto;

    &:hover {
      border-color: var(--primary-purple);
      background-color: color-mix(in srgb, var(--primary-purple) 10%, transparent);
    }

    &:focus {
      outline: none;
      border-color: var(--primary-purple);
    }

    &.small {
      padding: 6px 10px;
      font-size: var(--font-size-small);
      .icon-container svg {
        width: 14px;
        height: 14px;
      }
    }

    &.medium {
      padding: 8px 12px;
      font-size: var(--font-size-medium);
      .icon-container svg {
        width: 16px;
        height: 16px;
      }
    }

    &.large {
      padding: 10px 16px;
      font-size: var(--font-size-large);
      border-radius: 16px;
      .icon-container svg {
        width: 18px;
        height: 18px;
      }
    }

    .icon-container {
      display: flex;
      align-items: center;
      position: relative;
      width: 1em;
      height: 1em;

      svg {
        position: absolute;
        transition: opacity 0.3s ease, transform 0.3s ease;
        fill: currentColor;
        width: 100%;
        height: 100%;
      }

      .copy-icon {
        opacity: 1;
        transform: scale(1);
      }
      .check-icon {
        opacity: 0;
        transform: scale(0.7);
      }
    }

    &.copied {
      background-color: color-mix(in srgb, var(--success-color) 10%, transparent);
      border-color: var(--success-color);
      color: var(--success-color);

      .icon-container .copy-icon {
        opacity: 0;
        transform: scale(0.7);
      }
      .icon-container .check-icon {
        opacity: 1;
        transform: scale(1);
      }
    }
  }
</style>
