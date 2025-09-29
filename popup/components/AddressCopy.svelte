<script lang="ts">
    import { truncate } from 'popup/mixins/address';
    import { clipboardCopy } from 'lib/popup/clipboard';
    import CopyIcon from './icons/Copy.svelte';
    import SuccessIcon from './icons/Success.svelte';

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

    const truncatedAddress = $derived(truncate(address, 6, 6));

    async function handleCopy(event: MouseEvent) {
        event.stopPropagation();
        if (isCopied) return;

        const success = await clipboardCopy(address);
        if (success) {
            isCopied = true;
            setTimeout(() => {
                isCopied = false;
            }, 1000);
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            onclick();
        }
    }
</script>

<div
    class="account-card"
    onclick={onclick}
    onkeydown={handleKeydown}
    role="button"
    tabindex="0"
    aria-label={`Select account ${name}`}
>
    <div class="icon-container">
        <div class="jazzicon">
            <div class="jazzicon-shape"></div>
        </div>
    </div>

    <div class="info-container">
        <div class="account-name">{name}</div>
        <button type="button" class="address-line" onclick={handleCopy} aria-label="Copy address">
            <span class="account-address">{truncatedAddress}</span>
            <div class="copy-icon-wrapper">
                {#if isCopied}
                    <SuccessIcon />
                {:else}
                    <CopyIcon />
                {/if}
            </div>
        </button>
    </div>
</div>

<style lang="scss">
    .account-card {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        cursor: pointer;
        text-align: left;
        background: none;
        border: none;
        padding: 0;
        font-family: inherit;
        border-radius: 4px;

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
        background: var(--color-content-text-pink);
        position: relative;
        overflow: hidden;
        outline: 2px solid transparent;
        transition: outline-color 0.2s ease;

        &:hover {
            outline-color: var(--color-neutral-border-hover);
        }
    }

    .jazzicon-shape {
        width: 74px;
        height: 30.77px;
        left: 11.38px;
        top: 16px;
        position: absolute;
        transform: rotate(30deg);
        transform-origin: top left;
        background: var(--color-neutral-background-base);
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
        line-height: 20px;
        color: var(--color-content-text-inverted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .address-line {
        display: inline-flex;
        align-items: center;
        align-self: flex-start;
        gap: 8px;
        cursor: pointer;
        background: none;
        border: none;
        padding: 4px 8px;
        margin: -4px -8px;
        border-radius: 8px;
        transition: background-color 0.2s ease;
        font-family: inherit;

        &:hover {
            background-color: var(--color-button-regular-quaternary-default);
        }
    }

    .account-address {
        font-size: var(--font-size-large);
        color: var(--color-content-text-secondary);
        font-family: Geist, monospace;
        line-height: 20px;
    }

    .copy-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-content-icon-accent-secondary);
        
        :global(svg) {
            width: 16px;
            height: 16px;
        }
    }
</style>
