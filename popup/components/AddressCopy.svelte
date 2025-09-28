<script lang="ts">
    import { truncate } from "popup/mixins/address";
    import CopyIcon from './icons/Copy.svelte';
    import RightIcon from './icons/Right.svelte';

    let {
        name,
        address,
        onclick = () => {}
    }: {
        name: string;
        address: string;
        onclick?: () => void;
    } = $props();

    let isCopied = $state(false);

    const truncatedAddress = $derived(truncate(address));

    async function handleCopy(event: MouseEvent) {
        event.stopPropagation();
        if (isCopied) return;

        try {
            await navigator.clipboard.writeText(address);
            isCopied = true;
            setTimeout(() => {
                isCopied = false;
            }, 2000);
        } catch (error) {
            console.error('Failed to copy address:', error);
        }
    }

    function handleCardKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            onclick();
        }
    }
</script>

<div 
    class="account-card" 
    onclick={onclick} 
    onkeydown={handleCardKeyDown}
    role="button" 
    tabindex="0"
    aria-label={`Select account ${name}`}
>
    <div class="icon-container">
        <div class="jazzicon"></div>
    </div>

    <div class="info-container">
        <div class="account-name">{name}</div>
        <div class="address-line">
            <span class="account-address">{truncatedAddress}</span>
            <button class="copy-button" onclick={handleCopy} aria-label="Copy address">
                <CopyIcon />
            </button>
            <div class="type-indicator"></div>
        </div>
    </div>

    <div class="arrow-container">
        <RightIcon />
    </div>
</div>

<style lang="scss">
    .account-card {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 16px;
        background-color: var(--color-button-regular-quaternary-default);
        border: 1px solid var(--color-cards-regular-border-default);
        border-radius: 16px;
        cursor: pointer;
        text-align: left;
        transition: background-color 0.2s ease, border-color 0.2s ease;

        &:hover {
            background-color: var(--color-button-regular-quaternary-hover);
            border-color: var(--color-cards-regular-border-hover);
        }

        &:focus-visible {
            outline: 2px solid var(--color-inputs-border-focus);
            outline-offset: 2px;
        }
    }

    .icon-container {
        flex-shrink: 0;
    }

    .jazzicon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff007a 0%, #ff007a 50%, transparent 50%);
        position: relative;
        
        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: transparent;
        }
    }

    .info-container {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .account-name {
        font-size: var(--font-size-large);
        font-weight: 600;
        color: var(--color-content-text-inverted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .address-line {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .account-address {
        font-size: var(--font-size-medium);
        color: var(--color-content-text-secondary);
        font-family: monospace;
    }

    .copy-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px;
        color: var(--color-content-icon-secondary);
        opacity: 0.7;
        transition: opacity 0.2s ease, color 0.2s ease;

        &:hover {
            opacity: 1;
            color: var(--color-content-text-purple);
        }

        :global(svg) {
            width: 14px;
            height: 14px;
        }
    }

    .type-indicator {
        width: 12px;
        height: 12px;
        background-color: var(--color-content-text-purple);
        border-radius: 2px;
        flex-shrink: 0;
    }

    .arrow-container {
        flex-shrink: 0;
        color: var(--color-content-icon-secondary);
        opacity: 0.5;

        :global(svg) {
            width: 20px;
            height: 20px;
        }
    }
</style>
