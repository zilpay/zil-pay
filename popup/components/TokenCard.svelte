<script lang="ts">
    import globalStore from 'popup/store/global';
    import type { IAccountState, IFTokenState } from 'background/storage';
    import FastImg from './FastImg.svelte';
    import { processTokenLogo } from 'lib/popup/url';
    import { abbreviateNumber } from 'popup/mixins/numbers';
    import { hashXORHex } from 'lib/utils/hashing';
    import { getCurrencySymbol } from 'config/currencies';
    import { AddressType } from 'config/wallet';
    import ScillaIcon from './icons/Scilla.svelte';
    import SolidityIcon from './icons/Solidity.svelte';

    let {
        token,
        account,
        hide = false,
        loading = false,
        disabled = false,
        tokensRow = true,
        addrType = undefined as AddressType | undefined,
        onSelect = () => {}
    }: {
        token: IFTokenState,
        account: IAccountState,
        hide: boolean;
        loading?: boolean;
        disabled?: boolean;
        tokensRow?: boolean;
        addrType?: AddressType;
        onSelect?: () => void;
    } = $props();

    const balance = $derived(() => {
        if (hide) return '******';
        const humanBalance = abbreviateNumber(token.balances[hashXORHex(account.pubKey)] ?? 0, token.decimals);
        return `${humanBalance} ${token.symbol}`;
    });
    
    const convertedBalance = $derived(() => {
        if (hide) return '******';
        const rate = token.rate ?? 0;
        const rawBalance = token.balances[hashXORHex(account.pubKey)] ?? 0;
        const numericBalance = Number(rawBalance) / (10 ** token.decimals);
        const convertedValue = numericBalance * rate;
        const currencySymbol = getCurrencySymbol($globalStore.wallets[$globalStore.selectedWallet]?.settings?.currencyConvert ?? 'USD');
        return rate > 0 ? `${currencySymbol}${abbreviateNumber(convertedValue.toString(), 0)}` : '-';
    });
    
    const logo = $derived(processTokenLogo({
        token,
        theme: $globalStore.appearances,
    }));

    const typeToUse = $derived(() => addrType ?? token?.addrType);

    function handleClick() {
        if (!disabled && !loading) onSelect();
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
            <span class="symbol">{token.name}</span>
            <div class="token-icon">
                <FastImg src={logo} class="icon-image" />
                {#if typeToUse() === AddressType.Bech32}
                    <div class="address-type-badge">
                        <ScillaIcon class="icon" />
                    </div>
                {:else if typeToUse() === AddressType.EthCheckSum}
                    <div class="address-type-badge">
                        <SolidityIcon class="icon" />
                    </div>
                {/if}
            </div>
        </div>
        <div class="balance-group">
            <div class="balance">{balance()}</div>
            <div class="converted">{convertedBalance()}</div>
        </div>
    {:else}
        <div class="info-group">
            <div class="token-icon">
                <FastImg src={logo} class="icon-image" />
                {#if typeToUse() === AddressType.Bech32}
                    <div class="address-type-badge">
                        <ScillaIcon class="icon" />
                    </div>
                {:else if typeToUse() === AddressType.EthCheckSum}
                    <div class="address-type-badge">
                        <SolidityIcon class="icon" />
                    </div>
                {/if}
            </div>
            <span class="token-name">{token.name}</span>
        </div>
        <div class="balance-group">
            <div class="balance">{balance()}</div>
            <div class="converted">{convertedBalance()}</div>
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
            border-color: var(--color-button-regular-primary-default);
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
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transform: translateX(-100%);
            animation: shimmer 1.5s infinite;
        }
    }

    .token-icon {
        position: relative;
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

    .address-type-badge {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 14px;
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-neutral-background-base);
        border-radius: 50%;
        border: 2px solid var(--color-neutral-background-base);

        :global(svg) {
            width: 10px;
            height: 10px;
        }

        :global(.icon > path) {
            fill: var(--color-content-text-secondary);
        }
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

    .symbol {
        color: var(--color-content-text-inverted);
        font-size: 16px;
        font-family: Geist, monospace;
        font-weight: 700;
        line-height: 22px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .token-name {
        color: var(--color-content-text-inverted);
        font-size: 16px;
        font-family: Geist;
        font-weight: 700;
        line-height: 22px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

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

        .address-type-badge {
            width: 16px;
            height: 16px;

            :global(svg) {
                width: 12px;
                height: 12px;
            }
        }

        .info-group {
            flex: 1 1 0;
            flex-direction: row;
            align-items: center;
            gap: 8px;
        }

        .token-name {
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
