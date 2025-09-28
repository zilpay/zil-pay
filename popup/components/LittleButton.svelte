<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    onclick = () => {},
    disabled = false,
    children,
    rightIcon = undefined
  }: {
    onclick?: () => void;
    disabled?: boolean;
    children: Snippet;
    rightIcon?: Snippet;
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
  {#if rightIcon}
    {@render rightIcon()}
  {/if}
</button>

<style lang="scss">
  .little-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
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

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
      color: var(--color-content-text-secondary);
    }

    :global(svg) {
      width: 16px;
      height: 16px;
    }
  }
</style>
