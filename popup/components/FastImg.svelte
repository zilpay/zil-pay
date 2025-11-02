<script lang="ts">
    let {
        src,
        alt = '',
        ...rest
    }: {
        src: string;
        alt?: string;
        [key: string]: any;
    } = $props();

    let isLoading = $state(true);
    let hasError = $state(false);

    $effect(() => {
        if (!src) {
            isLoading = false;
            hasError = true;
            return;
        }

        isLoading = true;
        hasError = false;
        
        const img = new Image();
        img.src = src;
        img.onload = () => isLoading = false;
        img.onerror = () => {
            isLoading = false;
            hasError = true;
        };

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    });
</script>

{#if isLoading}
    <div class="loader-container">
        <div class="loading-spinner"></div>
    </div>
{:else if hasError}
    <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
{:else}
    <img {src} {alt} loading="lazy" {...rest} />
{/if}

<style lang="scss">
    .loader-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    }

    .loading-spinner {
        width: 75%;
        aspect-ratio: 1;
        max-width: 24px;
        
        border: 3px solid color-mix(in srgb, var(--color-content-text-purple) 30%, transparent);
        border-top-color: var(--color-content-text-purple);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        box-sizing: border-box;
    }

    .error-icon {
        width: 75%;
        max-width: 24px;
        aspect-ratio: 1;
        color: var(--color-negative-border-primary);
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>
