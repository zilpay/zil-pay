<script lang="ts">
  import globalStore from "popup/store/global";
  import { viewChain } from 'lib/popup/url';
  import Header from '../components/Header.svelte';
  import { getAccountChain } from 'popup/mixins/chains';

   let currentChain = $derived(getAccountChain($globalStore.selectedWallet));

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
    <h1>Welcome to the Wallet</h1>
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
    align-items: center;
    justify-content: center;
    padding: var(--padding-side);
  }

  h1 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
</style>
