<script lang="ts">
    import type { SvelteComponent, Snippet } from 'svelte';
    import FastImg from './FastImg.svelte';
    import RightIcon from './icons/Right.svelte';

    interface TagConfig {
        text: string;
        type?: 'mainnet' | 'testnet' | 'id' | 'warning' | 'info' | 'default';
    }

    let {
        title,
        description,
        icon,
        onclick = () => {},
        disabled = false,
        selected = false,
        tags = [],
        showArrow = false,
        rightAccessory = undefined,
        compact = false
    }: {
        title: string;
        description: string;
        icon: string | typeof SvelteComponent;
        onclick?: () => void;
        disabled?: boolean;
        selected?: boolean;
        tags?: (string | TagConfig)[];
        showArrow?: boolean;
        rightAccessory?: Snippet;
        compact?: boolean;
    } = $props();

    function handleClick() {
        if (!disabled) {
            onclick();
        }
    }

    function resolveTagType(tag: string | TagConfig): TagConfig['type'] {
        if (typeof tag === 'object' && tag.type) {
            return tag.type;
        }

        const text = typeof tag === 'string' ? tag : tag.text;
        const normalized = text.trim().toLowerCase();

        if (normalized.startsWith('id')) return 'id';
        if (normalized.includes('mainnet')) return 'mainnet';
        if (normalized.includes('testnet')) return 'testnet';
        if (normalized.includes('beta') || normalized.includes('experimental')) return 'warning';
        if (normalized.includes('chain')) return 'info';

        return 'default';
    }

    function resolveTagText(tag: string | TagConfig) {
        return typeof tag === 'string' ? tag : tag.text;
    }

    const isIconUrl =
        typeof icon === 'string' &&
        (icon.startsWith('http') || icon.startsWith('data:') || icon.startsWith('/'));

    const hasCustomAccessory = !!rightAccessory;
</script>

<button
    class="option-card"
    class:selected
    class:compact
    onclick={handleClick}
    {disabled}
    aria-pressed={selected}
>
    <div class="option-icon" class:is-url={isIconUrl}>
        {#if isIconUrl}
            <FastImg src={icon as string} class="icon-image" width="45" height="45" />
        {:else if typeof icon === 'string'}
            <span class="icon-symbol">{icon}</span>
        {:else}
            {@const Component = icon}
            <Component />
        {/if}
    </div>

    <div class="option-content">
        <div class="text-content">
            <h3 class="option-title">{title}</h3>
            <p class="option-description">{description}</p>
        </div>

        {#if tags.length > 0}
            <div class="tags-container">
                {#each tags as tag (resolveTagText(tag))}
                    {@const tagType = resolveTagType(tag)}
                    <span class="tag tag--{tagType}">
                        {resolveTagText(tag)}
                    </span>
                {/each}
            </div>
        {/if}
    </div>

    {#if hasCustomAccessory}
        <div class="custom-accessory">
            {@render rightAccessory?.()}
        </div>
    {:else if showArrow}
        <div class="arrow-indicator">
            <RightIcon />
        </div>
    {:else}
        <div class="option-selector">
            {#if selected}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="var(--color-controls-selector-select)" stroke-width="2" />
                    <circle cx="12" cy="12" r="6" fill="var(--color-controls-selector-select)" />
                </svg>
            {:else}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="var(--color-controls-selector-border)" stroke-width="2" />
                </svg>
            {/if}
        </div>
    {/if}
</button>

<style lang="scss">
    .option-card {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 16px;
        border-radius: 16px;
        background: var(--color-button-regular-quaternary-default);
        border: 1px solid transparent;
        cursor: pointer;
        transition: background 0.2s ease, border-color 0.2s ease;
        text-align: left;
        gap: 16px;

        &.compact {
            padding: 12px;
            gap: 12px;
        }

        &:hover:not(:disabled) {
            background: var(--color-cards-regular-base-default);
            border-color: var(--color-cards-regular-border-default);
        }

        &:focus-visible {
            outline: 2px solid var(--color-inputs-border-focus);
            outline-offset: 2px;
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 0.6;
        }

        &.selected {
            background: var(--color-cards-regular-base-selected);
            border-color: var(--color-neutral-tag-purple-border);
        }
    }

    .option-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        background: var(--color-neutral-background-container);

        &.is-url {
            background: var(--color-neutral-background-base);
        }

        .icon-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        :global(svg) {
            width: 24px;
            height: 24px;
            color: var(--color-content-icon-accent-secondary);
        }
    }

    .option-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
        min-width: 0;
    }

    .text-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    .option-title {
        margin: 0;
        font-size: var(--font-size-large);
        font-weight: 600;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .option-description {
        margin: 0;
        font-size: var(--font-size-medium);
        font-weight: 400;
        line-height: 16px;
        color: var(--color-content-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        padding: 2px 8px;
        font-size: var(--font-size-small);
        font-weight: 600;
        line-height: 16px;
        border: 1px solid transparent;
        background: var(--color-button-regular-quaternary-default);
        color: var(--color-content-text-secondary);

        &--mainnet,
        &--purple {
            background: var(--color-neutral-tag-purple-fg);
            border-color: var(--color-neutral-tag-purple-border);
            color: var(--color-content-text-primary);
        }

        &--testnet,
        &--id,
        &--info {
            background: var(--color-neutral-tag-pink-fg);
            border-color: var(--color-neutral-tag-pink-border);
            color: var(--color-content-text-primary);
        }

        &--warning,
        &--default {
            background: var(--color-button-regular-quaternary-default);
            border-color: var(--color-neutral-border-hover);
            color: var(--color-content-text-primary);
        }
    }

    .custom-accessory,
    .arrow-indicator,
    .option-selector {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .arrow-indicator {
        color: var(--color-content-icon-secondary);

        :global(svg) {
            width: 16px;
            height: 16px;
        }
    }
</style>
