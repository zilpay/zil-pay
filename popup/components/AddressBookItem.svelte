<script lang="ts">
    import type { IAddressBookRecord } from 'background/storage/book';
    import { truncate } from 'popup/mixins/address';
    import Jazzicon from './Jazzicon.svelte';
    import CopyButton from './CopyButton.svelte';

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
        <Jazzicon seed={record.address} diameter={48} />
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
</style>
