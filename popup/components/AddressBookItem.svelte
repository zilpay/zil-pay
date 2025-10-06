<script lang="ts">
    import type { IAddressBookRecord } from 'background/storage/book';
    import { truncate } from 'popup/mixins/address';
    import { clipboardCopy } from 'lib/popup/clipboard';

    import Jazzicon from './Jazzicon.svelte';
    import CopyIcon from './icons/Copy.svelte';
    import SuccessIcon from './icons/Success.svelte';

    let {
        record,
        onselect
    }: {
        record: IAddressBookRecord;
        onselect: (addr: string) => void;
    } = $props();

    let isCopied = $state(false);

    const truncatedAddress = $derived.by(() => {
        if (!record.address) return '';
        return truncate(record.address, 6, 6);
    });

    async function handleCopy(event: MouseEvent) {
        event.stopPropagation();
        if (isCopied) return;

        const success = await clipboardCopy(record.address);
        if (success) {
            isCopied = true;
            setTimeout(() => {
                isCopied = false;
            }, 1500);
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onselect(record.address);
        }
    }
</script>

<div
    class="address-item"
    onclick={() => onselect(record.address)}
    onkeydown={handleKeydown}
    role="button"
    tabindex="0"
>
    <div class="main-content">
        <Jazzicon seed={record.address} diameter={48} />
        <div class="info-container">
            <div class="name">{record.name}</div>
            <button type="button" class="address-line" onclick={handleCopy}>
                <span class="address-text">{truncatedAddress}</span>
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
</div>

<style lang="scss">
    .address-item {
        display: flex;
        align-items: center;
        width: 100%;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        text-align: left;
        border-radius: 12px;

        &:hover {
            .address-line {
                background-color: var(--color-button-regular-quaternary-hover);
            }
        }

        &:focus-visible {
            outline: 2px solid var(--color-inputs-border-focus);
            outline-offset: 2px;
        }
    }

    .main-content {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
    }

    .info-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 0;
    }

    .name {
        color: var(--color-content-text-inverted, #141415);
        font-size: 14px;
        font-family: Geist;
        font-weight: 600;
        line-height: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .address-line {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 2px 6px;
        margin: -2px -6px;
        border-radius: 6px;
        transition: background-color 0.2s ease;
        background: none;
        border: none;
        cursor: pointer;
        font-family: inherit;
    }

    .address-text {
        color: var(--color-content-text-secondary, #808080);
        font-size: 14px;
        font-family: Geist;
        font-weight: 400;
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
