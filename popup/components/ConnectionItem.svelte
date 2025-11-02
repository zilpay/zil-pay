<script lang="ts">
    import type { IWeb3ConnectionState } from 'background/storage/connections';
    import Jazzicon from './Jazzicon.svelte';
    import FastImg from './FastImg.svelte';

    let {
        connection,
        onclick = () => {}
    }: {
        connection: IWeb3ConnectionState;
        onclick?: () => void;
    } = $props();

    const connectedDate = $derived(new Date(connection.connectedAt).toLocaleDateString());
    const accountsCount = $derived(connection.connectedAccounts.length);
    const chainsCount = $derived(connection.connectedChains.length);
</script>

<button class="connection-item" {onclick}>
    <div class="icon-container">
        {#if connection.icon}
            <FastImg src={connection.icon} alt={connection.title} />
        {:else}
            <Jazzicon seed={connection.origin} diameter={40} />
        {/if}
    </div>
    
    <div class="content">
        <div class="title-row">
            <span class="title">{connection.title || connection.domain}</span>
        </div>
        <div class="info-row">
            <span class="domain">{connection.domain}</span>
            <span class="separator">•</span>
            <span class="connected-date">{connectedDate}</span>
        </div>
        <div class="stats-row">
            <span class="stat">{accountsCount} account{accountsCount !== 1 ? 's' : ''}</span>
            <span class="separator">•</span>
            <span class="stat">{chainsCount} chain{chainsCount !== 1 ? 's' : ''}</span>
        </div>
    </div>
</button>

<style lang="scss">
    .connection-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px;
        background: var(--color-cards-regular-base-default);
        border: none;
        outline: 1px solid var(--color-cards-regular-border-default);
        outline-offset: -1px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;

        &:hover {
            outline-color: var(--color-cards-regular-border-hover);
            background: var(--color-cards-regular-base-hover);
        }

        &:active {
            transform: scale(0.98);
        }
    }

    .icon-container {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;

        :global(img) {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .title-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .title {
        font-family: Geist;
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .info-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        line-height: 16px;
    }

    .domain {
        font-family: Geist;
        color: var(--color-content-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 500;
    }

    .connected-date {
        font-family: Geist;
        color: var(--color-content-text-tertiary);
        white-space: nowrap;
        font-weight: 400;
    }

    .stats-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        line-height: 16px;
    }

    .stat {
        font-family: Geist;
        color: var(--color-content-text-tertiary);
        font-weight: 400;
    }

    .separator {
        color: var(--color-content-text-tertiary);
        font-size: 12px;
    }
</style>
