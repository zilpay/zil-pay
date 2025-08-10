<script lang="ts">
  import globalStore from "popup/store/global";
  import { viewChain } from 'lib/popup/url';
  import Header from '../components/Header.svelte';
  import AddressCopy from '../components/AddressCopy.svelte';
  import { getAccountChain } from 'popup/mixins/chains';
  import Jazzicon from "../components/Jazzicon.svelte";

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
    console.log('Settings clicked');
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
       <div class="jazzicon-wrapper">
        <Jazzicon seed={currentAccount.addr} diameter={100} />
      </div>
      <div class="address-section">
        <AddressCopy address={currentAccount.addr} title={currentAccount.name} />
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
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--padding-side);
    gap: 20px;
  }

  .address-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
</style>
