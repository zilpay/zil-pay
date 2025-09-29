<script lang="ts">
    import FastImg from './FastImg.svelte';

    let {
        balance = '0',
        symbol = '',
        imageUrl = '',
        convertedBalance = '0.00',
        loading = false,
        disabled = false,
        viewMode = 'grid',
        onSelect = () => {}
    }: {
        balance?: string;
        symbol?: string;
        imageUrl?: string;
        convertedBalance?: string;
        loading?: boolean;
        disabled?: boolean;
        viewMode?: 'grid' | 'row';
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
    class:row={viewMode === 'row'}
    class:disabled={disabled}
    class:loading={loading}
    onclick={handleClick}
    type="button"
    aria-label={`Select ${symbol} token`}
>
    <div class="token-icon">
        {#if imageUrl}
            <FastImg src={imageUrl} alt={symbol} class="icon-image" />
        {:else}
            <div class="icon-placeholder">
                {symbol.charAt(0)}
            </div>
        {/if}
    </div>
    <div class="info-group">
        <div class="symbol">{symbol}</div>
        {#if viewMode === 'grid'}
            <div class="balance">{balance}</div>
        {/if}
    </div>
    <div class="balance-group">
        {#if viewMode === 'row'}
            <div class="balance">{balance}</div>
        {/if}
        <div class="converted">{convertedBalance}</div>
    </div>
</button>

<style lang="scss">
    .token-card {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 12px;
        background: var(--color-cards-tokens-base-default);
        border: 1px solid var(--color-cards-regular-border-default);
        border-radius: 12px;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;
        box-sizing: border-box;
        min-width: 148px;

        &:hover:not(:disabled) {
            border-color: var(--color-cards-regular-border-hover);
            background-color: var(--color-cards-tokens-base-hover);
        }
    }

    .token-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-neutral-background-container);
    }

    .info-group {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .symbol {
        font-size: 16px;
        font-weight: 700;
        color: var(--color-content-text-inverted);
        line-height: 22px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .balance {
        font-size: 16px;
        font-weight: 700;
        color: var(--color-content-text-inverted);
        line-height: 22px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .balance-group {
        display: flex;
        flex-direction: column;
        margin-top: auto;
    }

    .converted {
        font-size: 12px;
        font-weight: 400;
        color: var(--color-content-text-secondary);
        line-height: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .token-card.row {
        flex-direction: row;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        width: 100%;
        min-width: 0;

        .token-icon {
            width: 32px;
            height: 32px;
        }

        .info-group {
            flex-grow: 1;
        }

        .balance-group {
            align-items: flex-end;
            margin-top: 0;
        }
    }
</style>
