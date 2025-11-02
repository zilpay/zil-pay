<script lang="ts">
  import type { IChainConfigState } from 'background/storage/chain';
  import { getChains } from '../mixins/chains';
  import NavBar from '../components/NavBar.svelte';
  import OptionCard from '../components/OptionCard.svelte';
  import { _ } from '../i18n';
  import { push } from '../router/navigation';
  import globalStore from 'popup/store/global';
  import { viewChain } from 'lib/popup/url';
  import { themeDetect } from 'popup/mixins/theme';
  import { Themes } from 'config/theme';
  import { cacheStore } from 'popup/store/cache';

  type DisplayChain = IChainConfigState & { isTestnet?: boolean };

  let allChains = $state<DisplayChain[]>([]);

  let currentTheme = $derived(
    $globalStore.appearances === Themes.System
      ? themeDetect()
      : $globalStore.appearances,
  );

  function generateTags(chain: DisplayChain): string[] {
    const tags: string[] = [];
    if (chain.chainIds && chain.chainIds[0]) {
      tags.push(`ID: ${chain.chainIds[0]}`);
    }
    tags.push(chain.isTestnet ? 'testnet' : 'mainnet');
    return tags;
  }

  async function loadChains() {
    const { mainnet } = await getChains();
    const mainnetItems: DisplayChain[] = mainnet || [];
    allChains = mainnetItems;
  }

  function next(chain: IChainConfigState) {
    cacheStore.set({
      ...$cacheStore,
      chain,
    });
    if ($cacheStore.nextPage) {
      push($cacheStore.nextPage);
    } else {
      push("/password-setup");
    }
  }

  $effect(() => {
    if (!$cacheStore.keyPair && !$cacheStore.verifyPhrase && !$cacheStore.nextPage) {
      return push("/start");
    }
    loadChains();
  });
</script>

<div class="page-container network-setup">
  <NavBar title={$_('networkSetup.title')} />

  <div class="network-list">
    {#each allChains as chain (chain.chain + (chain.isTestnet ? '_testnet' : ''))}
      <OptionCard
        title={chain.name}
        description={chain.chain}
        icon={viewChain({ network: chain, theme: currentTheme })}
        tags={generateTags(chain)}
        disabled={false}
        onclick={() => next(chain)}
        showArrow={true}
      />
    {/each}
  </div>
</div>

<style lang="scss">
  .network-setup {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--color-neutral-background-base);
    padding: 0 16px;
    box-sizing: border-box;
  }

  .network-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px 0;
  }
</style>
