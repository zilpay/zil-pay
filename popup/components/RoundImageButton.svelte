<script lang="ts">
  import FastImg from './FastImg.svelte';

  let {
    imageSrc = '',
    alt = '',
    disabled = false,
    onclick = () => {}
  }: {
    imageSrc?: string;
    alt?: string;
    disabled?: boolean;
    onclick?: () => void;
  } = $props();

  function handleClick() {
    if (!disabled) {
      onclick();
    }
  }
</script>

<button
  class="round-image-button"
  class:disabled
  onclick={handleClick}
  {disabled}
  aria-label={alt}
  type="button"
>
  <div class="image-container">
    {#if imageSrc}
      <FastImg
        src={imageSrc}
        {alt}
        class="button-image"
      />
    {/if}
  </div>
  
  <div class="arrow-icon">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
</button>

<style lang="scss">
  .round-image-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px 4px 4px;
    background: var(--card-background);
    border: 1px solid color-mix(in srgb, var(--text-secondary) 15%, transparent);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 36px;
    box-sizing: border-box;

    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--primary-purple) 8%, var(--card-background));
      border-color: color-mix(in srgb, var(--primary-purple) 25%, transparent);
    }

    &:focus:not(:disabled) {
      outline: none;
      border-color: var(--primary-purple);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-purple) 20%, transparent);
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }

    &.disabled,
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .image-container {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--background-color);
    flex-shrink: 0;
  }

  .image-container :global(.button-image) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .arrow-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    transition: color 0.2s ease;
    flex-shrink: 0;
  }

  .round-image-button:hover:not(:disabled) .arrow-icon {
    color: var(--primary-purple);
  }

  @media (max-width: 480px) {
    .round-image-button {
      padding: 3px 10px 3px 3px;
      gap: 6px;
      min-height: 32px;
    }

    .image-container {
      width: 26px;
      height: 26px;
    }

    .arrow-icon svg {
      width: 10px;
      height: 10px;
    }
  }

  @media (max-width: 360px) {
    .round-image-button {
      padding: 2px 8px 2px 2px;
      gap: 4px;
      min-height: 28px;
    }

    .image-container {
      width: 24px;
      height: 24px;
    }

    .arrow-icon svg {
      width: 8px;
      height: 8px;
    }
  }
</style>
