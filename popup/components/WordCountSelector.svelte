<script lang="ts">
  import { ALLOWED_COUNTS } from "config/bip39";

  let {
    wordCounts = ALLOWED_COUNTS,
    selected = $bindable(),
    onSelect = () => {}
  }: {
    wordCounts?: number[];
    selected: number;
    onSelect?: (count: number) => void;
  } = $props();

  function handleSelect(count: number) {
    selected = count;
    onSelect(count);
  }
</script>

<div class="selector-wrapper">
  {#each wordCounts as count}
    <button
      class:selected={count === selected}
      onclick={() => handleSelect(count)}
    >
      {count}
    </button>
  {/each}
</div>

<style lang="scss">
  .selector-wrapper {
    display: flex;
    width: 100%;
    height: 48px;
    padding: 4px;
    background-color: var(--color-controls-tabs-fg);
    border-radius: 12px;
    box-sizing: border-box;
  }

  button {
    flex: 1;
    background: none;
    border: none;
    font-size: var(--font-size-large);
    font-weight: 500;
    cursor: pointer;
    color: var(--color-content-text-secondary);
    transition: all 0.2s ease;
    border-radius: 8px;

    &.selected {
      background-color: var(--color-controls-tabs-selected);
      color: var(--color-content-text-primary);
      font-weight: 600;
    }

    &:hover:not(.selected) {
      color: var(--color-content-text-inverted);
    }

    &:focus {
      outline: none;
    }
  }
</style>
