<script lang="ts">
  import globalStore from 'popup/store/global';
  import { viewChain } from 'lib/popup/url';
  import Header from '../components/Header.svelte';
  import AddressCopy from '../components/AddressCopy.svelte';
  import { getAccountChain } from 'popup/mixins/chains';
  import Jazzicon from '../components/Jazzicon.svelte';
  import GearIcon from '../components/icons/Gear.svelte';
  import ManageIcon from '../components/icons/Manage.svelte';
  import { push } from '../router/navigation';
  import Button from '../components/Button.svelte';
  import { _ } from 'popup/i18n';
  import TokenCard from '../components/TokenCard.svelte';

  const BUTTONS_HEIGHT = 30;

  const fakeTokens = [
    {
      symbol: 'ZIL',
      balance: '9.6855K',
      convertedBalance: 'BTC 0.0010888',
      iconSrc: 'https://static.debank.com/image/token/logo_url/zil/b8b4c09d6a3a6d25326555513cbe3e36.png'
    },
    {
      symbol: 'ZLP',
      balance: '0',
      convertedBalance: 'BTC 0',
      iconSrc: 'https://app.zilswap.io/images/tokens/zlp.svg'
    },
    {
      symbol: 'stZIL',
      balance: '15',
      convertedBalance: 'BTC 0.0000019',
      iconSrc: 'https://storage.googleapis.com/zapper-fi-assets/tokens/zilliqa/0x546c24380da1a8019e3491f74f7627444c28fe9c.png'
    },
    {
      symbol: 'zUSDT',
      balance: '0.26775',
      convertedBalance: 'BTC 0.0000024',
      iconSrc: 'https://static.debank.com/image/token/logo_url/usdt/00000000000000000000000000000000.png'
    },
    {
      symbol: 'gZIL',
      balance: '0.0002883',
      convertedBalance: 'BTC 0',
      iconSrc: 'https://storage.googleapis.com/zapper-fi-assets/tokens/zilliqa/0x4253514a6a2f3f1244a33113190861077b9612c9.png'
    },
    {
      symbol: 'zETH',
      balance: '0',
      convertedBalance: 'BTC 0',
      iconSrc: 'https://static.debank.com/image/token/logo_url/eth/935ae4c4d1d12d59a59409263a95996f.png'
    }
  ];

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

  function handleManage() {
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

  <div class="page-container">
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
            {$_('home.send')}
          </Button>
          <Button onclick={handleReceive} height={BUTTONS_HEIGHT} class="secondary">
            {$_('home.receive')}
          </Button>
        </div>

        <div class="controls-toolbar">
          <div class="icon-actions-panel">
              <button class="icon-button" onclick={handleManage} aria-label="Manage">
                  <ManageIcon width="24" height="24" text={true} />
              </button>
          </div>
        </div>
        
        <div class="token-list-container">
          {#each fakeTokens as token}
            <TokenCard
              symbol={token.symbol}
              balance={token.balance}
              convertedBalance={token.convertedBalance}
              imageUrl={token.iconSrc}
            />
          {/each}
        </div>
      {/if}
    </div>
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
    gap: 5px;
    min-height: 0;
    padding-bottom: 16px;
  }

  .account-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 5px;
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
    display: grid;
    margin-top: 8px;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    justify-content: center;
    max-width: 100%;
  }
 
  .controls-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
  }

  .icon-actions-panel {
    display: flex;
    gap: 8px;
  }
  
  .icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    color: var(--text-secondary);
    transition: all 0.2s ease;
    &:hover {
        background-color: color-mix(in srgb, var(--text-primary) 10%, transparent);
        color: var(--primary-purple);
    }
  }

  .token-list-container {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(142px, 1fr));
    gap: 8px;
    overflow-y: auto;
    min-height: 0;
    justify-items: center;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    .token-list-container {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
