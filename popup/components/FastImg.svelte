<script lang="ts">
  let { src, alt = '', ...rest } = $props();

  let isLoading = $state(true);
  let hasError = $state(false);

  $effect(() => {
    if (!src) {
      isLoading = false;
      hasError = true;
      return;
    }

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
  <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8.11 2.79"></path>
    <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
    <path d="m2 2 20 20"></path>
  </svg>
{:else}
  <img {src} {alt} loading="lazy" {...rest} />
{/if}

<style lang="scss">
  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid color-mix(in srgb, var(--primary-purple) 30%, transparent);
    border-top: 3px solid var(--primary-purple);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
