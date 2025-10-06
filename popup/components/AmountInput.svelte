<script lang="ts">
    import type { IAccountState, IFTokenState } from 'background/storage';
    import FastImg from './FastImg.svelte';
    import DownIcon from './icons/Down.svelte';
    import { abbreviateNumber } from 'popup/mixins/numbers';
    import { hashXORHex } from 'lib/utils/hashing';
    import { processTokenLogo } from 'lib/popup/url';
    import globalStore from 'popup/store/global';

    let {
        value = $bindable(''),
        token,
        account,
        placeholder = '0.00',
        disabled = false,
        onTokenSelect = undefined,
        onMax = undefined
    }: {
        value?: string;
        token?: IFTokenState;
        account?: IAccountState;
        placeholder?: string;
        disabled?: boolean;
        onTokenSelect?: () => void;
        onMax?: () => void;
    } = $props();

    const logo = $derived(token ? processTokenLogo({ token, theme: $globalStore.appearances }) : '');
    const availableDisplay = $derived(() => {
        if (!token || !account) return '0';
        const balance = token.balances[hashXORHex(account.pubKey)] ?? 0;
        return abbreviateNumber(balance, token.decimals);
    });
    const approxDisplay = $derived("-");
    const canSelectToken = $derived(Boolean(onTokenSelect && token) && !disabled);
    const showMax = $derived(Boolean(onMax && token) && !disabled);

    function handleTokenClick() {
        if (canSelectToken) {
            onTokenSelect?.();
        }
    }

    function handleMaxClick() {
        if (showMax) {
            onMax?.();
        }
    }
</script>

<div class="amount-input" class:disabled>
    <div class="top-row">
        <input
            class="amount-field"
            type="text"
            placeholder={placeholder}
            bind:value={value}
            inputmode="decimal"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="none"
            spellcheck="false"
            {disabled}
        />
        {#if token}
            <button
                type="button"
                class="token-button"
                class:selectable={canSelectToken}
                onclick={handleTokenClick}
                aria-disabled={!canSelectToken}
            >
                <div class="token-icon">
                    <FastImg src={logo} alt={token.symbol} />
                </div>
                <DownIcon />
            </button>
        {/if}
    </div>
    <div class="bottom-row">
        <span class="approx">{approxDisplay}</span>
        <div class="availability">
            <span class="balance">
                <span class="balance-value">{availableDisplay()}</span>
            </span>
            {#if showMax}
                <button type="button" class="max-button" onclick={handleMaxClick}>
                    max
                </button>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">
    .amount-input {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        border: 1px solid var(--color-neutral-border-default);
        border-radius: 12px;
        background: var(--color-neutral-background-base);
        transition: border-color 0.2s ease;

        &:focus-within {
            border-color: var(--color-inputs-border-focus);
        }

        &.disabled {
            opacity: 0.6;
            pointer-events: none;
        }
    }

    .top-row {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .amount-field {
        flex: 1;
        min-width: 0;
        border: none;
        background: transparent;
        padding: 0;
        font-size: 28px;
        font-weight: 700;
        line-height: 32px;
        color: var(--color-content-text-inverted);
        font-family: Geist, sans-serif;
        outline: none;

        &::placeholder {
            color: var(--color-content-text-secondary);
        }

        &:disabled {
            color: var(--color-content-text-secondary);
        }
    }

    .token-button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        border: none;
        padding: 2px 0;
        color: var(--color-content-text-inverted);

        &.selectable {
            cursor: pointer;
        }

        &[aria-disabled='true'] {
            opacity: 0.7;
        }

        :global(svg) {
            width: 24px;
            height: 24px;
            color: var(--color-content-icon-secondary);
        }
    }

    .token-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-neutral-background-container);

        :global(img),
        :global(svg) {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .bottom-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    .approx {
        font-size: 12px;
        line-height: 16px;
        color: var(--color-content-text-secondary);
        font-weight: 400;
    }

    .availability {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .balance {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        line-height: 16px;
    }

    .balance-value {
        color: var(--color-content-text-inverted);
        font-weight: 500;
    }

    .max-button {
        padding: 2px 10px;
        border-radius: 6px;
        border: none;
        background: color-mix(in srgb, var(--color-neutral-tag-purple-fg) 12%, transparent);
        color: var(--color-content-text-purple);
        font-size: 12px;
        font-weight: 500;
        line-height: 16px;
        cursor: pointer;
        transition: background-color 0.2s ease, transform 0.15s ease;

        &:hover {
            background: color-mix(in srgb, var(--color-neutral-tag-purple-fg) 20%, transparent);
        }

        &:active {
            transform: scale(0.97);
        }
    }
</style>
