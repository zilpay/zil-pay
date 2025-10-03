<script lang="ts">
    import type { Snippet } from 'svelte';
    import RightIcon from './icons/Right.svelte';

    let {
        left,
        title,
        subtitle,
        tag,
        right,
        onaction,
        selected = false
    }: {
        left?: Snippet;
        title: string;
        subtitle: string;
        tag?: string;
        right?: Snippet;
        onaction?: () => void;
        selected?: boolean;
    } = $props();
</script>

<button class="action-card" class:selected onclick={onaction}>
    {#if left}
        <div class="card-left">
            {@render left()}
        </div>
    {/if}
    <div class="card-info">
        <div class="card-title">{title}</div>
        <div class="card-subtitle">{subtitle}</div>
        {#if tag}
            <div class="card-tag">{tag}</div>
        {/if}
    </div>
    {#if right}
        <div class="card-right">
            {@render right()}
        </div>
    {:else}
        <div class="card-right">
            <RightIcon />
        </div>
    {/if}
</button>

<style lang="scss">
    .action-card {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px;
        background: var(--color-cards-navigation-base-default);
        border: 1px solid transparent;
        border-radius: 12px;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;

        &:hover:not(.selected) {
            background-color: var(--color-cards-navigation-base-hover) ;
        }

        &.selected {
            background: var(--color-cards-regular-base-selected);
            border-color: var(--Cards-regular-border-selected, rgba(172, 89, 255, 0.30));
        }
    }

    .card-left {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 24px;
        height: 24px;

        :global(svg) {
            width: 100%;
            height: 100%;
        }
    }

    .card-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .card-title {
        color: var(--color-content-text-inverted);
        font-size: 14px;
        font-family: Geist;
        font-weight: 600;
        line-height: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .card-subtitle {
        color: var(--color-content-text-secondary);
        font-size: 12px;
        font-family: Geist;
        font-weight: 400;
        line-height: 16px;
    }

    .card-tag {
        color: var(--color-neutral-tag-purple-text);
        font-size: 12px;
        font-family: Geist;
        font-weight: 400;
        line-height: 16px;
        margin-top: 4px;
    }

    .card-right {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-left: auto;

        :global(svg) {
            width: 24px;
            height: 24px;
            color: var(--color-content-icon-secondary);
        }
    }
</style>
