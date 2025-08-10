<script lang="ts">
  import globalStore from 'popup/store/global';
  import { viewChain } from 'lib/popup/url';
  import Header from '../components/Header.svelte';
  import AddressCopy from '../components/AddressCopy.svelte';
  import { getAccountChain } from 'popup/mixins/chains';
  import Jazzicon from '../components/Jazzicon.svelte';
  import GearIcon from '../components/icons/Gear.svelte';
  import { push } from '../router/navigation';
  import Button from '../components/Button.svelte';
  import { _ } from 'popup/i18n';

  const BUTTONS_HEIGHT = 30;

  let currentChain = $derived(getAccountChain($globalStore.selectedWallet));
  let currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
  let currentAccount = $derived(
    currentWallet?.accounts[currentWallet.selectedAccount]
  );

  function handleSettings() {
    push('/settings');
  }

  function handleSend() {
  }

  function handleReceive() {
  }
</script>

<div class="home-container">
  <Header
    showNetworkButton={true}
    networkImageSrc={viewChain({
      network: currentChain,
      theme: $globalStore.appearances
    })}
    networkImageAlt={currentChain?.name || 'Network'}
    onSettings={handleSettings}
  />

  <div class="content">
    {#if currentAccount?.addr}
      <div class="account-header">
        <div class="icon-wrapper">
          <Jazzicon seed={currentAccount.addr} diameter={40} />
        </div>
        <div class="address-container">
          <AddressCopy
            address={currentAccount.addr}
            title={currentAccount.name}
            size="Medium"
          />
        </div>
        <div class="icon-wrapper">
          <button
            class="settings-button"
            onclick={handleSettings}
            aria-label="Account Settings"
          >
            <GearIcon width="30" height="30" text />
          </button>
        </div>
      </div>

      <div class="actions-container">
        <Button onclick={handleSend} height={BUTTONS_HEIGHT}>
          {$_('home.send', { default: 'Send' })}
        </Button>
        <Button
          onclick={handleReceive}
          height={BUTTONS_HEIGHT}
          class="secondary"
        >
          {$_('home.receive', { default: 'Receive' })}
        </Button>
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
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .icon-wrapper {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
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
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    &:hover {
      color: var(--primary-purple);
    }
  }

  .actions-container {
    display: flex;
    padding-left: 24px;
    padding-right: 24px;
    gap: 16px;
    margin-top: 16px;
    justify-content: center;
  }
</style>
