<script lang="ts">
    import { truncate } from 'popup/mixins/address';
    import RightIcon from './icons/Right.svelte';

    let {
        fromName,
        fromAddress,
        toName,
        toAddress
    }: {
        fromName: string;
        fromAddress: string;
        toName: string;
        toAddress: string;
    } = $props();
</script>

<div class="transfer-route">
    <div class="endpoint">
        <div class="name">{fromName}</div>
        <div class="address">{truncate(fromAddress, 10, 4)}</div>
    </div>
    <div class="arrow-icon">
        <RightIcon />
    </div>
    <div class="endpoint">
        <div class="name">{toName}</div>
        <div class="address">{truncate(toAddress, 10, 4)}</div>
    </div>
</div>

<style lang="scss">
    .transfer-route {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 12px;
        background: var(--color-cards-regular-base-default);
        border-radius: 12px;
        border: 1px solid var(--color-cards-regular-border-default);
    }

    .endpoint {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 0;
    }

    .name {
        color: var(--color-content-text-inverted);
        font-size: 12px;
        line-height: 16px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }

    .address {
        padding: 2px 6px;
        background: var(--color-neutral-background-container);
        border-radius: 4px;
        color: var(--color-content-text-secondary);
        font-size: 12px;
        line-height: 16px;
    }

    .arrow-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--color-neutral-tag-purple-fg) 5%, transparent);
        border-radius: 8px;
        flex-shrink: 0;

        :global(svg) {
            width: 24px;
            height: 24px;
            color: var(--color-content-icon-accent-secondary);
        }
    }
</style>
