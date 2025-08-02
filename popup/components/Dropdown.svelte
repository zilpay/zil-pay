<script lang="ts">
  type DropdownOption = {
    code: string;
    label: string;
  };

  let {
    options = [],
    selected = $bindable(''),
    placeholder = 'Select option',
    onSelect = () => {},
    disabled = false,
    width = '100%'
  }: {
    options: DropdownOption[];
    selected: string;
    placeholder?: string;
    onSelect?: (code: string) => void;
    disabled?: boolean;
    width?: string;
  } = $props();

  let isOpen = $state(false);

  const selectedOption = $derived(
    options.find(option => option.code === selected) || null
  );

  function toggleDropdown() {
    if (disabled) return;
    isOpen = !isOpen;
  }

  function selectOption(code: string) {
    selected = code;
    isOpen = false;
    onSelect(code);
  }

  function handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      isOpen = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (disabled) return;
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        toggleDropdown();
        break;
      case 'Escape':
        isOpen = false;
        break;
      case 'ArrowDown':
        if (!isOpen) {
          event.preventDefault();
          isOpen = true;
        } else {
          event.preventDefault();
        }
        break;
      case 'ArrowUp':
        if (isOpen) {
          event.preventDefault();
        }
        break;
    }
  }

  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
      return () => {
        document.removeEventListener('click', handleOutsideClick);
      };
    }
  });
</script>

<div class="dropdown-container" style="width: {width}">
  <button 
    class="dropdown-trigger"
    class:open={isOpen}
    class:disabled={disabled}
    onclick={toggleDropdown}
    onkeydown={handleKeydown}
    type="button"
    aria-expanded={isOpen}
    aria-haspopup="listbox"
    {disabled}
  >
    <span class="selected-content">
      {#if selectedOption}
        <span class="option-label">{selectedOption.label}</span>
        <span class="option-code">({selectedOption.code})</span>
      {:else}
        <span class="placeholder">{placeholder}</span>
      {/if}
    </span>
    <span class="dropdown-arrow" class:rotated={isOpen}>▼</span>
  </button>

  {#if isOpen && !disabled}
    <div class="dropdown-menu" role="listbox">
      {#each options as option}
        <button
          class="dropdown-item"
          class:selected={option.code === selected}
          onclick={() => selectOption(option.code)}
          type="button"
          role="option"
          aria-selected={option.code === selected}
        >
          <span class="item-content">
            <span class="option-label">{option.label}</span>
            <span class="option-code">({option.code})</span>
          </span>
          {#if option.code === selected}
            <span class="check-mark">✓</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .dropdown-container {
    position: relative;
  }

  .dropdown-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 16px;
    background-color: var(--card-background);
    border: 2px solid color-mix(in srgb, var(--text-secondary) 20%, transparent);
    border-radius: 12px;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-primary);
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      border-color: color-mix(in srgb, var(--primary-purple) 30%, transparent);
    }

    &:focus {
      outline: none;
      border-color: var(--primary-purple);
    }

    &.open {
      border-color: var(--primary-purple);
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.6;
      background-color: color-mix(in srgb, var(--card-background) 50%, transparent);
    }
  }

  .selected-content {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
    flex: 1;
  }

  .option-label {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .option-code {
    font-size: 12px;
    color: var(--text-secondary);
    opacity: 0.8;
    flex-shrink: 0;
  }

  .placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
    font-style: italic;
  }

  .dropdown-arrow {
    font-size: 12px;
    color: var(--text-secondary);
    transition: transform 0.2s ease;
    flex-shrink: 0;

    &.rotated {
      transform: rotate(180deg);
    }
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--card-background);
    border: 2px solid var(--primary-purple);
    border-top: none;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 8px 24px color-mix(in srgb, var(--primary-purple) 15%, transparent);
    z-index: 1000;
    max-height: 280px;
    overflow-y: auto;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 16px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-primary);
    transition: background-color 0.2s ease;
    text-align: left;

    &:hover {
      background-color: color-mix(in srgb, var(--primary-purple) 10%, transparent);
    }

    &:focus {
      outline: none;
      background-color: color-mix(in srgb, var(--primary-purple) 15%, transparent);
    }

    &.selected {
      background-color: color-mix(in srgb, var(--primary-purple) 20%, transparent);
      
      .option-label {
        color: var(--primary-purple);
        font-weight: 600;
      }
    }

    &:last-child {
      border-radius: 0 0 10px 10px;
    }
  }

  .item-content {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
    flex: 1;
  }

  .check-mark {
    color: var(--primary-purple);
    font-weight: bold;
    font-size: 16px;
    flex-shrink: 0;
  }

  /* Scrollbar styling */
  .dropdown-menu::-webkit-scrollbar {
    width: 6px;
  }

  .dropdown-menu::-webkit-scrollbar-track {
    background: transparent;
  }

  .dropdown-menu::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--text-secondary) 30%, transparent);
    border-radius: 3px;

    &:hover {
      background: color-mix(in srgb, var(--text-secondary) 50%, transparent);
    }
  }

  @media (max-width: 480px) {
    .dropdown-trigger,
    .dropdown-item {
      padding: 10px 12px;
      font-size: 13px;
    }

    .option-code {
      font-size: 11px;
    }
  }
</style>
