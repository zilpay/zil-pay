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

    const isIconUrl = $derived(
        typeof icon === 'string' &&
        (icon.startsWith('http') || icon.startsWith('data:') || icon.startsWith('/'))
    );

    const hasCustomAccessory = $derived(!!rightAccessory);

    const normalizedTags = $derived(
        tags.map(tag => ({
            text: typeof tag === 'string' ? tag : tag.text,
            type: resolveTagType(tag)
        }))
    );

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

    function handleClick() {
        if (!disabled) {
            onclick();
        }
    }
</script>

<button
    class="option-card"
    class:selected
    class:compact
    class:disabled
    onclick={handleClick}
    {disabled}
    aria-pressed={selected}
    type="button"
>
    <div class="option-icon" class:is-url={isIconUrl}>
        {#if isIconUrl}
            <FastImg src={icon as string} class="icon-image" />
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

        {#if normalizedTags.length > 0}
            <div class="tags-container">
                {#each normalizedTags as tag (tag.text)}
                    <span class="tag tag--{tag.type}">
                        {tag.text}
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
    {/if}
</button>

<style lang="scss">
    .option-card {
        display: flex;
        align-items: center;
        width: 100%;
        background: var(--color-button-regular-quaternary-default);
        border: 1px solid transparent;
        border-radius: 16px;
        cursor: pointer;
        text-align: left;
        transition: background 0.2s ease, border-color 0.2s ease;
        padding: 16px;
        gap: 16px;

        &.compact {
            padding: 12px;
            gap: 12px;
        }

        &:hover:not(:disabled):not(.selected) {
            background: var(--color-cards-regular-base-default);
            border-color: var(--color-cards-regular-border-default);
        }

        &:focus-visible {
            outline: 2px solid var(--color-inputs-border-focus);
            outline-offset: 2px;
        }

        &.disabled,
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
        background: var(--color-neutral-background-container);
        border-radius: 50%;
        flex-shrink: 0;
        overflow: hidden;

        &.is-url {
            background: var(--color-neutral-background-base);
        }

        :global(.icon-image) {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .icon-symbol {
            font-size: var(--font-size-xl);
            font-weight: 600;
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
        flex: 1;
        min-width: 0;
        gap: 8px;
    }

    .text-content {
        display: flex;
        flex-direction: column;
        min-width: 0;
        gap: 2px;
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
        padding: 2px 8px;
        font-size: var(--font-size-small);
        font-weight: 600;
        line-height: 16px;
        border: 1px solid transparent;
        border-radius: 12px;
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
    .arrow-indicator {
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
