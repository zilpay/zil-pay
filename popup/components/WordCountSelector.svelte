<script lang="ts">
  type Props = {
    wordCounts?: number[];
    selected?: number;
    onSelect?: (val: number) => void;
  };

  let {
    wordCounts = [12, 15, 18, 21, 24],
    selected,
    onSelect = () => {}
  }: Props = $props();
  selected = selected ?? wordCounts[0];

  const countIndex = $derived(wordCounts.indexOf(selected));
</script>

<div class="selector-wrapper">
  <div
    class="background-highlight"
    style="--index: {countIndex}; --count: {wordCounts.length};"
  ></div>

  <div class="options">
    {#each wordCounts as count}
      <button
        class:selected={count === selected}
        onclick={() => onSelect(count)}
      >
        {count}
      </button>
    {/each}
  </div>
</div>

<style lang="scss">
  .selector-wrapper {
    position: relative;
    width: 100%;
    height: 48px;
    padding: 0 4px;
    background-color: var(--card-background);
    border-radius: 8px;
    overflow: hidden;
  }

  .background-highlight {
    position: absolute;
    top: 0;
    bottom: 0;
    width: calc(100% / var(--count));
    left: calc((100% / var(--count)) * var(--index));
    background-color: var(--primary-purple);
    border-radius: 8px;
    transition: left 0.3s ease-in-out;
    z-index: 0;
  }

  .options {
    position: relative;
    display: flex;
    height: 100%;
    z-index: 1;

    button {
      flex: 1;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      z-index: 1;
      font-weight: normal;
      color: var(--text-secondary);
      transition: color 0.2s ease;

      &.selected {
        color: white;
        font-weight: bold;
      }

      &:focus {
        outline: none;
      }
    }
  }
</style>
