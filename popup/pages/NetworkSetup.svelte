<script lang="ts">
  import { getChains, type Chain } from '../mixins/chains';
  import NavBar from '../components/NavBar.svelte';
  import WalletOption from '../components/WalletOption.svelte';
  import Button from '../components/Button.svelte';
  import { _ } from '../i18n';
  import { pop } from '../router/navigation';

  let isTestnet = $state(false);
  let mainnetChains = $state<Chain[]>([]);
  let testnetChains = $state<Chain[]>([]);
  let loading = $state(true);

  async function loadChains() {
    loading = true;
    const chains = await getChains();
    mainnetChains = chains.mainnet || [];
    testnetChains = chains.testnet || [];
    loading = false;
  }

  $effect(() => {
    loadChains();
  });
</script>

<div class="page-container network-setup">
  <NavBar title="Network Setup" onBack={pop} />

  <div class="controls">
    <div class="toggle-switch">
      <button
        class:selected={!isTestnet}
        onclick={() => isTestnet = false}
      >
        Mainnet
      </button>
      <button
        class:selected={isTestnet}
        onclick={() => isTestnet = true}
      >
        Testnet
      </button>
    </div>
  </div>

  <div class="network-list">
    {#if loading}
      <p class="loading-text">Loading chains...</p>
    {:else}
      {#each isTestnet ? testnetChains : mainnetChains as chain}
        <WalletOption
          title={chain.name}
          description={chain.chain}
          icon={chain.logo}
          disabled={false}
        />
      {:else}
        <p class="empty-text">No chains available.</p>
      {/each}
    {/if}
  </div>

  <div class="action-footer">
    <Button width="100%" disabled>{$_('common.continue')}</Button>
  </div>
</div>

<style lang="scss">
  .network-setup {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--background-color);
    padding: 0 20px 20px;
  }

  .controls {
    margin: 16px 0;
    display: flex;
    justify-content: center;
  }

  .toggle-switch {
    display: flex;
    border-radius: 12px;
    background: var(--card-background);
    overflow: hidden;
    border: 2px solid var(--primary-purple);
  }

  .toggle-switch button {
    flex: 1;
    padding: 10px 16px;
    background: none;
    border: none;
    font-size: var(--font-size-medium);
    font-weight: 500;
    cursor: pointer;
    color: var(--text-secondary);
    transition: background-color 0.2s;

    &.selected {
      background: var(--primary-purple);
      color: white;
    }

    &:not(.selected):hover {
      background: color-mix(in srgb, var(--primary-purple) 10%, transparent);
      color: var(--text-primary);
    }

    &:focus {
      outline: none;
    }
  }

  .network-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .loading-text,
  .empty-text {
    text-align: center;
    color: var(--text-secondary);
    margin: 40px 0;
  }

  .action-footer {
    padding-top: 16px;
  }

  @media (max-width: 480px) {
    .network-setup {
      padding: 0 16px 20px;
    }
  }
</style>
