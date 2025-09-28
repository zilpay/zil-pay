<script lang="ts">
  import OpenEyeIcon from './icons/Eye.svelte';
  import CloseEyeIcon from './icons/Hide.svelte';

  let {
    id = '',
    label = '',
    placeholder = '',
    value = $bindable(''),
    hide = $bindable(true),
    disabled = false,
    required = false,
    showToggle = true,
    width = '100%',
    hasError = false,
    errorMessage = '',
    ariaDescribedBy = '',
    oninput = (_e: Event) => null,
  }: {
    id?: string;
    label?: string;
    placeholder?: string;
    value?: string;
    hide?: boolean;
    disabled?: boolean;
    required?: boolean;
    showToggle?: boolean;
    width?: string;
    hasError?: boolean;
    errorMessage?: string;
    ariaDescribedBy?: string;
    oninput?: (e: Event) => unknown;
  } = $props();

  let inputElement: HTMLInputElement;

  function handleToggle() {
    if (disabled) return;
    hide = !hide;
    inputElement?.focus();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  }
</script>

<div class="smart-input-container" style="width: {width}">
  {#if label}
    <label for={id} class="input-label">
      {label}
      {#if required}
        <span class="required-indicator" aria-label="required">*</span>
      {/if}
    </label>
  {/if}

  <div class="input-wrapper" class:has-error={hasError} class:disabled={disabled}>
    <input
      bind:this={inputElement}
      bind:value={value}
      {id}
      oninput={oninput}
      type={hide ? 'password' : 'text'}
      class="input-field"
      {placeholder}
      {disabled}
      {required}
      aria-invalid={hasError ? 'true' : undefined}
      aria-describedby={ariaDescribedBy || (hasError && errorMessage ? `${id}-error` : undefined)}
    />

    {#if showToggle}
      <button
        type="button"
        tabindex={disabled ? -1 : 0}
        class="visibility-toggle"
        onclick={handleToggle}
        onkeydown={handleKeyDown}
        aria-pressed={!hide}
        aria-label="Toggle password visibility"
      >
        {#if hide}
          <CloseEyeIcon />
        {:else}
          <OpenEyeIcon />
        {/if}
      </button>
    {/if}
  </div>

  {#if hasError && errorMessage}
    <div id="{id}-error" class="error-message" role="alert">
      {errorMessage}
    </div>
  {/if}
</div>

<style lang="scss">
  .smart-input-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .input-label {
    font-size: var(--font-size-medium);
    font-weight: 500;
    color: var(--color-content-text-secondary);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .required-indicator {
    color: var(--color-negative-border-primary);
    font-weight: 600;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    
    &.disabled {
      opacity: 0.6;
    }
  }

  .input-field {
    width: 100%;
    height: 52px;
    padding: 0 48px 0 16px;
    font-size: var(--font-size-medium);
    font-weight: 500;
    color: var(--color-content-text-inverted);
    border: 2px solid transparent;
    background-color: var(--color-neutral-background-container);
    border-radius: 12px;
    transition: all 0.2s ease;
    outline: none;

    &:focus {
      border-color: var(--color-inputs-border-focus);
      background-color: var(--color-inputs-background-base);
    }

    &:hover:not(:disabled):not(:focus) {
      border-color: var(--color-neutral-border-default);
    }

    &::placeholder {
      color: var(--color-content-text-secondary);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  .input-wrapper.has-error .input-field {
    border-color: var(--color-inputs-border-error);
    
    &:focus {
      border-color: var(--color-inputs-border-error);
    }
  }

  .visibility-toggle {
    position: absolute;
    right: 6px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-content-icon-secondary);
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
      background-color: var(--color-button-regular-quaternary-hover);
    }

    &:disabled {
      cursor: not-allowed;
    }

    :global(svg) {
        width: 20px;
        height: 20px;
    }
  }

  .error-message {
    font-size: var(--font-size-small);
    color: var(--color-inputs-border-error);
    font-weight: 500;
    line-height: 1.3;
  }
</style>
