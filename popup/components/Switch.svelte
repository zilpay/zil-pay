<script lang="ts">
  type Size = 'small' | 'medium' | 'large';

  let {
    checked = $bindable(false),
    disabled = false,
    size = 'medium' as Size,
    id = '',
    name = '',
    ariaLabel = 'Toggle switch',
    onChange = (_newChecked: boolean) => {}
  }: {
    checked?: boolean;
    disabled?: boolean;
    size?: Size;
    id?: string;
    name?: string;
    ariaLabel?: string;
    onChange?: (newChecked: boolean) => void;
  } = $props();

  function handleToggle() {
    if (disabled) return;
    checked = !checked;
    onChange(checked);
  }

  const sizeClassMap: Record<Size, string> = {
    small: 'switch--small',
    medium: 'switch--medium',
    large: 'switch--large'
  };

  const sizeClass = $derived(sizeClassMap[size] ?? sizeClassMap.medium);
</script>

<div class={`switch ${sizeClass} ${disabled ? 'disabled' : ''}`} role="switch" aria-checked={checked ? 'true' : 'false'} aria-label={ariaLabel}>
  <button
    {id}
    {name}
    type="button"
    class="switch-button"
    onclick={handleToggle}
    {disabled}
    aria-pressed={checked}
    aria-labelledby="box"
  >
    <span class="switch-track"></span>
    <span class="switch-thumb" class:checked={checked}></span>
  </button>
</div>

<style lang="scss">
  .switch {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &.disabled .switch-button {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .switch-button {
      position: relative;
      appearance: none;
      background: none;
      outline: none;
      cursor: pointer;
      border: none;
      padding: 0;
      margin: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;

      .switch-track {
        width: 44px;
        height: 24px;
        background-color: var(--card-background);
        border-radius: 9999px;
        box-shadow: inset 0 0 1px rgba(0,0,0,0.2);
        transition: background-color 0.3s ease;
      }

      .switch-thumb {
        position: absolute;
        left: 3px;
        top: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background-color: var(--primary-purple);
        transition: transform 0.25s ease-in-out;

        &.checked {
          transform: translateX(20px);
        }
      }
    }

    &.switch--small .switch-button {
      .switch-track {
        width: 36px;
        height: 20px;
      }

      .switch-thumb {
        width: 14px;
        height: 14px;
        top: 3px;
        left: 3px;

        &.checked {
          transform: translateX(16px);
        }
      }
    }

    &.switch--large .switch-button {
      .switch-track {
        width: 52px;
        height: 28px;
      }

      .switch-thumb {
        width: 22px;
        height: 22px;
        top: 3px;
        left: 3px;

        &.checked {
          transform: translateX(24px);
        }
      }
    }
  }
</style>
