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
        background: var(--color-neutral-background-container);
        border: 1px solid var(--color-neutral-border-default);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
            border-color: var(--color-neutral-border-hover);
            background: var(--color-button-regular-quaternary-hover);
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
        font-size: var(--font-size-large);
        font-weight: 500;
        color: var(--color-content-text-inverted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .info-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: var(--font-size-small);
    }

    .domain {
        font-family: Geist;
        color: var(--color-content-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .connected-date {
        font-family: Geist;
        color: var(--color-content-text-tertiary);
        white-space: nowrap;
    }

    .stats-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: var(--font-size-small);
    }

    .stat {
        font-family: Geist;
        color: var(--color-content-text-tertiary);
    }

    .separator {
        color: var(--color-content-text-tertiary);
        font-size: var(--font-size-small);
    }
</style>
