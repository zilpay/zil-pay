<script lang="ts">
    import FastImg from './FastImg.svelte';

    let {
        balance = '0',
        symbol = '',
        imageUrl = '',
        convertedBalance = '0.00',
        loading = false,
        disabled = false,
        tokensRow = true,
        onSelect = () => {}
    }: {
        balance?: string;
        symbol?: string;
        imageUrl?: string;
        convertedBalance?: string;
        loading?: boolean;
        disabled?: boolean;
        tokensRow?: boolean;
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
    class:row={tokensRow}
    class:disabled={disabled}
    class:loading={loading}
    onclick={handleClick}
    type="button"
    aria-label={`Select ${symbol} token`}
>
    {#if !tokensRow}
        <div class="grid-header">
            <span class="symbol">{symbol}</span>
            <div class="token-icon">
                <FastImg src={imageUrl} alt={symbol} class="icon-image" />
            </div>
        </div>
        <div class="balance-group">
            <div class="balance">{balance}</div>
            <div class="converted">{convertedBalance}</div>
        </div>
    {:else}
        <div class="info-group">
            <div class="token-icon">
                <FastImg src={imageUrl} alt={symbol} class="icon-image" />
            </div>
            <span class="symbol">{symbol}</span>
        </div>
        <div class="balance-group">
            <div class="balance">{balance}</div>
            <div class="converted">{convertedBalance}</div>
        </div>
    {/if}
</button>

<style lang="scss">
    .token-card {
        display: flex;
        padding: 12px;
        background: var(--color-cards-tokens-base-default);
        border: 2px solid var(--color-cards-regular-border-default);
        border-radius: 12px;
        cursor: pointer;
        text-align: left;
        transition: border-color 0.2s ease;
        box-sizing: border-box;
        
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 16px;
        width: 148px;

        &:hover:not(:disabled) {
            border-color: var(--color-cards-regular-border-hover);
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
    
    .grid-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .info-group,
    .balance-group {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        overflow: hidden;
    }

    .symbol,
    .balance {
        color: var(--color-content-text-inverted);
        font-size: 16px;
        font-family: Geist;
        font-weight: 700;
        line-height: 22px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .converted {
        color: var(--color-content-text-secondary);
        font-size: 12px;
        font-family: Geist;
        font-weight: 400;
        line-height: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .token-card.row {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        width: 100%;
        
        .token-icon {
            width: 32px;
            height: 32px;
        }

        .info-group {
            flex: 1 1 0;
            flex-direction: row;
            align-items: center;
            gap: 8px;
        }

        .symbol {
            font-weight: 400;
        }

        .balance-group {
            flex: 1 1 0;
            align-items: flex-end;
            text-align: right;
        }
    }
</style>
