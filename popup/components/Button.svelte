<script lang="ts">
    let {
        width = '100%',
        height = 48,
        loading = false,
        variant = 'primary',
        ...rest
    }: {
        width?: string;
        height?: number;
        loading?: boolean;
        variant?: 'primary' | 'secondary';
        [key: string]: any;
    } = $props();
</script>

<button
    {...rest}
    style:width={width}
    style:height={`${height}px`}
    disabled={loading || rest.disabled}
    class={variant}
    class:loading
>
    {#if loading}
        <div class="loading-spinner"></div>
    {:else}
        <span class="text">
            <slot />
        </span>
    {/if}
</button>

<style lang="scss">
    button {
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border: none;
        border-radius: 10px;
        padding: 0 16px;
        transform-origin: center;
        transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        position: relative;

        &:active:not(:disabled) {
            transform: scale(0.98);
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }

        &.loading {
            cursor: not-allowed;
        }
    }

    .text {
        font-weight: 400;
        font-size: var(--font-size-large);
        line-height: 20px;
        font-family: Geist, sans-serif;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: flex;
        align-items: center;
    }

    .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid color-mix(in srgb, var(--color-content-text-primary) 30%, transparent);
        border-top-color: var(--color-content-text-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .primary {
        background-color: var(--color-button-regular-primary-default);
        color: var(--color-content-text-primary);

        &:hover:not(:disabled) {
            background-color: var(--color-button-regular-primary-hover);
        }

        &:active:not(:disabled) {
            background-color: var(--color-button-regular-primary-pressed);
        }
    }

    .secondary {
        background-color: var(--color-button-regular-secondary-default);
        color: var(--color-content-text-primary);

        &:hover:not(:disabled) {
            background-color: var(--color-button-regular-secondary-hover);
        }

        &:active:not(:disabled) {
            background-color: var(--color-button-regular-secondary-pressed);
        }
    }
</style>
