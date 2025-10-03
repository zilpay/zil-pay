<script lang="ts">
    import RightIcon from './icons/Right.svelte';
    import type { Component } from 'svelte';

    let {
        Icon,
        title,
        subtitle,
        tag,
        onaction
    }: {
        Icon: Component;
        title: string;
        subtitle: string;
        tag?: string;
        onaction: () => void;
    } = $props();
</script>

<button class="action-card" onclick={onaction}>
    <div class="card-icon">
        <Icon />
    </div>
    <div class="card-info">
        <div class="card-title">{title}</div>
        <div class="card-subtitle">{subtitle}</div>
        {#if tag}
            <div class="card-tag">{tag}</div>
        {/if}
    </div>
    <div class="card-arrow">
        <RightIcon />
    </div>
</button>

<style lang="scss">
    .action-card {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 12px;
        background: var(--color-cards-navigation-base-default);
        border: none;
        border-radius: 16px;
        cursor: pointer;
        text-align: left;
        position: relative;
        transition: background-color 0.2s ease;
        
        &:hover {
            background: var(--color-cards-navigation-base-hover);
        }
    }
    
    .card-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        :global(svg) {
            width: 24px;
            height: 24px;
            color: var(--color-content-icon-secondary);
        }
    }
    
    .card-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .card-title {
        color: var(--color-content-text-inverted);
        font-size: 16px;
        font-family: Geist;
        font-weight: 400;
        line-height: 22px;
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
        padding-left: 40px;
    }
    
    .card-arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        :global(svg) {
            width: 24px;
            height: 24px;
            color: var(--color-cards-navigation-icon-secondary);
        }
    }
</style>
