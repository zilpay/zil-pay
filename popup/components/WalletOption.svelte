<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import FastImg from './FastImg.svelte';
  import RightIcon from './icons/Right.svelte';

  interface TagConfig {
    text: string;
    type?: string;
  }

  let {
    title,
    description,
    icon,
    onclick = () => {},
    disabled = false,
    selected = false,
    tags = [],
    showArrow = false
  }: {
    title: string;
    description: string;
    icon: string | typeof SvelteComponent;
    onclick?: () => void;
    disabled?: boolean;
    selected?: boolean;
    tags?: (string | TagConfig)[];
    showArrow?: boolean;
  } = $props();

  function handleClick() {
    if (!disabled) {
      onclick();
    }
  }

  function getTagType(tag: string | TagConfig): string {
    if (typeof tag === 'object' && tag.type) {
      return tag.type;
    }
    
    const text = typeof tag === 'string' ? tag.toLowerCase() : tag.text.toLowerCase();
    
    if (text.includes('mainnet')) return 'mainnet';
    if (text.includes('testnet')) return 'testnet';
    if (text.includes('chain') || text.includes('id')) return 'info';
    if (text.includes('beta') || text.includes('experimental')) return 'warning';
    
    return 'default';
  }

  function getTagText(tag: string | TagConfig): string {
    return typeof tag === 'string' ? tag : tag.text;
  }

  const isIconUrl = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:') || icon.startsWith('/'));
</script>

<button
  class="wallet-option"
  class:selected
  onclick={handleClick}
  {disabled}
  aria-pressed={selected}
>
  <div class="option-icon" class:url={isIconUrl}>
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
    <div class="option-header">
      <h3 class="option-title">{title}</h3>
      {#if tags.length > 0}
        <div class="tags-container">
          {#each tags as tag}
            {@const tagType = getTagType(tag)}
            {@const tagText = getTagText(tag)}
            <span class="tag tag--{tagType}">{tagText}</span>
          {/each}
        </div>
      {/if}
    </div>
    <p class="option-description">{description}</p>
  </div>

  {#if showArrow}
    <div class="arrow-indicator">
      <RightIcon />
    </div>
  {:else}
    <div class="option-selector">
      {#if selected}
        <svg width="24" height="24" viewBox="0 0 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="var(--color-controls-selector-select)" stroke-width="2"/>
          <circle cx="12" cy="12" r="6" fill="var(--color-controls-selector-select)"/>
        </svg>
      {:else}
        <svg width="24" height="24" viewBox="0 0 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="var(--color-controls-selector-border)" stroke-width="2"/>
        </svg>
      {/if}
    </div>
  {/if}
</button>

<style lang="scss">
  .wallet-option {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 16px;
    background-color: var(--color-cards-regular-base-default);
    border: 1px solid var(--color-cards-regular-border-default);
    border-radius: 16px;
    cursor: pointer;
    text-align: left;
    min-height: 80px;
    transition: all 0.2s ease;

    &.selected {
      border-color: var(--color-content-icon-accent-secondary);
      background-color: var(--color-cards-regular-base-selected);
    }

    &:hover:not(:disabled) {
      border-color: var(--color-cards-regular-border-hover);
      background-color: var(--color-cards-regular-base-selected-hover);
    }

    &:focus:not(:disabled) {
      outline: none;
      border-color: var(--color-content-icon-accent-secondary);
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-right: 16px;
    flex-shrink: 0;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
    
    :global(svg) {
      width: 28px;
      height: 28px;
      color: var(--color-content-icon-accent-secondary);
    }
  }

  .icon-symbol {
    font-size: calc(var(--font-size-xl) * 1.6);
    font-weight: bold;
    color: var(--color-content-icon-accent-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .option-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-right: 12px;
    overflow: hidden;
  }

  .option-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    min-height: 24px;
  }

  .option-title {
    font-size: var(--font-size-large);
    font-weight: 600;
    color: var(--color-content-text-inverted);
    margin: 0;
    line-height: 1.3;
  }

  .option-description {
    font-size: var(--font-size-medium);
    color: var(--color-content-text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex-shrink: 0;
  }

  .tag {
    padding: 2px 6px;
    border-radius: 6px;
    font-size: var(--font-size-small);
    font-weight: 500;
    white-space: nowrap;

    &--mainnet {
      background-color: color-mix(in srgb, var(--color-notification-positive-content) 15%, transparent);
      color: var(--color-notification-positive-content);
      border: 1px solid color-mix(in srgb, var(--color-notification-positive-border) 30%, transparent);
    }

    &--testnet {
      background-color: color-mix(in srgb, var(--color-notification-neutral-content) 15%, transparent);
      color: var(--color-notification-neutral-content);
      border: 1px solid color-mix(in srgb, var(--color-notification-neutral-border) 30%, transparent);
    }

    &--warning {
      background-color: color-mix(in srgb, var(--color-notification-negative-content) 15%, transparent);
      color: var(--color-notification-negative-content);
      border: 1px solid color-mix(in srgb, var(--color-notification-negative-border) 30%, transparent);
    }

    &--info {
      background-color: color-mix(in srgb, var(--color-neutral-tag-purple-fg) 15%, transparent);
      color: var(--color-neutral-tag-purple-text);
      border: 1px solid var(--color-neutral-tag-purple-border);
    }
    
    &--default {
      background-color: color-mix(in srgb, var(--color-content-text-secondary) 15%, transparent);
      color: var(--color-content-text-secondary);
      border: 1px solid color-mix(in srgb, var(--color-content-text-secondary) 30%, transparent);
    }
  }

  .arrow-indicator,
  .option-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    color: var(--color-content-icon-secondary);
  }
</style>
