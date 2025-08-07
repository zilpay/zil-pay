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
    border-radius: 30px;
    padding: 0 16px;
    background-color: var(--button-background);
    transform-origin: center;
    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    transform: scale(1);
    position: relative;
  }

  button:active:not(:disabled) {
    transform: scale(0.9);
  }

  button:disabled {
    cursor: not-allowed;
    background-color: color-mix(in srgb, var(--button-background) 50%, transparent);
  }

  button.loading {
    cursor: not-allowed;
  }

  .text {
    font-weight: bold;
    font-size: var(--font-size-large);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--button-text);
  }

  button:disabled .text {
    color: color-mix(in srgb, var(--button-text) 50%, transparent);
  }

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid color-mix(in srgb, var(--button-text) 30%, transparent);
    border-top: 2px solid var(--button-text);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .secondary {
      background-color: var(--secondary-purple);
  }
</style>
