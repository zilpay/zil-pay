<script lang="ts">
    import type { Snippet } from 'svelte';

    let {
        checked = $bindable(false),
        disabled = false,
        id = '',
        name = '',
        ariaLabel = '',
        onChange = (_newChecked: boolean) => {},
        children
    }: {
        checked?: boolean;
        disabled?: boolean;
        id?: string;
        name?: string;
        ariaLabel?: string;
        onChange?: (newChecked: boolean) => void;
        children?: Snippet;
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
    <div class="switch-track"></div>
    <div class="switch-thumb">
        {#if children}
            {@render children()}
        {/if}
    </div>
</button>

<style lang="scss">
    .switch-button {
        position: relative;
        display: inline-flex;
        align-items: center;
        width: 52px;
        height: 28px;
        padding: 0;
        margin: 0;
        border: none;
        border-radius: 8px;
        background: none;
        cursor: pointer;
        outline: none;
        flex-shrink: 0;
        -webkit-tap-highlight-color: transparent;

        &.disabled {
            cursor: not-allowed;
            opacity: 0.6;
        }

        &:focus-visible {
            box-shadow: 0 0 0 2px var(--color-inputs-border-focus);
        }
    }

    .switch-track {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 8px;
        background-color: var(--color-controls-toggle-theme-light-fg);
        transition: background-color 0.2s ease-in-out;
    }

    .switch-button.checked .switch-track {
        background-color: var(--color-controls-toggle-theme-dark-fg);
    }

    .switch-thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--color-controls-toggle-theme-light-switcher);
        border-radius: 6px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease-in-out;

        :global(svg) {
            width: 16px;
            height: 16px;
            color: var(--color-content-icon-inverted);
        }
    }

    .switch-button.checked .switch-thumb {
        transform: translateX(24px);
        background-color: var(--color-controls-toggle-theme-dark-switcher);
    }
</style>


