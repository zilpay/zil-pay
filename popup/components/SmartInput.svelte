<script lang="ts">
  import type { Snippet } from 'svelte';

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
    onInput = undefined,
    onFocus = undefined,
    onBlur = undefined,
    onToggle = undefined,
    ariaDescribedBy = '',
    toggleIcon = undefined
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
    onInput?: (event: Event) => void;
    onFocus?: (event: FocusEvent) => void;
    onBlur?: (event: FocusEvent) => void;
    onToggle?: () => void;
    ariaDescribedBy?: string;
    toggleIcon?: Snippet;
  } = $props();

  let inputElement: HTMLInputElement;

  function handleToggle() {
    if (disabled) return;
    
    if (onToggle) {
      onToggle();
    } else {
      hide = !hide;
    }
    
    if (inputElement) {
      inputElement.focus();
    }
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    
    if (onInput) {
      onInput(event);
    }
  }

  function handleFocus(event: FocusEvent) {
    if (onFocus) {
      onFocus(event);
    }
  }

  function handleBlur(event: FocusEvent) {
    if (onBlur) {
      onBlur(event);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && showToggle) {
      event.preventDefault();
      handleToggle();
    }
  }
</script>

<div class="password-input-container" style="width: {width}">
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
      {id}
      type={hide ? 'password' : 'text'}
      class="password-input"
      {placeholder}
      {disabled}
      {required}
      bind:value={value}
      oninput={handleInput}
      onfocus={handleFocus}
      onblur={handleBlur}
      onkeydown={handleKeydown}
      aria-invalid={hasError}
      aria-describedby={ariaDescribedBy || (errorMessage ? `${id}-error` : undefined)}
    />
    
    {#if showToggle}
      <button 
        type="button"
        class="visibility-toggle"
        onclick={handleToggle}
        {disabled}
        aria-label={hide ? 'Show password' : 'Hide password'}
        tabindex={disabled ? -1 : 0}
      >
        {#if toggleIcon}
          {@render toggleIcon()}
        {:else}
          {#if hide}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {:else}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M14.12 14.12a3 3 0 0 1-4.24 0M9.88 9.88a3 3 0 0 1 4.24 4.24M6.18 6.18a10.94 10.94 0 0 0-3.36 5.82 10.94 10.94 0 0 0 3.36 5.82C7.71 19.36 9.81 20 12 20s4.29-.64 5.82-2.18a10.94 10.94 0 0 0 3.36-5.82 10.94 10.94 0 0 0-3.36-5.82C16.29 4.64 14.19 4 12 4s-4.29.64-5.82 2.18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="m1 1 22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {/if}
        {/if}
      </button>
    {/if}
  </div>
  
  {#if errorMessage}
    <div id="{id}-error" class="error-message" role="alert">
      {errorMessage}
    </div>
  {/if}
</div>

<style lang="scss">
  .password-input-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .input-label {
    font-size: var(--font-size-medium);
    font-weight: 500;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .required-indicator {
    color: var(--danger-color);
    font-weight: 600;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    
    &.has-error {
      .password-input {
        border-color: var(--danger-color);
        
        &:focus {
          border-color: var(--danger-color);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger-color) 15%, transparent);
        }
      }
      
      .visibility-toggle {
        color: var(--danger-color);
      }
    }
    
    &.disabled {
      opacity: 0.6;
      
      .password-input {
        cursor: not-allowed;
        background-color: color-mix(in srgb, var(--card-background) 50%, transparent);
      }
      
      .visibility-toggle {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }
  }

  .password-input {
    width: 100%;
    padding: 14px 50px 14px 16px;
    font-size: var(--font-size-medium);
    font-weight: 500;
    color: var(--text-primary);
    border: 2px solid color-mix(in srgb, var(--text-secondary) 20%, transparent);
    background-color: var(--card-background);
    border-radius: 12px;
    transition: all 0.2s ease;
    outline: none;

    &:focus {
      border-color: var(--primary-purple);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-purple) 15%, transparent);
    }

    &:hover:not(:disabled):not(:focus) {
      border-color: color-mix(in srgb, var(--primary-purple) 30%, transparent);
    }

    &::placeholder {
      color: var(--text-secondary);
      opacity: 0.6;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  .visibility-toggle {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 6px;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
      color: var(--primary-purple);
      background-color: color-mix(in srgb, var(--primary-purple) 10%, transparent);
    }

    &:focus:not(:disabled) {
      outline: none;
      color: var(--primary-purple);
      background-color: color-mix(in srgb, var(--primary-purple) 15%, transparent);
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  .error-message {
    font-size: var(--font-size-small);
    color: var(--danger-color);
    font-weight: 500;
    line-height: 1.3;
  }

  @media (max-width: 480px) {
    .password-input {
      padding: 12px 46px 12px 14px;
      font-size: var(--font-size-small);
    }

    .visibility-toggle {
      right: 10px;
      padding: 4px;

      :global(svg) {
        width: 18px;
        height: 18px;
      }
    }

    .input-label {
      font-size: var(--font-size-small);
    }

    .error-message {
      font-size: calc(var(--font-size-small) * 0.9);
    }
  }

  @media (max-width: 360px) {
    .password-input {
      padding: 10px 42px 10px 12px;
    }

    .visibility-toggle {
      right: 8px;

      :global(svg) {
        width: 16px;
        height: 16px;
      }
    }
  }
</style>
