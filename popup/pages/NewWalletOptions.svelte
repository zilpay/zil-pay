<script lang="ts">
  import { _ } from 'popup/i18n';
  import { pop, push } from 'popup/router/navigation';
  import NavBar from '../components/NavBar.svelte';

  type WalletOption = {
    id: string;
    titleKey: string;
    descriptionKey: string;
    icon: string;
    action: () => void;
  };

  const mainOptions: WalletOption[] = [
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

  const otherOptions: WalletOption[] = [
    {
      id: 'watch-account',
      titleKey: 'newWalletOptions.watchAccount.title',
      descriptionKey: 'newWalletOptions.watchAccount.description',
      icon: '👁',
      action: () => handleWatchAccount()
    }
  ];

  function handleNewWallet() {
    push('/new-wallet/create');
  }

  function handleExistingWallet() {
    push('/new-wallet/import');
  }

  function handlePairLedger() {
    push('/new-wallet/ledger');
  }

  function handleWatchAccount() {
    push('/new-wallet/watch');
  }
</script>

<div class="new-wallet-options">
  <NavBar title={$_('newWalletOptions.title')} onClose={pop} />
  
  <div class="options-container">
    <div class="main-options">
      {#each mainOptions as option}
        <button class="option-card" onclick={() => option.action()}>
          <div class="option-icon">
            <span class="icon-symbol">{option.icon}</span>
          </div>
          <div class="option-content">
            <h3 class="option-title">{$_(option.titleKey)}</h3>
            <p class="option-description">{$_(option.descriptionKey)}</p>
          </div>
          <div class="option-arrow">
            <span>›</span>
          </div>
        </button>
      {/each}
    </div>

    <div class="other-section">
      <h4 class="section-title">{$_('newWalletOptions.otherOptions')}</h4>
      <div class="other-options">
        {#each otherOptions as option}
          <button class="option-card" onclick={() => option.action()}>
            <div class="option-icon">
              <span class="icon-symbol">{option.icon}</span>
            </div>
            <div class="option-content">
              <h3 class="option-title">{$_(option.titleKey)}</h3>
              <p class="option-description">{$_(option.descriptionKey)}</p>
            </div>
            <div class="option-arrow">
              <span>›</span>
            </div>
          </button>
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

  .option-card {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 20px;
    background-color: var(--card-background);
    border: 2px solid transparent;
    border-radius: 16px;
    cursor: pointer;
    text-align: left;
    min-height: 80px;
    transition: all 0.2s ease;

    &:hover {
      border-color: color-mix(in srgb, var(--primary-purple) 30%, transparent);
      background-color: color-mix(in srgb, var(--card-background) 95%, var(--primary-purple));
    }

    &:focus {
      outline: none;
      border-color: var(--primary-purple);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-right: 16px;
    flex-shrink: 0;
    background: linear-gradient(135deg, var(--primary-purple), color-mix(in srgb, var(--primary-purple) 80%, #000));
    border-radius: 12px;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-purple) 25%, transparent);
  }

  .icon-symbol {
    font-size: 24px;
    font-weight: bold;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .option-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-right: 12px;
  }

  .option-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.3;
  }

  .option-description {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
    opacity: 0.8;
    line-height: 1.4;
  }

  .option-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;

    span {
      font-size: 20px;
      color: var(--text-secondary);
      opacity: 0.6;
    }
  }

  .option-card:hover .option-arrow span {
    color: var(--primary-purple);
    opacity: 1;
  }
</style>
