<script lang="ts">
  let {
    onclick = () => {},
    disabled = false,
    children
  } = $props();
</script>

<button
  class="little-button"
  class:disabled
  onclick={() => onclick()}
  {disabled}
  type="button"
>
  {@render children()}
</button>

<style lang="scss">
  .little-button {
    background: none;
    border: none;
    color: var(--primary-purple);
    font-size: var(--font-size-medium);
    font-weight: 500;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 4px;
    transition: all 0.2s ease;
    padding: 8px 16px;
    border-radius: 8px;

    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--primary-purple) 8%, transparent);
      text-decoration: none;
    }

    &:focus:not(:disabled) {
      outline: none;
      background: color-mix(in srgb, var(--primary-purple) 12%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-purple) 20%, transparent);
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
      color: var(--text-secondary);
    }
  }

  @media (max-width: 480px) {
    .little-button {
      font-size: var(--font-size-small);
      padding: 6px 12px;
    }
  }
</style>
