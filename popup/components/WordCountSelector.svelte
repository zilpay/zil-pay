<script lang="ts">
  let {
    wordCounts = [12, 15, 18, 21, 24],
    selected = $bindable(),
    onSelect = () => {}
  } = $props();

  if (selected === undefined) {
    selected = wordCounts[0];
  }

  const countIndex = $derived(wordCounts.indexOf(selected));

  function handleSelect(count: number) {
    selected = count;
    onSelect(count);
  }
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
        onclick={() => handleSelect(count)}
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
    padding: 4px;
    background-color: var(--card-background);
    border-radius: 12px;
    overflow: hidden;
  }

  .background-highlight {
    position: absolute;
    top: 4px;
    bottom: 4px;
    width: calc((100% - 8px) / var(--count));
    left: calc(4px + ((100% - 8px) / var(--count)) * var(--index));
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
      font-size: var(--font-size-large);
      font-weight: 500;
      cursor: pointer;
      color: var(--text-secondary);
      transition: color 0.2s ease;
      border-radius: 8px;

      &.selected {
        color: white;
        font-weight: 600;
      }

      &:hover:not(.selected) {
        color: var(--text-primary);
      }

      &:focus {
        outline: none;
      }
    }
  }
</style>
