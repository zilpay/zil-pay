<script lang="ts">
  import type { IChainConfigState } from 'background/storage/chain';

  import { getChains } from '../mixins/chains';
  import NavBar from '../components/NavBar.svelte';
  import WalletOption from '../components/WalletOption.svelte';
  import Switch from '../components/Switch.svelte';
  import { _ } from '../i18n';
  import { pop, push } from '../router/navigation';
  import globalStore from 'popup/store/global';
  import { viewChain } from 'lib/popup/url';
  import { themeDetect } from 'popup/mixins/theme';
  import { Themes } from 'config/theme';
  import { cacheStore }  from 'popup/store/cache';

  let isTestnet = $state(false);
  let mainnetChains = $state<IChainConfigState[]>([]);
  let testnetChains = $state<IChainConfigState[]>([]);

  let currentTheme = $state(
    $globalStore.appearances === Themes.System
      ? themeDetect()
      : $globalStore.appearances,
  );

  function generateTags(chain: IChainConfigState, isTestnetMode: boolean): string[] {
    const tags: string[] = [];

    if (chain.chainIds) {
      tags.push(`ID: ${chain.chainIds[0]}`);
    }

    if (isTestnetMode) {
      tags.push('testnet');
    } else {
      tags.push('mainnet');
    }

    return tags;
  }

  async function loadChains() {
    const chains = await getChains();
    mainnetChains = chains.mainnet || [];
    testnetChains = chains.testnet || [];
  }

  function next(chain: IChainConfigState) {
    cacheStore.set({
      ...$cacheStore,
      chain,
    });
    push("/password-setup");
  }

  $effect(() => {
    if (!$cacheStore.keyPair && !$cacheStore.verifyPhrase) {
      return push("/start");
    }

    loadChains();
  });

  $effect(() => {
    const newTheme = $globalStore.appearances;
    currentTheme = newTheme === Themes.System ? themeDetect() : newTheme;
  });
</script>

<div class="page-container network-setup">
  <NavBar
    title={$_('networkSetup.title')}
    onBack={pop}
  />

  <div class="controls">
    <Switch
      bind:checked={isTestnet}
      ariaLabel="Mainnet"
      name="testnet"
    />
  </div>

  <div class="network-list">
    {#each (isTestnet ? testnetChains : mainnetChains) as chain}
      <WalletOption
        title={chain.name}
        description={chain.chain}
        icon={viewChain({ network: chain, theme: currentTheme })}
        tags={generateTags(chain, isTestnet)}
        disabled={false}
        onclick={() => next(chain)}
      />
    {/each}
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
    margin: 0 0 16px;
    display: flex;
    justify-content: flex-end;
  }

  .network-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  @media (max-width: 480px) {
    .network-setup {
      padding: 0 16px 20px;
    }
  }
</style>
