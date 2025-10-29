<script lang="ts">
    import FastImg from './FastImg.svelte';
    import Jazzicon from './Jazzicon.svelte';

    let {
        icon,
        title,
        domain,
        message
    }: {
        icon?: string;
        title: string;
        domain: string;
        message?: string;
    } = $props();
</script>

<div class="dapp-info">
    <div class="dapp-header">
        <div class="dapp-icon">
            {#if icon}
                <FastImg src={icon} alt={title} />
            {:else}
                <Jazzicon seed={domain} diameter={48} />
            {/if}
        </div>
        <div class="dapp-details">
            <h2 class="dapp-title">{title}</h2>
            <p class="dapp-domain">{domain}</p>
        </div>
    </div>
    {#if message}
        <div class="dapp-message">
            <p>{message}</p>
        </div>
    {/if}
</div>

<style lang="scss">
    .dapp-info {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        background: var(--color-cards-regular-base-default);
        border: 1px solid var(--color-cards-regular-border-default);
        border-radius: 12px;
    }

    .dapp-header {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .dapp-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;

        :global(img) {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .dapp-details {
        flex: 1;
        min-width: 0;
    }

    .dapp-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-content-text-primary);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .dapp-domain {
        font-size: 14px;
        color: var(--color-content-text-secondary);
        margin: 4px 0 0 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .dapp-message {
        padding-top: 8px;
        border-top: 1px solid var(--color-cards-regular-border-default);

        p {
            margin: 0;
            font-size: 14px;
            color: var(--color-content-text-secondary);
            line-height: 1.5;
        }
    }
</style>
