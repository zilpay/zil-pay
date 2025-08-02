<script lang="ts">
  import { _ } from 'popup/i18n';
  import { pop, push } from 'popup/router/navigation';
  import NavBar from '../components/NavBar.svelte';
  import WalletOption from '../components/WalletOption.svelte';
  import PuzzleIcon from '../components/icons/PuzzleIcon.svelte';
  import BincodeIcon from '../components/icons/BincodeIcon.svelte';
  import QRCodeIcon from '../components/icons/QRCodeIcon.svelte';
  import Bip39Icon from '../components/icons/Bip39Icon.svelte';
  import LockIcon from '../components/icons/LockIcon.svelte';


  type RestoreOption = {
    id: string;
    titleKey: string;
    descriptionKey: string;
    icon: any;
    action: () => void;
  };

  const restoreOptions: RestoreOption[] = [
    {
      id: 'bip39',
      titleKey: 'restoreWallet.bip39.title',
      descriptionKey: 'restoreWallet.bip39.description',
      icon: Bip39Icon,
      action: () => handleBip39()
    },
    {
      id: 'slip0039',
      titleKey: 'restoreWallet.slip0039.title',
      descriptionKey: 'restoreWallet.slip0039.description',
      icon: PuzzleIcon,
      action: () => handleSlip0039()
    },
    {
      id: 'private-key',
      titleKey: 'restoreWallet.privateKey.title',
      descriptionKey: 'restoreWallet.privateKey.description',
      icon: LockIcon,
      action: () => handlePrivateKey()
    },
    {
      id: 'keystore-file',
      titleKey: 'restoreWallet.keystoreFile.title',
      descriptionKey: 'restoreWallet.keystoreFile.description',
      icon: BincodeIcon,
      action: () => handleKeystoreFile()
    },
    {
      id: 'qrcode',
      titleKey: 'restoreWallet.qrcode.title',
      descriptionKey: 'restoreWallet.qrcode.description',
      icon: QRCodeIcon,
      action: () => handleQRCode()
    }
  ];

  function handleBip39() {
    push('/restore-wallet/bip39');
  }

  function handleSlip0039() {
    push('/restore-wallet/slip0039');
  }

  function handlePrivateKey() {
    push('/restore-wallet/private-key');
  }

  function handleKeystoreFile() {
    push('/restore-wallet/keystore');
  }

  function handleQRCode() {
    push('/restore-wallet/qrcode');
  }
</script>

<div class="restore-wallet">
  <NavBar title={$_('restoreWallet.title')} onClose={pop} />
  
  <div class="options-container">
    <div class="restore-options">
      {#each restoreOptions as option}
        <WalletOption
          title={$_(option.titleKey)}
          description={$_(option.descriptionKey)}
          icon={option.icon}
          onclick={() => option.action()}
        />
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  .restore-wallet {
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

  .restore-options {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
