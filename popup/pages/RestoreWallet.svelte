<script lang="ts">
  import { _ } from 'popup/i18n';
  import { push } from 'popup/router/navigation';
  import NavBar from '../components/NavBar.svelte';
  import OptionCard from '../components/OptionCard.svelte';
  import BillIcon from '../components/icons/Bill.svelte';
  import BincodeIcon from '../components/icons/Bincode.svelte';
  
  const restoreOptions = [
    {
      id: 'bip39',
      titleKey: 'restoreWallet.bip39.title',
      descriptionKey: 'restoreWallet.bip39.description',
      icon: BillIcon,
      disabled: false,
      action: () => handleBip39()
    },
    {
      id: 'private-key',
      titleKey: 'restoreWallet.privateKey.title',
      descriptionKey: 'restoreWallet.privateKey.description',
      icon: BincodeIcon,
      disabled: false,
      action: () => handlePrivateKey()
    },
  ];

  function handleBip39() {
    push('/restore-bip39');
  }

  function handlePrivateKey() {
    push('/restore-private-key');
  }
</script>

<div class="page-container restore-wallet">
  <NavBar title={$_('restoreWallet.title')} />
  
  <div class="options-container">
    {#each restoreOptions as option}
      <OptionCard
        title={$_(option.titleKey)}
        description={$_(option.descriptionKey)}
        icon={option.icon}
        disabled={option.disabled}
        onclick={option.action}
        showArrow={true}
      />
    {/each}
  </div>
</div>

<style lang="scss">
  .restore-wallet {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--color-neutral-background-base);
    padding: 0 16px;
    box-sizing: border-box;
  }

  .options-container {
    padding-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
  }
</style>
