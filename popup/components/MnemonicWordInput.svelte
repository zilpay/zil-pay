<script lang="ts">
  let {
    index = 1,
    word = '',
    isEditable = false,
    borderColor = undefined,
    errorBorderColor = undefined,
    hasError = false,
    opacity = 1,
    onChanged = undefined
  }: {
    index: number;
    word: string;
    isEditable?: boolean;
    borderColor?: string;
    errorBorderColor?: string;
    hasError?: boolean;
    opacity?: number;
    onChanged?: (index: number, value: string) => void;
  } = $props();

  let inputValue = $state(word);
  let shouldUpdateFromProps = $state(true);

  $effect(() => {
    if (shouldUpdateFromProps && word !== inputValue) {
      inputValue = word;
    }
    shouldUpdateFromProps = true;
  });

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    shouldUpdateFromProps = false;
    inputValue = target.value;
    
    if (onChanged) {
      onChanged(index, target.value);
    }
  }
</script>

<div 
  class="mnemonic-word-input"
  class:has-error={hasError}
  class:has-custom-border={borderColor && !hasError}
  style="
    opacity: {opacity};
    --custom-border-color: {borderColor || 'transparent'};
    --custom-error-color: {errorBorderColor || 'var(--danger-color)'};
  "
>
  <span class="word-index">
    {index}
  </span>
  <input
    type="text"
    value={inputValue}
    disabled={!isEditable}
    class="word-input"
    oninput={handleInput}
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
  />
</div>

<style lang="scss">
  .mnemonic-word-input {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background-color: var(--card-background);
    border-radius: 12px;
    border: 1px solid transparent;
    transition: border-color 0.2s ease;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
    
    &.has-custom-border {
      border-color: var(--custom-border-color);
    }
    
    &.has-error {
      border-color: var(--custom-error-color);
      
      .word-index {
        color: var(--custom-error-color);
      }
      
      .word-input {
        color: var(--custom-error-color);
      }
    }
  }

  .word-index {
    font-size: var(--font-size-small);
    font-weight: 600;
    color: var(--text-secondary);
    min-width: 16px;
    flex-shrink: 0;
    line-height: 1;
    text-align: center;
  }

  .word-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--text-primary);
    outline: none;
    padding: 0;
    min-width: 0;
    width: 100%;
    
    &:disabled {
      cursor: default;
      user-select: none;
    }
    
    &::placeholder {
      color: var(--text-secondary);
      opacity: 0.5;
      font-style: italic;
    }
    
    &:focus {
      outline: none;
    }
  }

  @media (max-width: 480px) {
    .mnemonic-word-input {
      padding: 8px 10px;
      gap: 6px;
    }
    
    .word-index {
      min-width: 14px;
      font-size: calc(var(--font-size-small) * 0.9);
    }
    
    .word-input {
      font-size: calc(var(--font-size-small) * 0.9);
    }
  }
</style>
