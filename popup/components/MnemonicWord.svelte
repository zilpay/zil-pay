<script lang="ts">
  let {
    index = 0,
    word = "",
    ...restProps
  } = $props();
</script>

<div class="mnemonic-word" {...restProps}>
  <span class="word-index">{index}</span>
  <span class="word-text">{word}</span>
</div>

<style lang="scss">
  .mnemonic-word {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-cards-regular-border-default);
    min-width: 0;
  }

  .word-index {
    font-size: var(--font-size-medium);
    font-weight: 500;
    color: var(--color-content-text-secondary);
    width: 24px;
    flex-shrink: 0;
  }

  .word-text {
    font-size: var(--font-size-large);
    font-weight: 500;
    color: var(--color-content-text-inverted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
