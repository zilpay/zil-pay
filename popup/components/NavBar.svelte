<script lang="ts">
  import { pop } from '../router/navigation';
  import LeftArrowIcon from './icons/LedftArrow.svelte';

  let { 
    title = '',
    disabled = false
  }: {
    title?: string,
    disabled?: boolean
  } = $props();
</script>

<nav class="nav-bar">
  <button class="back-button" onclick={pop} aria-label="Back" {disabled}>
    <LeftArrowIcon />
  </button>
  <h1 class="nav-title">{title}</h1>
</nav>

<style lang="scss">
  .nav-bar {
    display: flex;
    align-items: center;
    width: 100%;
    height: 56px;
    padding: 0 4px;
    box-sizing: border-box;
    gap: 8px;
  }

  .back-button {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: var(--color-content-text-inverted);
    border-radius: 50%;
    transition: background-color 0.2s ease;
    flex-shrink: 0;

    &:hover:not(:disabled) {
      background-color: var(--color-button-regular-quaternary-hover);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  .nav-title {
    font-size: var(--font-size-xl);
    font-weight: bold;
    color: var(--color-content-text-inverted);
    margin: 0;
  }
</style>
