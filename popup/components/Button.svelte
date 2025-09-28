<script lang="ts">
  export let width: string = '100%';
  export let height: number = 56;
  export let loading: boolean = false;
</script>

<button
  {...$$restProps}
  style:width={width}
  style:height={`${height}px`}
  disabled={loading || $$restProps.disabled}
  class:loading
>
  {#if loading}
    <div class="loading-spinner"></div>
  {:else}
    <span class="text">
      <slot />
    </span>
  {/if}
</button>

<style lang="scss">
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: none;
    border-radius: 16px;
    padding: 0 16px;
    background-color: var(--color-button-regular-primary-default);
    color: #FFFFFF;
    transform-origin: center;
    transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    transform: scale(1);
    position: relative;
    box-shadow: 0 4px 15px color-mix(in srgb, var(--color-button-regular-primary-default) 30%, transparent);

    &:hover:not(:disabled) {
        background-color: var(--color-button-regular-primary-hover);
        transform: scale(1.02);
        box-shadow: 0 6px 20px color-mix(in srgb, var(--color-button-regular-primary-default) 40%, transparent);
    }

    &:active:not(:disabled) {
        background-color: var(--color-button-regular-primary-pressed);
        transform: scale(0.98);
    }

    &:disabled {
        cursor: not-allowed;
        background-color: color-mix(in srgb, var(--color-button-regular-primary-default) 50%, transparent);
        color: color-mix(in srgb, #FFFFFF 60%, transparent);
        box-shadow: none;
    }

    &.loading {
        cursor: not-allowed;
    }
  }

  .text {
    font-weight: bold;
    font-size: var(--font-size-large);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid #FFFFFF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .secondary {
    background-color: var(--color-button-regular-secondary-default);

    &:hover:not(:disabled) {
      background-color: var(--color-button-regular-secondary-hover);
    }

    &:active:not(:disabled) {
      background-color: var(--color-button-regular-secondary-pressed);
    }

    &:disabled {
      background-color: color-mix(in srgb, var(--color-button-regular-secondary-default) 50%, transparent);
    }
  }
</style>
