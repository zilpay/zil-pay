<script lang="ts">
    import type { Snippet } from 'svelte';
    import { pop } from '../router/navigation';
    import LeftArrowIcon from './icons/LedftArrow.svelte';
    import CloseIcon from './icons/Close.svelte';

    let { 
        title = '',
        disabled = false,
        right,
        onback = pop
    }: {
        title?: string,
        disabled?: boolean,
        right?: Snippet,
        onback?: () => void
    } = $props();

    const canGoBack = $derived(window.history.length > 1);

    function handleBack() {
        if (canGoBack) {
            onback();
        } else {
            window.close();
        }
    }
</script>

<nav class="nav-bar">
    <button class="back-button" onclick={handleBack} {disabled}>
        {#if canGoBack}
            <LeftArrowIcon />
        {:else}
            <CloseIcon />
        {/if}
    </button>
    <h1 class="nav-title">{title}</h1>
    <div class="right-container">
        {#if right}
            {@render right()}
        {/if}
    </div>
</nav>

<style lang="scss">
    .nav-bar {
        display: flex;
        align-items: center;
        width: 100%;
        height: 56px;
        box-sizing: border-box;
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

        :global(svg) {
            width: 24px;
            height: 24px;
        }
    }

    .nav-title {
        flex: 1;
        font-size: var(--font-size-xl);
        font-weight: 700;
        line-height: 30px;
        color: var(--color-content-text-inverted);
        margin: 0;
        text-align: center;
    }

    .right-container {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 36px;
        height: 36px;
        flex-shrink: 0;
    }
</style>
