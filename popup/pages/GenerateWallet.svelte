<script lang="ts">
  import { _ } from '../i18n';
  import { push } from '../router/navigation';
  import NavBar from '../components/NavBar.svelte';
  import WalletOption from '../components/WalletOption.svelte';
  import BillIcon from '../components/icons/Bill.svelte';
  import BincodeIcon from '../components/icons/Bincode.svelte';

  type GenerateOption = {
    id: string;
    titleKey: string;
    descriptionKey: string;
    icon: any;
    disabled: boolean;
    action: () => void;
  };

  const generateOptions: GenerateOption[] = [
    {
      id: 'bip39',
      titleKey: 'generateWallet.bip39.title',
      descriptionKey: 'generateWallet.bip39.description',
      icon: BillIcon,
      disabled: false,
      action: () => handleBip39()
    },
    {
      id: 'private-key',
      titleKey: 'generateWallet.privateKey.title',
      descriptionKey: 'generateWallet.privateKey.description',
      icon: BincodeIcon,
      disabled: false,
      action: () => handlePrivateKey()
    }
  ];

  function handleBip39() {
    push('/generate-bip39');
  }

  function handlePrivateKey() {
    push('/keypair-generate');
  }
</script>

<div class="page-container generate-wallet">
  <NavBar title={$_('generateWallet.title')} />
  
  <div class="options-container">
    {#each generateOptions as option}
      <WalletOption
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
  .generate-wallet {
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
