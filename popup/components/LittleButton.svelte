<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    onclick = () => {},
    disabled = false,
    children
  }: {
    onclick?: () => void;
    disabled?: boolean;
    children: Snippet;
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
    background: transparent;
    border: none;
    color: var(--color-content-text-purple);
    font-size: var(--font-size-medium);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 6px 12px;
    border-radius: 8px;

    &:hover:not(:disabled) {
      background-color: var(--color-button-regular-quaternary-hover);
    }

    &:focus:not(:disabled) {
      outline: none;
      background-color: var(--color-button-regular-quaternary-pressed);
    }

    &:active:not(:disabled) {
      transform: scale(0.97);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
      color: var(--color-content-text-secondary);
    }
  }
</style>
