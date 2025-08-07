<script module lang="ts">
  export interface OptionData<T> {
    value: T;
    title: string;
    subtitle: string;
    description: string;
  }
</script>

<script lang="ts" generics="T">
  let {
    options = [],
    selected = $bindable(),
    name = '',
    onSelect = () => {}
  }: {
    options: OptionData<T>[];
    selected: T;
    name: string;
    onSelect?: (value: T) => void;
  } = $props();

  function handleSelect(value: T) {
    selected = value;
    onSelect(value);
  }
</script>

<div class="radio-options">
  {#each options as option}
    <label class="radio-option" class:selected={selected === option.value}>
      <input 
        type="radio" 
        {name}
        value={option.value}
        checked={selected === option.value}
        onchange={() => handleSelect(option.value)}
        class="radio-input"
      />
      <div class="option-content">
        <div class="option-header">
          <span class="option-title">{option.title}</span>
        </div>
        <div class="option-subtitle">{option.subtitle}</div>
        <div class="option-description">{option.description}</div>
      </div>
      <div class="option-indicator"></div>
    </label>
  {/each}
</div>

<style lang="scss">
  .radio-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .radio-option {
    display: flex;
    align-items: center;
    padding: 16px;
    background: var(--card-background);
    border: 2px solid transparent;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    &.selected {
      border-color: var(--primary-purple);
      background: color-mix(in srgb, var(--primary-purple) 8%, var(--card-background));

      .option-title {
        color: var(--primary-purple);
      }

      .option-indicator {
        opacity: 1;
      }
    }

    &:hover:not(.selected) {
      border-color: color-mix(in srgb, var(--primary-purple) 30%, transparent);
    }
  }

  .radio-input {
    display: none;
  }

  .option-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .option-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .option-title {
    font-size: var(--font-size-medium);
    font-weight: 600;
    color: var(--text-primary);
  }

  .option-subtitle {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--primary-purple);
  }

  .option-description {
    font-size: var(--font-size-small);
    color: var(--text-secondary);
    line-height: 1.3;
  }

  .option-indicator {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--text-secondary);
    opacity: 0.3;
    position: relative;
    flex-shrink: 0;
    margin-left: 12px;
    transition: all 0.2s ease;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary-purple);
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }

  .radio-option.selected .option-indicator {
    border-color: var(--primary-purple);
    opacity: 1;

    &::after {
      opacity: 1;
    }
  }

  @media (max-width: 480px) {
    .radio-option {
      padding: 12px;
    }

    .option-title {
      font-size: var(--font-size-small);
    }

    .option-subtitle,
    .option-description {
      font-size: calc(var(--font-size-small) * 0.9);
    }
  }

  @media (max-width: 360px) {
    .radio-option {
      padding: 10px;
    }
  }
</style>
