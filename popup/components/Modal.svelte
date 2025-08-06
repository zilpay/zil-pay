<script lang="ts">
  import type { Snippet } from 'svelte';
  import { scale, fade, fly } from 'svelte/transition';
  import Close from './icons/Close.svelte';

  let {
    title = '',
    show = $bindable(false),
    onClose = () => {},
    width = '500px',
    closeOnOverlay = true,
    children
  }: {
    title?: string;
    show?: boolean;
    onClose?: () => void;
    width?: string;
    closeOnOverlay?: boolean;
    children?: Snippet;
  } = $props();

  let modalRef: HTMLElement | null = $state(null);
  let isSmallScreen = $state(false);

  function handleClose() {
    show = false;
    onClose();
  }

  function handleOverlayClick(event: MouseEvent) {
    if (closeOnOverlay && event.target === modalRef) {
      handleClose();
    }
  }

  function handleOverlayKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      if (closeOnOverlay && event.target === modalRef) {
        event.preventDefault();
        handleClose();
      }
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && show) {
      handleClose();
    }
  }

  function checkScreenSize() {
    if (typeof window !== 'undefined') {
      isSmallScreen = window.innerWidth <= 480 || window.innerHeight <= 600;
    }
  }

  $effect(() => {
    checkScreenSize();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkScreenSize);
      return () => {
        window.removeEventListener('resize', checkScreenSize);
      };
    }
  });

  $effect(() => {
    if (show) {
      document.addEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'hidden';
      
      const focusableElements = modalRef?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

      if (firstElement) {
        firstElement.focus();
      }

      function handleTabKey(e: KeyboardEvent) {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
      }

      document.addEventListener('keydown', handleTabKey);
      
      return () => {
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('keydown', handleTabKey);
        document.body.style.overflow = '';
      };
    }
  });
</script>

{#if show}
  <div
    bind:this={modalRef}
    class="modal-overlay"
    class:small-screen={isSmallScreen}
    transition:fade={{ delay: 0, duration: 250 }}
    onclick={handleOverlayClick}
    onkeydown={handleOverlayKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
    tabindex="-1"
  >
    {#if isSmallScreen}
      {#key show}
        <div
          class="modal-content small-screen"
          in:fly={{ y: 300, duration: 300, opacity: 1 }}
          out:fly={{ y: 300, duration: 250, opacity: 1 }}
          role="document"
        >
          <div class="modal-header">
            {#if title}
              <h2 id="modal-title" class="modal-title">
                {title}
              </h2>
            {/if}
            <button
              class="modal-close-button"
              onclick={handleClose}
              aria-label="Close modal"
              type="button"
            >
              <Close width={24} height={24} />
            </button>
          </div>
          
          <div class="modal-body">
            {#if children}
              {@render children()}
            {/if}
          </div>
        </div>
      {/key}
    {:else}
      {#key show}
        <div
          class="modal-content"
          style="max-width: {width}"
          in:scale={{ delay: 0, duration: 250 }}
          out:scale={{ delay: 0, duration: 200 }}
          role="document"
        >
          <div class="modal-header">
            {#if title}
              <h2 id="modal-title" class="modal-title">
                {title}
              </h2>
            {/if}
            <button
              class="modal-close-button"
              onclick={handleClose}
              aria-label="Close modal"
              type="button"
            >
              <Close width={24} height={24} />
            </button>
          </div>
          
          <div class="modal-body">
            {#if children}
              {@render children()}
            {/if}
          </div>
        </div>
      {/key}
    {/if}
  </div>
{/if}

<style lang="scss">
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    box-sizing: border-box;

    &.small-screen {
      align-items: flex-end;
      padding: 0;
    }

    &:focus {
      outline: none;
    }
  }

  .modal-content {
    width: 100%;
    background: var(--card-background);
    border-radius: 16px;
    box-shadow: 0 20px 40px color-mix(in srgb, var(--text-primary) 20%, transparent);
    overflow: hidden;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    border: 1px solid color-mix(in srgb, var(--text-secondary) 15%, transparent);

    &.small-screen {
      max-height: 85vh;
      border-radius: 16px 16px 0 0;
      margin: 0;
      box-shadow: 0 -10px 40px color-mix(in srgb, var(--text-primary) 30%, transparent);
      max-width: none !important;
    }

    &:focus {
      outline: none;
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid color-mix(in srgb, var(--text-secondary) 15%, transparent);
    background: var(--background-color);
    flex-shrink: 0;
    position: relative;

    .small-screen & {
      padding: 16px 20px;
      
      &::before {
        content: '';
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        width: 36px;
        height: 4px;
        background: color-mix(in srgb, var(--text-secondary) 40%, transparent);
        border-radius: 2px;
      }
    }
  }

  .modal-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.3;

    .small-screen & {
      font-size: var(--font-size-large);
    }
  }

  .modal-close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 8px;
    transition: all 0.2s ease;
    color: var(--text-secondary);

    &:focus {
      outline: none;
      background: color-mix(in srgb, var(--primary-purple) 15%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-purple) 20%, transparent);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
    min-height: 0;

    .small-screen & {
      padding: 20px;
      padding-bottom: max(20px, env(safe-area-inset-bottom));
    }
  }

  .modal-body::-webkit-scrollbar {
    width: 6px;
  }

  .modal-body::-webkit-scrollbar-track {
    background: transparent;
  }

  .modal-body::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--text-secondary) 30%, transparent);
    border-radius: 3px;

    &:hover {
      background: color-mix(in srgb, var(--text-secondary) 50%, transparent);
    }
  }

  @media (max-width: 400px), (max-height: 600px) {
    .modal-overlay {
      align-items: flex-end;
      padding: 0;
    }

    .modal-content {
      max-height: 90vh;
      border-radius: 12px 12px 0 0;
    }

    .modal-header {
      padding: 12px 16px;

      &::before {
        top: 6px;
        width: 32px;
        height: 3px;
      }
    }

    .modal-title {
      font-size: var(--font-size-medium);
    }

    .modal-body {
      padding: 16px;
    }
  }

  @media (max-width: 360px) {
    .modal-header {
      padding: 10px 14px;
    }

    .modal-body {
      padding: 14px;
    }
  }
</style>
