<script lang="ts">
    import { clipboardCopy } from 'lib/popup/clipboard';
    import CopyIcon from './icons/Copy.svelte';
    import SuccessIcon from './icons/Success.svelte';

    let {
        value,
        disabled = false
    }: {
        value: string;
        disabled?: boolean;
    } = $props();

    let isCopied = $state(false);

    async function handleCopy(event: MouseEvent) {
        event.stopPropagation();
        if (isCopied || disabled) return;

        const success = await clipboardCopy(value);
        if (success) {
            isCopied = true;
            setTimeout(() => {
                isCopied = false;
            }, 1000);
        }
    }
</script>

<button
    type="button"
    class="copy-button"
    onclick={handleCopy}
    {disabled}
    aria-label="Copy to clipboard"
>
    <span class="value-text">{value}</span>
    <div class="icon-wrapper">
        {#if isCopied}
            <SuccessIcon />
        {:else}
            <CopyIcon />
        {/if}
    </div>
</button>

<style lang="scss">
    .copy-button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 2px 8px;
        margin: -2px -8px;
        border-radius: 6px;
        background: none;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s ease;
        font-family: inherit;
        max-width: fit-content;

        &:hover:not(:disabled) {
            background-color: var(--color-button-regular-quaternary-hover);
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 0.6;
        }
    }

    .value-text {
        color: var(--color-content-text-secondary);
        font-size: 14px;
        font-family: Geist;
        font-weight: 400;
        line-height: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--color-content-icon-accent-secondary);

        :global(svg) {
            width: 16px;
            height: 16px;
        }
    }
</style>
