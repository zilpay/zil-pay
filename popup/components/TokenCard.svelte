<script lang="ts">
    import globalStore from 'popup/store/global';
    import type { IAccountState, IFTokenState } from 'background/storage';
    import FastImg from './FastImg.svelte';
    import { processTokenLogo } from 'lib/popup/url';
    import { abbreviateNumber } from 'popup/mixins/numbers';

    let {
        token,
        account,
        hide = false,
        loading = false,
        disabled = false,
        tokensRow = true,
        onSelect = () => {}
    }: {
        token: IFTokenState,
        account: IAccountState,
        hide: boolean;
        loading?: boolean;
        disabled?: boolean;
        tokensRow?: boolean;
        onSelect?: () => void;
    } = $props();

    const balance = $derived(hide ? '******' : abbreviateNumber(token.balances[account.addr] ?? 0, token.decimals));
    // TODO: add token rate.
    const convertedBalance = $derived(hide ? '******' : token.rate ?? 0);
    const logo = $derived(processTokenLogo({
        token,
        theme: $globalStore.appearances,
    }));


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
>
    {#if !tokensRow}
        <div class="grid-header">
            <span class="symbol">{token.symbol}</span>
            <div class="token-icon">
                <FastImg src={logo} class="icon-image" />
            </div>
        </div>
        <div class="balance-group">
            <div class="balance">{balance}</div>
            <div class="converted">{convertedBalance}</div>
        </div>
    {:else}
        <div class="info-group">
            <div class="token-icon">
                <FastImg src={logo} class="icon-image" />
            </div>
            <span class="symbol">{token.symbol}</span>
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
        position: relative;
        overflow: hidden;
        padding: 12px;
        background: var(--color-cards-tokens-base-default);
        border: 2px solid var(--color-cards-regular-border-default);
        border-radius: 12px;
        cursor: pointer;
        text-align: left;
        transition: border-color 0.2s ease, opacity 0.2s ease;
        box-sizing: border-box;
        
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 16px;
        width: 148px;
        align-self: start;

        &:hover:not(:disabled):not(.loading) {
            border-color: var(--color-cards-regular-border-hover);
        }

        &.disabled {
            cursor: not-allowed;
            opacity: 0.6;
        }

        &.loading::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.1),
                transparent
            );
            transform: translateX(-100%);
            animation: shimmer 1.5s infinite;
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

    @keyframes shimmer {
        100% {
            transform: translateX(100%);
        }
    }
</style>


