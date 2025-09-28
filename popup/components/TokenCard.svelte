<script lang="ts">
    import FastImg from './FastImg.svelte';

    let {
        balance = '0',
        symbol = '',
        imageUrl = '',
        convertedBalance = '0.00',
        loading = false,
        disabled = false,
        onSelect = () => {}
    }: {
        balance?: string;
        symbol?: string;
        imageUrl?: string;
        convertedBalance?: string;
        loading?: boolean;
        disabled?: boolean;
        onSelect?: () => void;
    } = $props();

    function handleClick() {
        if (!disabled && !loading) {
            onSelect();
        }
    }
</script>

<button
    class="token-card"
    class:disabled={disabled}
    class:loading={loading}
    onclick={handleClick}
    type="button"
    aria-label={`Select ${symbol} token`}
>
    <div class="card-header">
        <div class="symbol">{symbol}</div>
        <div class="token-icon">
            {#if imageUrl}
                <FastImg src={imageUrl} alt={symbol} class="icon-image" />
            {:else}
                <div class="icon-placeholder">
                    {symbol.charAt(0)}
                </div>
            {/if}
        </div>
    </div>

    <div class="card-body">
        <div class="balance">{balance}</div>
        <div class="converted">{convertedBalance}</div>
    </div>
</button>

<style lang="scss">
    .token-card {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 120px;
        padding: 16px;
        background: var(--color-cards-tokens-base-default);
        border: 1px solid var(--color-cards-regular-border-default);
        border-radius: 16px;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;

        &:hover:not(:disabled) {
            border-color: var(--color-cards-regular-border-hover);
            background-color: var(--color-cards-tokens-base-hover);
        }

        &.disabled {
            cursor: not-allowed;
            opacity: 0.6;
        }

        &.loading {
            position: relative;
            overflow: hidden;

            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    90deg,
                    transparent,
                    color-mix(in srgb, var(--color-content-text-purple) 15%, transparent),
                    transparent
                );
                animation: loading-shimmer 1.5s infinite;
            }
        }
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: auto;
    }

    .symbol {
        font-size: var(--font-size-large);
        font-weight: 700;
        color: var(--color-content-text-inverted);
        line-height: 1.2;
    }

    .token-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-neutral-background-container);
    }

    .icon-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-content-icon-accent-secondary);
        color: var(--color-content-text-primary);
        font-size: var(--font-size-medium);
        font-weight: 700;
    }

    .card-body {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .balance {
        font-size: var(--font-size-large);
        font-weight: 700;
        color: var(--color-content-text-inverted);
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .converted {
        font-size: var(--font-size-small);
        font-weight: 500;
        color: var(--color-content-text-secondary);
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    :global(.token-card .icon-image) {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    @keyframes loading-shimmer {
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }
</style>
