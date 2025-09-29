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
  class="option-card"
  class:selected
  onclick={handleClick}
  {disabled}
  aria-pressed={selected}
>
  <div class="option-icon" class:is-url={isIconUrl}>
    {#if isIconUrl}
      <FastImg src={icon as string} class="icon-image" width="45" height="45"/>
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
        {#each tags as tag}
          {@const tagType = getTagType(tag)}
          {@const tagText = getTagText(tag)}
          <span class="tag tag--{tagType}">{tagText}</span>
        {/each}
      </div>
    {/if}
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
  .option-card {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 16px;
    background-color: var(--color-button-regular-quaternary-default);
    border: 1px solid transparent;
    border-radius: 16px;
    cursor: pointer;
    text-align: left;
    min-height: 80px;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      border-color: var(--color-cards-regular-border-default);
      background-color: var(--color-cards-regular-base-default);
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
    width: 40px;
    height: 40px;
    margin-right: 16px;
    flex-shrink: 0;
    border-radius: 50%;
    overflow: hidden;
    
    &.is-url {
      background-color: var(--color-neutral-background-container);
    }

    :global(svg) {
      width: 24px;
      height: 24px;
      color: var(--color-content-icon-accent-secondary);
    }
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
    gap: 8px;
    margin-right: 12px;
    overflow: hidden;
  }
  
  .text-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .option-title {
    font-size: var(--font-size-large);
    font-weight: 600;
    color: var(--color-content-text-inverted);
    margin: 0;
  }

  .option-description {
    font-size: var(--font-size-medium);
    color: var(--color-content-text-secondary);
    margin: 0;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tag {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: var(--font-size-small);
    font-weight: 600;
    white-space: nowrap;

    &--mainnet {
      background-color: color-mix(in srgb, var(--color-notification-positive-content) 15%, transparent);
      color: var(--color-notification-positive-content);
    }

    &--testnet {
      background-color: color-mix(in srgb, var(--color-neutral-tag-purple-fg) 15%, transparent);
      color: var(--color-neutral-tag-purple-text);
    }

    &--info {
      background-color: color-mix(in srgb, var(--color-neutral-tag-pink-fg) 15%, transparent);
      color: var(--color-neutral-tag-pink-text);
    }
    
    &--default, &--warning {
      background-color: color-mix(in srgb, var(--color-content-text-secondary) 15%, transparent);
      color: var(--color-content-text-secondary);
    }
  }

  .arrow-indicator {
    color: var(--color-content-icon-secondary);
    opacity: 0.5;
  }

  .option-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }
</style>
