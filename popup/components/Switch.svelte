<script lang="ts">
  let {
    checked = $bindable(false),
    disabled = false,
    id = '',
    name = '',
    ariaLabel = '',
    onChange = (_newChecked: boolean) => {}
  }: {
    checked?: boolean;
    disabled?: boolean;
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
</script>

<button
  {id}
  {name}
  type="button"
  role="switch"
  aria-checked={checked}
  aria-label={ariaLabel}
  class="switch-button"
  class:checked
  class:disabled
  onclick={handleToggle}
  {disabled}
>
  <span class="switch-track"></span>
  <span class="switch-thumb"></span>
</button>

<style lang="scss">
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
    width: 44px;
    height: 24px;
    flex-shrink: 0;

    &.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .switch-track {
    width: 100%;
    height: 100%;
    background-color: var(--color-controls-toggle-main-off);
    border-radius: 9999px;
    transition: background-color 0.2s ease;
  }
  
  .switch-button.checked .switch-track {
    background-color: var(--color-controls-toggle-main-on);
  }

  .switch-thumb {
    position: absolute;
    left: 2px;
    top: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: var(--color-controls-toggle-main-fg-switcher);
    transition: transform 0.2s ease-in-out;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .switch-button.checked .switch-thumb {
    transform: translateX(20px);
  }
</style>
