<script lang="ts">
  import globalStore from "popup/store/global";
  import { viewChain } from 'lib/popup/url';
  import Header from '../components/Header.svelte';
  import AddressCopy from '../components/AddressCopy.svelte';
  import { getAccountChain } from 'popup/mixins/chains';
  import Jazzicon from "../components/Jazzicon.svelte";
  import GearIcon from "../components/icons/Gear.svelte";
  import { push } from "../router/navigation";

  let currentChain = $derived(getAccountChain($globalStore.selectedWallet));
  let currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
  let currentAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount]);

  function handleNetworkButton() {
    console.log('Network button clicked - go to network page');
  }

  function handleExpand() {
    console.log('Expand clicked');
  }

  function handleRefresh() {
    console.log('Refresh clicked');
  }

  function handleSettings() {
    push('/settings');
  }

  function handleLock() {
    console.log('Lock clicked');
  }
</script>

<div class="home-container">
  <Header
    showNetworkButton={true}
    networkImageSrc={viewChain({ network: currentChain, theme: $globalStore.appearances })}
    networkImageAlt=""
    networkButtonDisabled={false}
    showExpand={true}
    showRefresh={true}
    showSettings={true}
    showLock={true}
    expandDisabled={false}
    refreshDisabled={false}
    settingsDisabled={false}
    lockDisabled={false}
    onNetworkButton={handleNetworkButton}
    onExpand={handleExpand}
    onRefresh={handleRefresh}
    onSettings={handleSettings}
    onLock={handleLock}
  />

  <div class="content">
    {#if currentAccount?.addr}
      <div class="account-header">
        <div class="jazzicon-container">
          <Jazzicon seed={currentAccount.addr} diameter={35} />
        </div>
        <div class="address-container">
          <AddressCopy address={currentAccount.addr} title={currentAccount.name} size="Medium" />
        </div>
        <button class="settings-button" onclick={handleSettings}>
          <GearIcon text />
        </button>
      </div>
    {/if}
    </div>
</div>

<style lang="scss">
  .home-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--background-color);
    color: var(--text-primary);
  }

  .content {
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .account-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .jazzicon-container {
    flex-shri35: 0;
    width: 40px;
    height: 40px;
  }

  .address-container {
    flex-grow: 1;
    text-align: center;
    min-width: 0;
    
    :global(.address-copy-container) {
        margin: 0 auto;
    }
  }

  .settings-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: var(--text-secondary);
    transition: color 0.2s ease;

    &:hover {
        color: var(--primary-purple);
    }

    :global(svg) {
        width: 24px;
        height: 24px;
    }
  }
</style>
