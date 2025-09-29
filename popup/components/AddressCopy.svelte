<script lang="ts">
    import { truncate } from 'popup/mixins/address';
    import CopyIcon from './icons/Copy.svelte';
    import RightIcon from './icons/Right.svelte';
    import { clipboardCopy } from 'lib/popup/clipboard';

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
            }, 2000);
        }
    }
</script>

<div
    class="account-card"
    onclick={onclick}
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
        <div class="address-line">
            <span class="account-address">{truncatedAddress}</span>
            <button class="copy-button" onclick={handleCopy} aria-label="Copy address">
                <CopyIcon />
            </button>
        </div>
    </div>

    <button class="arrow-button" aria-label="View account details">
        <RightIcon />
    </button>
</div>

<style lang="scss">
    .account-card {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        cursor: pointer;
        text-align: left;
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
        outline: 1px solid var(--color-neutral-border-default);
        outline-offset: -1px;
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
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .account-address {
        font-size: var(--font-size-large);
        color: var(--color-content-text-secondary);
        font-family: Geist, monospace;
        line-height: 20px;
    }

    .copy-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        color: var(--color-content-icon-accent-secondary);
        transition: opacity 0.2s ease;

        &:hover {
            opacity: 0.8;
        }

        :global(svg) {
            width: 16px;
            height: 16px;
        }
    }

    .arrow-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        background-color: var(--color-button-regular-quaternary-default);
        border: 1px solid var(--color-neutral-border-default);
        border-radius: 8px;
        color: var(--color-content-icon-inverted);
        cursor: pointer;

        :global(svg) {
            width: 24px;
            height: 24px;
        }
    }
</style>
