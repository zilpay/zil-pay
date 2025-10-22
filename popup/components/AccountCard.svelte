<script lang="ts">
    import Jazzicon from './Jazzicon.svelte';
    import CopyButton from './CopyButton.svelte';
    import { truncate } from 'popup/mixins/address';

    let {
        name,
        address,
        selected = false,
        onclick = () => {}
    }: {
        name: string;
        address: string;
        selected?: boolean;
        onclick?: () => void;
    } = $props();

    const addresses = $derived(address.includes(':') ? address.split(':') : [address]);
    const isMultiAddress = $derived(addresses.length > 1);

    function handleClick() {
        onclick();
    }
</script>

<button
    class="account-card"
    class:selected
    onclick={handleClick}
    type="button"
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
</button>

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

        &:hover:not(.selected):not(:disabled) {
            background: var(--color-cards-regular-base-hover);
        }

        &:focus-visible:not(.selected):not(:disabled) {
            outline: 2px solid var(--color-inputs-border-focus);
            outline-offset: 2px;
        }

        &.selected {
            background: var(--color-cards-regular-base-selected);
            outline-color: var(--color-neutral-tag-purple-border);
        }

        &:disabled {
            opacity: 1;
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
</style>
