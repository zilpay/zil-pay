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
    gap: 10px;
    background: var(--background-color);
    border-radius: 8px;
    padding: 14px 16px;
    border: 1px solid color-mix(in srgb, var(--text-secondary) 20%, transparent);
    min-width: 0;
  }

  .word-index {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    min-width: 20px;
    flex-shrink: 0;
  }

  .word-text {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
