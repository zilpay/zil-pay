<script lang="ts">
    import type { Snippet } from 'svelte';
    import OpenEyeIcon from './icons/Eye.svelte';
    import CloseEyeIcon from './icons/Hide.svelte';

    let {
        id = '',
        label = '',
        placeholder = '',
        value = $bindable(''),
        hide = $bindable(false),
        disabled = false,
        required = false,
        showToggle = true,
        width = '100%',
        hasError = false,
        errorMessage = '',
        ariaDescribedBy = '',
        oninput = (_e: Event) => null,
        leftIcon = undefined,
        rightAction = undefined
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
        leftIcon?: Snippet;
        rightAction?: Snippet;
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

<div class="smart-input-container" style="width: {width}" class:disabled>
    {#if label}
        <label for={id} class="input-label">
            {label}
            {#if required}
                <span class="required-indicator" aria-label="required">*</span>
            {/if}
        </label>
    {/if}

    <div class="input-wrapper" class:has-error={hasError}>
        {#if leftIcon}
            <div class="left-icon-wrapper">
                {@render leftIcon()}
            </div>
        {/if}

        <input
            bind:this={inputElement}
            bind:value={value}
            {id}
            oninput={oninput}
            type={hide ? 'password' : 'text'}
            class="input-field"
            class:with-left-icon={leftIcon}
            class:with-right-action={rightAction}
            {placeholder}
            {disabled}
            {required}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={ariaDescribedBy || (hasError && errorMessage ? `${id}-error` : undefined)}
        />

        {#if rightAction}
             <div class="right-action-wrapper">
                {@render rightAction()}
            </div>
        {:else if showToggle}
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

        &.disabled {
            opacity: 0.6;
        }
    }

    .input-label {
        font-size: var(--font-size-medium);
        font-weight: 500;
        color: var(--color-content-text-inverted);
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .required-indicator {
        color: var(--color-negative-border-primary);
    }

    .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        background-color: var(--color-inputs-background-base);
        border-radius: 12px;
        border: 1px solid var(--color-cards-regular-border-default);
        transition: border-color 0.2s ease;
        
        &:focus-within {
            border-color: var(--color-inputs-border-focus);
        }
        
        &.has-error {
            border-color: var(--color-inputs-border-error);
        }
    }

    .left-icon-wrapper {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .input-field {
        width: 100%;
        height: 48px;
        padding: 0 16px;
        font-size: var(--font-size-large);
        color: var(--color-content-text-inverted);
        border: none;
        background: transparent;
        outline: none;

        &.with-left-icon {
            padding-left: 48px;
        }

        &.with-right-action {
             padding-right: 56px;
        }

        &:not(.with-right-action) {
             padding-right: 48px;
        }

        &::placeholder {
            color: var(--color-content-text-secondary);
        }

        &:disabled {
            cursor: not-allowed;
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
        display: flex;
        align-items: center;
        justify-content: center;

        :global(svg) {
            width: 20px;
            height: 20px;
        }
    }

    .right-action-wrapper {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .error-message {
        font-size: var(--font-size-small);
        color: var(--color-inputs-border-error);
        font-weight: 500;
    }
</style>

