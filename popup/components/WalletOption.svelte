<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import FastImg from './FastImg.svelte';

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
    tags = []
  }: {
    title: string;
    description: string;
    icon: string | typeof SvelteComponent;
    onclick?: () => void;
    disabled?: boolean;
    selected?: boolean;
    tags?: (string | TagConfig)[];
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

  <div class="option-selector">
    {#if selected}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="var(--primary-purple)" stroke-width="2"/>
        <circle cx="12" cy="12" r="6" fill="var(--primary-purple)"/>
      </svg>
    {:else}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="var(--border-color)" stroke-width="2"/>
      </svg>
    {/if}
  </div>
</button>

<style lang="scss">
  .wallet-option {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 20px;
    background-color: var(--card-background);
    border: 2px solid transparent;
    border-radius: 16px;
    cursor: pointer;
    text-align: left;
    min-height: 80px;
    transition: all 0.2s ease;

    &.selected {
      border-color: var(--primary-purple);
      background-color: color-mix(in srgb, var(--primary-purple) 8%, var(--card-background));
    }

    &:hover:not(:disabled) {
      border-color: color-mix(in srgb, var(--primary-purple) 30%, transparent);
      background-color: color-mix(in srgb, var(--card-background) 95%, var(--primary-purple));
    }

    &:focus:not(:disabled) {
      outline: none;
      border-color: var(--primary-purple);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-purple) 15%, transparent);
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
      background-color: color-mix(in srgb, var(--card-background) 80%, transparent);
      
      .option-title {
        color: color-mix(in srgb, var(--text-primary) 60%, transparent);
      }
      
      .option-description {
        color: color-mix(in srgb, var(--text-secondary) 50%, transparent);
      }
      
      .option-icon {
        opacity: 0.5;
        background: color-mix(in srgb, var(--primary-purple) 50%, transparent);
        box-shadow: none;
      }

      .tag {
        opacity: 0.5;
      }
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
    background: linear-gradient(135deg, var(--primary-purple), color-mix(in srgb, var(--primary-purple) 80%, #000));
    border-radius: 12px;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-purple) 25%, transparent);
    overflow: hidden;
    transition: all 0.2s ease;

    &.url {
      background: transparent;
      box-shadow: none;
    }
  }

  .icon-symbol {
    font-size: calc(var(--font-size-xl) * 1.6);
    font-weight: bold;
    color: white;
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
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.3;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .option-description {
    font-size: var(--font-size-medium);
    color: var(--text-secondary);
    margin: 0;
    opacity: 0.8;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex-shrink: 0;
    align-items: flex-start;
    max-width: 50%;
  }

  .tag {
    padding: 2px 6px;
    border-radius: 6px;
    font-size: var(--font-size-small);
    font-weight: 500;
    white-space: nowrap;
    line-height: 1.2;
    transition: all 0.2s ease;

    &--mainnet {
      background-color: color-mix(in srgb, var(--success-color) 15%, transparent);
      color: var(--success-color);
      border: 1px solid color-mix(in srgb, var(--success-color) 30%, transparent);
    }

    &--testnet {
      background-color: color-mix(in srgb, var(--warning-color) 15%, transparent);
      color: var(--warning-color);
      border: 1px solid color-mix(in srgb, var(--warning-color) 30%, transparent);
    }

    &--warning {
      background-color: color-mix(in srgb, var(--danger-color) 15%, transparent);
      color: var(--danger-color);
      border: 1px solid color-mix(in srgb, var(--danger-color) 30%, transparent);
    }

    &--info {
      background-color: color-mix(in srgb, var(--primary-purple) 15%, transparent);
      color: var(--primary-purple);
      border: 1px solid color-mix(in srgb, var(--primary-purple) 30%, transparent);
    }

    &--success {
      background-color: color-mix(in srgb, var(--success-color) 15%, transparent);
      color: var(--success-color);
      border: 1px solid color-mix(in srgb, var(--success-color) 30%, transparent);
    }

    &--default {
      background-color: color-mix(in srgb, var(--text-secondary) 15%, transparent);
      color: var(--text-secondary);
      border: 1px solid color-mix(in srgb, var(--text-secondary) 30%, transparent);
    }
  }

  .option-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .wallet-option:hover:not(:disabled) .option-selector {
    transform: scale(1.1);
  }

  @media (max-width: 480px) {
    .wallet-option {
      padding: 16px;
      min-height: 72px;
    }

    .option-icon {
      width: 44px;
      height: 44px;
      margin-right: 14px;
    }

    .option-header {
      gap: 8px;
      flex-direction: column;
      align-items: flex-start;
    }

    .option-title {
      font-size: var(--font-size-large);
      white-space: normal;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      display: -webkit-box;
    }

    .tags-container {
      max-width: 100%;
      gap: 3px;
    }

    .tag {
      font-size: calc(var(--font-size-small) * 0.9);
      padding: 1px 4px;
    }
  }

  @media (max-width: 360px) {
    .wallet-option {
      padding: 14px;
    }

    .option-icon {
      width: 40px;
      height: 40px;
      margin-right: 12px;
    }

    .option-header {
      gap: 6px;
    }

    .tag {
      font-size: calc(var(--font-size-small) * 0.85);
    }
  }
</style>

