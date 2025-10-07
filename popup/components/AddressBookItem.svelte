<script lang="ts">
    import type { IAddressBookRecord } from 'background/storage/book';
    import { truncate } from 'popup/mixins/address';
    import Jazzicon from './Jazzicon.svelte';
    import CopyButton from './CopyButton.svelte';
    import ScillaIcon from './icons/Scilla.svelte';
    import SolidityIcon from './icons/Solidity.svelte';
    import { AddressType } from 'config/wallet';

    let {
        record,
        onselect
    }: {
        record: IAddressBookRecord;
        onselect: (addr: string) => void;
    } = $props();

    const truncatedAddress = $derived.by(() => {
        if (!record.address) return '';
        return truncate(record.address, 6, 6);
    });

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
        <div class="avatar-container">
            <Jazzicon seed={record.address} diameter={48} />
            <div class="address-type-badge">
                {#if record.addrType === AddressType.Bech32}
                    <ScillaIcon class="icon"/>
                {:else if record.addrType === AddressType.EthCheckSum}
                    <SolidityIcon class="icon" />
                {/if}
            </div>
        </div>
        <div class="info-container">
            <div class="name">{record.name}</div>
            <CopyButton value={truncatedAddress} />
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

    .avatar-container {
        position: relative;
        flex-shrink: 0;
    }

    .address-type-badge {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-neutral-background-base);
        border-radius: 50%;
        border: 2px solid var(--color-neutral-background-base);

        :global(svg) {
            width: 16px;
            height: 16px;
        }
        :global(.icon > path) {
            fill: var(--color-content-text-secondary);
        }
    }

    .info-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 0;
    }

    .name {
        color: var(--color-content-text-inverted);
        font-size: 14px;
        font-family: Geist;
        font-weight: 600;
        line-height: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
