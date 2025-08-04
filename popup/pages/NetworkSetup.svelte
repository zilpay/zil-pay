<script lang="ts">
  import NavBar from '../components/NavBar.svelte';
  import Button from '../components/Button.svelte';
  import SvgLoad from '../components/SvgLoad.svelte';

  import { push } from '../router/navigation';

  type Chain = {
    name: string;
    chain: string;
    logo: string;
    rpc: string[];
    ftokens: { symbol: string; native: boolean }[];
    chainIds: number[];
    explorers: { name: string; url: string }[];
  };

  let chains: Chain[] = $state([]);
  let selectedChainIndex = $state<number | null>(null);
  let search = $state('');
  let showTestnet = $state(false);

  const filteredChains = $derived(() => {
    return chains.filter((c) => {
      if (!c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (!showTestnet && c.chainIds.some((id) => id === 0)) return false;
      return true;
    });
  });

  async function fetchChains() {
    try {
      const res = await fetch('/chains/mainnet.json');
      if (!res.ok) throw new Error('Failed to load chains');
      chains = await res.json();
    } catch (err) {
      console.error('Error fetching chains:', err);
    }
  }

  function handleSelect(index: number) {
    selectedChainIndex = index;
  }

  function handleNext() {
    if (selectedChainIndex !== null) {
      const chain = filteredChains[selectedChainIndex];
      console.log('Selected chain:', chain);
      // push('/next-step') — for continuation
    }
  }

  $effect(fetchChains);
</script>

<div class="page-container network-setup">
  <NavBar title="Select Network" />

  <div class="search-toggle">
    <input
      type="text"
      class="search-input"
      placeholder="Search"
      bind:value={search}
    />
    <label class="testnet-toggle">
      <span>Testnet</span>
      <input
        type="checkbox"
        bind:checked={showTestnet}
      />
      <div class="toggle-switch" />
    </label>
  </div>

  <div class="chain-list">
    {#each filteredChains as chain, index}
      <button
        class="chain-option"
        class:selected={selectedChainIndex === index}
        on:click={() => handleSelect(index)}
      >
        <div class="logo">
          <SvgLoad src={chain.logo.replace('%{shortName}%', chain.shortName).replace('%{dark,light}%', 'light')} width="32" height="32" />
        </div>
        <div class="info">
          <h3>{chain.name}</h3>
          <p>Chain ID: {chain.chainIds.join(', ')}</p>
          <p>Token: {chain.ftokens.find(t => t.native)?.symbol}</p>
          <p>Explorer: {chain.explorers[0]?.name}</p>
        </div>
        <div class="option-meta">
          <span class="tag">Mainnet</span>
          <div class="radio">
            {#if selectedChainIndex === index}
              <div class="inner" />
            {/if}
          </div>
        </div>
      </button>
    {/each}
  </div>

  <Button disabled={selectedChainIndex === null} onclick={handleNext}>
    Next
  </Button>
</div>

<style lang="scss">
  .network-setup {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 20px;
    background: var(--background-color);
  }

  .search-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .search-input {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    border: none;
    font-size: var(--font-size-medium);
    background: var(--card-background);
    color: var(--text-primary);
  }

  .testnet-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    font-size: var(--font-size-small);
    color: var(--text-secondary);
  }

  .testnet-toggle input[type='checkbox'] {
    width: 0;
    height: 0;
    opacity: 0;
    position: absolute;
  }

  .toggle-switch {
    width: 42px;
    height: 24px;
    background: var(--card-background);
    border-radius: 20px;
    position: relative;
    transition: background 0.3s ease;
  }

  .toggle-switch::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: var(--text-primary);
    border-radius: 50%;
    transition: transform 0.3s ease;
  }

  .testnet-toggle input:checked + .toggle-switch::before {
    transform: translateX(18px);
  }

  .chain-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    padding-bottom: 20px;
  }

  .chain-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 16px;
    border-radius: 14px;
    background: var(--card-background);
    border: 2px solid transparent;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .chain-option.selected {
    border-color: var(--primary-purple);
  }

  .logo {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;

    h3 {
      font-size: var(--font-size-large);
      margin: 0;
      color: var(--text-primary);
    }

    p {
      font-size: var(--font-size-small);
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .option-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;

    .tag {
      font-size: var(--font-size-small);
      background: green;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .radio {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid var(--primary-purple);
      display: flex;
      align-items: center;
      justify-content: center;

      .inner {
        width: 10px;
        height: 10px;
        background: var(--primary-purple);
        border-radius: 50%;
      }
    }
  }
</style>
