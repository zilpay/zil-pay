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
        loading = false,
        oninput = (_e: Event) => null,
        leftIcon = undefined,
        rightAction = undefined,
        autofocus = false
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
        loading?: boolean;
        oninput?: (e: Event) => unknown;
        leftIcon?: Snippet;
        rightAction?: Snippet;
        autofocus?: boolean;
    } = $props();

    let inputElement: HTMLInputElement;

    $effect(() => {
        if (autofocus && inputElement) {
            inputElement.focus();
        }
    });

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

    <div class="input-wrapper" class:has-error={hasError} class:loading>
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
            class:with-right-action={rightAction || showToggle}
            {placeholder}
            disabled={disabled || loading}
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
                tabindex={disabled || loading ? -1 : 0}
                class="visibility-toggle"
                onclick={handleToggle}
                onkeydown={handleKeyDown}
                aria-pressed={!hide}
                aria-label="Toggle password visibility"
                disabled={loading}
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
        overflow: hidden;

        &:focus-within:not(.loading) {
            border-color: var(--color-inputs-border-focus);
        }

        &.has-error:not(.loading) {
            border-color: var(--color-inputs-border-error);
        }

        &.loading {
            border-color: transparent;
            &::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 200%;
                height: 200%;
                background: conic-gradient(
                    from 180deg at 50% 50%,
                    var(--color-content-text-purple) 0%,
                    var(--color-button-regular-primary-default) 50%,
                    var(--color-content-text-purple) 100%
                );
                transform: translate(-50%, -50%);
                animation: spin 2s linear infinite;
            }
        }
    }

    @keyframes spin {
        0% {
            transform: translate(-50%, -50%) rotate(0deg);
        }
        100% {
            transform: translate(-50%, -50%) rotate(360deg);
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
        z-index: 2;
    }

    .input-field {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 48px;
        padding: 0 16px;
        font-size: var(--font-size-large);
        color: var(--color-content-text-inverted);
        border: none;
        background: transparent;
        outline: none;
        border-radius: 11px;
        margin: 1px;
        background-color: var(--color-inputs-background-base);


        &.with-left-icon {
            padding-left: 48px;
        }

        &.with-right-action {
             padding-right: 56px;
        }

        &::placeholder {
            color: var(--color-content-text-secondary);
        }

        &:disabled {
            cursor: not-allowed;
        }
    }
    
    .input-wrapper.loading .input-field {
        background-color: var(--color-button-regular-quaternary-default);
    }


    .visibility-toggle {
        position: absolute;
        right: 6px;
        z-index: 2;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-content-icon-secondary);
        padding: 8px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:disabled {
            cursor: not-allowed;
        }

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
        z-index: 2;
    }

    .error-message {
        font-size: var(--font-size-small);
        color: var(--color-inputs-border-error);
        font-weight: 500;
    }
</style>

