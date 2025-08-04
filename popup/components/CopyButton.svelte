<script lang="ts">
  let {
    text = '',
    ariaLabel = '',
    size = 44,
    disabled = false
  }: {
    text: string;
    ariaLabel?: string;
    size?: number;
    disabled?: boolean;
  } = $props();

  let isCopied = $state(false);

  async function handleCopy() {
    if (!text || disabled) return;
    
    try {
      await navigator.clipboard.writeText(text);
      isCopied = true;
      setTimeout(() => {
        isCopied = false;
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  }
</script>

<button
  class="copy-button"
  onclick={handleCopy}
  disabled={disabled || !text}
  aria-label={ariaLabel}
  style="width: {size}px; height: {size}px;"
>
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
  >
    {#if isCopied}
      <path
        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
        fill="currentColor"
      />
    {:else}
      <path
        d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
        fill="currentColor"
      />
    {/if}
  </svg>
</button>

<style lang="scss">
  .copy-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--card-background);
    border: 2px solid transparent;
    border-radius: 10px;
    cursor: pointer;
    color: var(--primary-purple);
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover:not(:disabled) {
      border-color: color-mix(in srgb, var(--primary-purple) 30%, transparent);
      background: color-mix(in srgb, var(--card-background) 95%, var(--primary-purple));
    }

    &:focus {
      outline: none;
      border-color: var(--primary-purple);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
      color: var(--text-secondary);
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }
  }

  @media (max-width: 480px) {
    .copy-button {
      svg {
        width: 18px;
        height: 18px;
      }
    }
  }

  @media (max-width: 360px) {
    .copy-button {
      svg {
        width: 16px;
        height: 16px;
      }
    }
  }
</style>
