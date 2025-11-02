<script lang="ts">
    import Jazzicon from './Jazzicon.svelte';
    import CopyButton from './CopyButton.svelte';
    import DeleteIcon from './icons/Delete.svelte';
    import SuccessIcon from './icons/Success.svelte';
    import { truncate } from 'popup/mixins/address';

    let {
        name,
        address,
        selected = false,
        onclick = () => {},
        showDelete = false,
        disableDelete = false,
        ondelete = () => {}
    }: {
        name: string;
        address: string;
        selected?: boolean;
        onclick?: () => void;
        showDelete?: boolean;
        disableDelete?: boolean;
        ondelete?: () => void;
    } = $props();

    const addresses = $derived(address.includes(':') ? address.split(':') : [address]);
    const isMultiAddress = $derived(addresses.length > 1);

    let confirmDelete = $state(false);
    let confirmTimer: number | null = null;

    function handleClick() {
        onclick();
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
        }
    }

    function handleDeleteClick(event: MouseEvent) {
        event.stopPropagation();
        if (disableDelete) return;

        if (!confirmDelete) {
            confirmDelete = true;
            if (confirmTimer) {
                clearTimeout(confirmTimer);
            }
            confirmTimer = window.setTimeout(() => {
                confirmDelete = false;
                confirmTimer = null;
            }, 2000);
            return;
        }

        confirmDelete = false;
        if (confirmTimer) {
            clearTimeout(confirmTimer);
            confirmTimer = null;
        }
        ondelete();
    }
</script>

<div
    class="account-card"
    class:selected
    onclick={handleClick}
    onkeydown={handleKeyDown}
    role="button"
    tabindex="0"
>
    <div class="icon-container">
        <Jazzicon seed={addresses[0]} diameter={48} onclick={() => {}} />
    </div>

    <div class="info-container">
        <div class="account-name">{name}</div>
        <div class="addresses" class:multi={isMultiAddress}>
            {#each addresses as addr}
                <CopyButton label={truncate(addr, 6, 6)} value={addr}/>
            {/each}
        </div>
    </div>

    {#if showDelete}
        <div class="right-actions">
            <button
                class="delete-button"
                class:confirm={confirmDelete}
                disabled={disableDelete}
                onclick={handleDeleteClick}
                type="button"
                aria-label={confirmDelete ? 'Confirm delete' : 'Delete'}
            >
                {#if confirmDelete}
                    <SuccessIcon />
                {:else}
                    <DeleteIcon />
                {/if}
            </button>
        </div>
    {/if}
</div>

<style lang="scss">
    .account-card {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px;
        background: transparent;
        border-radius: 12px;
        border: none;
        outline: 1px solid var(--color-neutral-border-default);
        outline-offset: -1px;
        cursor: pointer;
        text-align: left;
        transition: background 0.2s ease;

        &:hover:not(.selected) {
            background: var(--color-cards-regular-base-hover);
        }

        &:focus-visible:not(.selected) {
            outline: 2px solid var(--color-inputs-border-focus);
            outline-offset: 2px;
        }

        &.selected {
            background: var(--color-cards-regular-base-selected);
            outline-color: var(--color-neutral-tag-purple-border);
        }
    }

    .icon-container {
        flex-shrink: 0;
    }

    .info-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .account-name {
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .addresses {
        display: flex;
        flex-direction: column;
        gap: 4px;

        &.multi {
            gap: 2px;
        }
    }

    .right-actions {
        margin-left: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .delete-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: none;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        padding: 0;
        color: var(--color-content-text-pink);
        transition: background-color 0.2s ease, color 0.2s ease, opacity 0.2s ease;

        &:hover:not(:disabled) {
            background-color: var(--color-button-regular-quaternary-hover);
        }

        &.confirm {
            color: var(--color-positive-border-primary);
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }

        :global(svg) {
            width: 20px;
            height: 20px;
        }
    }
</style>
