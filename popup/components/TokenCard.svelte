<script lang="ts">
  import FastImg from './FastImg.svelte';

  let {
    balance = '0',
    symbol = '',
    imageUrl = '',
    convertedBalance = '0.00',
    loading = false,
    disabled = false,
    onSelect = () => {}
  }: {
    balance?: string;
    symbol?: string;
    imageUrl?: string;
    convertedBalance?: string;
    loading?: boolean;
    disabled?: boolean;
    onSelect?: () => void;
  } = $props();

  function handleClick() {
    if (!disabled && !loading) {
      onSelect();
    }
  }
</script>

<button
  class="token-card"
  class:disabled={disabled}
  class:loading={loading}
  onclick={handleClick}
  type="button"
  aria-label={`Select ${symbol} token`}
>
  <div class="card-header">
    <div class="symbol">
      {symbol}
    </div>
    <div class="token-icon">
      {#if imageUrl}
        <FastImg
          src={imageUrl}
          alt={symbol}
          class="icon-image"
        />
      {:else}
        <div class="icon-placeholder">
          {symbol.charAt(0)}
        </div>
      {/if}
    </div>
  </div>
  
  <div class="card-body">
    <div class="balance">
      {balance}
    </div>
    <div class="converted">
      {convertedBalance}
    </div>
  </div>
</button>

<style lang="scss">
  .token-card {
    display: flex;
    flex-direction: column;
    width: 142px;
    height: 100px;
    padding: 12px;
    margin: 3px;
    background: var(--card-background);
    border: 2px solid var(--card-background);
    border-radius: 12px;
    cursor: pointer;
    text-align: left;

    &:hover:not(:disabled) {
      border-color: var(--primary-purple);
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.6;
      
      &:hover {
        border-color: var(--card-background);
      }
    }

    &.loading {
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          color-mix(in srgb, var(--primary-purple) 30%, transparent),
          transparent
        );
        animation: loading-shimmer 1.5s infinite;
      }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }

  .symbol {
    font-size: var(--font-size-large);
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1;
  }

  .token-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--background-color);
  }

  .icon-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--primary-purple), color-mix(in srgb, var(--primary-purple) 80%, #000));
    color: white;
    font-size: var(--font-size-small);
    font-weight: 700;
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    justify-content: flex-end;
  }

  .balance {
    font-size: var(--font-size-large);
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .converted {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--text-secondary);
    line-height: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.8;
  }

  :global(.token-card .icon-image) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @keyframes loading-shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  @media (max-width: 480px) {
    .token-card {
      width: 130px;
      height: 90px;
      padding: 10px;
    }

    .symbol {
      font-size: var(--font-size-medium);
    }

    .balance {
      font-size: var(--font-size-medium);
    }

    .converted {
      font-size: calc(var(--font-size-small) * 0.9);
    }

    .token-icon {
      width: 24px;
      height: 24px;
    }
  }

</style>
