<script lang="ts">
  export let width: string = '100%';
  export let height: number = 56;
</script>

<button
  {...$$restProps}
  style:width={width}
  style:height={`${height}px`}
>
  <span class="text">
    <slot />
  </span>
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
  }

  button:active:not(:disabled) {
    transform: scale(0.9);
  }

  button:disabled {
    cursor: not-allowed;
    background-color: color-mix(in srgb, var(--button-background) 50%, transparent);
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

  .secondary {
      background-color: var(--secondary-purple);
  }
</style>
