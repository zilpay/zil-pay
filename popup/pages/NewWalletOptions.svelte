<script lang="ts">
  import { _ } from 'popup/i18n';
  import { pop, push } from 'popup/router/navigation';
  import NavBar from '../components/NavBar.svelte';
  import WalletOption from '../components/WalletOption.svelte';

  type WalletOptionType = {
    id: string;
    titleKey: string;
    descriptionKey: string;
    icon: string;
    action: () => void;
  };

  const mainOptions: WalletOptionType[] = [
    {
      id: 'new-wallet',
      titleKey: 'newWalletOptions.newWallet.title',
      descriptionKey: 'newWalletOptions.newWallet.description',
      icon: '+',
      action: () => handleNewWallet()
    },
    {
      id: 'existing-wallet',
      titleKey: 'newWalletOptions.existingWallet.title',
      descriptionKey: 'newWalletOptions.existingWallet.description',
      icon: '↑',
      action: () => handleExistingWallet()
    },
    {
      id: 'pair-ledger',
      titleKey: 'newWalletOptions.pairWithLedger.title',
      descriptionKey: 'newWalletOptions.pairWithLedger.description',
      icon: '⊞',
      action: () => handlePairLedger()
    }
  ];

  const otherOptions: WalletOptionType[] = [
    {
      id: 'watch-account',
      titleKey: 'newWalletOptions.watchAccount.title',
      descriptionKey: 'newWalletOptions.watchAccount.description',
      icon: '👁',
      action: () => handleWatchAccount()
    }
  ];

  function handleNewWallet() {
    push('/generate-wallet');
  }

  function handleExistingWallet() {
    push('/restore-wallet');
  }

  function handlePairLedger() {
    push('/new-wallet/ledger');
  }

  function handleWatchAccount() {
    push('/new-wallet/watch');
  }
</script>

<div class="page-container new-wallet-options">
  <NavBar title={$_('newWalletOptions.title')} onBack={pop} />

  <div class="options-container">
    <div class="main-options">
      {#each mainOptions as option}
        <WalletOption
          title={$_(option.titleKey)}
          description={$_(option.descriptionKey)}
          icon={option.icon}
          onclick={option.action}
        />
      {/each}
    </div>

    <div class="other-section">
      <h4 class="section-title">{$_('newWalletOptions.otherOptions')}</h4>
      <div class="other-options">
        {#each otherOptions as option}
          <WalletOption
            title={$_(option.titleKey)}
            description={$_(option.descriptionKey)}
            icon={option.icon}
            onclick={option.action}
          />
        {/each}
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .new-wallet-options {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--background-color);
    padding: 0 20px 20px;
    box-sizing: border-box;
  }

  .options-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 32px;
    overflow-y: auto;
    padding: 8px 0;
  }

  .main-options {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .other-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .section-title {
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: 500;
    margin: 0;
    opacity: 0.8;
  }

  .other-options {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
