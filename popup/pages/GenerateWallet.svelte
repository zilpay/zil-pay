<script lang="ts">
  import { _ } from '../i18n';
  import { pop, push } from '../router/navigation';
  import NavBar from '../components/NavBar.svelte';
  import WalletOption from '../components/WalletOption.svelte';
  import Bip39Icon from '../components/icons/BIP39.svelte';
  import GridIcon from '../components/icons/Bill.svelte';
  import LockIcon from '../components/icons/Locker.svelte';

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
      icon: Bip39Icon,
      disabled: false,
      action: () => handleBip39()
    },
    {
      id: 'private-key',
      titleKey: 'generateWallet.privateKey.title',
      descriptionKey: 'generateWallet.privateKey.description',
      icon: LockIcon,
      disabled: false,
      action: () => handlePrivateKey()
    },
    {
      id: 'slip0039',
      titleKey: 'generateWallet.slip0039.title',
      descriptionKey: 'generateWallet.slip0039.description',
      icon: GridIcon,
      disabled: true,
      action: () => handleSlip0039()
    },
  ];

  function handleBip39() {
    push('/generate-bip39');
  }

  function handleSlip0039() {
    push('/generate-wallet/slip0039');
  }

  function handlePrivateKey() {
    push('/keypair-generate');
  }
</script>

<div class="page-container generate-wallet">
  <NavBar title={$_('generateWallet.title')} onBack={() => pop()} />
  
  <div class="options-container">
    <div class="generate-options">
      {#each generateOptions as option}
        <WalletOption
          title={$_(option.titleKey)}
          description={$_(option.descriptionKey)}
          icon={option.icon}
          disabled={option.disabled}
          onclick={() => option.action()}
        />
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  .generate-wallet {
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
    overflow-y: auto;
    padding: 8px 0;
  }

  .generate-options {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
