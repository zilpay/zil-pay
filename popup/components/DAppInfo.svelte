<script lang="ts">
    import type { Snippet } from 'svelte';
    import FastImg from './FastImg.svelte';
    import Jazzicon from './Jazzicon.svelte';

    let {
        icon,
        title,
        domain,
        message,
        right = undefined,
        compact = false,
        iconSize = 48
    }: {
        icon?: string;
        title: string;
        domain: string;
        message?: string;
        right?: Snippet;
        compact?: boolean;
        iconSize?: number;
    } = $props();
</script>

<div
    class="dapp-info"
    class:compact
    role="region"
    aria-label={`${title} (${domain})`}
>
    <div class="dapp-header">
        <div
            class="dapp-icon"
            style:width={`${iconSize}px`}
            style:height={`${iconSize}px`}
        >
            {#if icon}
                <FastImg src={icon} alt={title} />
            {:else}
                <Jazzicon seed={domain} diameter={iconSize} />
            {/if}
        </div>

        <div class="dapp-details">
            <h2 class="dapp-title">{title}</h2>
            <p class="dapp-domain" dir="ltr">{domain}</p>
        </div>

        {#if right}
            <div class="dapp-right">
                {@render right()}
            </div>
        {/if}
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

        &.compact {
            gap: 12px;
            padding: 12px;
        }
    }

    .dapp-header {
        display: flex;
        align-items: center;
        gap: 12px;

        .compact & {
            gap: 8px;
        }
    }

    .dapp-icon {
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
        background: var(--color-neutral-background-container);

        :global(img) {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .dapp-details {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .dapp-title {
        font-size: var(--font-size-large);
        font-weight: 600;
        color: var(--color-content-text-inverted);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.35;
    }

    .dapp-domain {
        font-size: var(--font-size-medium);
        color: var(--color-content-text-secondary);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.3;
    }

    .dapp-right {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: auto;

        :global(*) {
            display: inline-flex;
        }
    }

    .dapp-message {
        padding-top: 8px;
        border-top: 1px solid var(--color-cards-regular-border-default);

        p {
            margin: 0;
            font-size: var(--font-size-medium);
            color: var(--color-content-text-secondary);
            line-height: 1.5;
            word-break: break-word;
            white-space: pre-wrap;
        }
    }
</style>
