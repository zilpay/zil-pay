<script lang="ts">
  import RefreshIcon from './icons/ReloadIcon.svelte';

  export let onClick: () => void = () => {};
  export let ariaLabel = 'Reload';
  export let size: number = 24;
</script>

<button class="reload-button" on:click={onClick} aria-label={ariaLabel}>
  <RefreshIcon class="hover-icon" width={size} height={size} />
</button>

<style lang="scss">
  .reload-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .reload-button:hover :global(.hover-icon path) {
    fill: var(--secondary-purple);
  }
</style>
