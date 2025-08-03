<script lang="ts">
  import type { IKeyPair } from 'types/wallet';
  import NavBar from '../components/NavBar.svelte';
  import HexKey from '../components/HexKey.svelte';
  import Button from '../components/Button.svelte';
  import CopyButton from '../components/CopyButton.svelte';
  import ReloadButton from '../components/ReloadButton.svelte';
  import { _ } from '../i18n';
  import { pop, push } from '../router/navigation';
  import { generateKeyPair } from 'popup/background/wallet';
  import { ETHEREUM } from 'config/slip44';


  let keyPair = $state<IKeyPair>({
    address: "",
    privateKey: "",
    publicKey: "",
    slip44: ETHEREUM,
  });
  let hasBackup = $state(false);

  async function generateKeys() {
    try {
      keyPair = await generateKeyPair(ETHEREUM);
      console.log(keyPair);
      hasBackup = false;
    } catch (error) {
      console.error('Error generating keys:', error);
    }
  }

  function handleNext() {
  }

  function handleReload() {
    generateKeys();
  }

  $effect(() => {
    generateKeys();
  });
</script>

<div class="secret-key-page">
  <div class="page-container">
    <NavBar
      title={$_('secretKeyGenerator.title')}
      onBack={pop}
      rightIcon={ReloadButton}
      onRight={handleReload}
    />

    <div class="content">
      <div class="keys-section">
        <HexKey
          hexKey={keyPair.privateKey}
          title={$_('secretKeyGenerator.privateKey')}
        />
      </div>

      <div class="actions-section">
        <div class="backup-confirmation">
          <label class="checkbox-container">
            <input
              type="checkbox"
              bind:checked={hasBackup}
              class="checkbox-input"
            />
            <span class="checkbox-text">
              {$_('secretKeyGenerator.backupCheckbox')}
            </span>
          </label>

          <CopyButton
            text={keyPair.privateKey}
            ariaLabel="Copy private key"
            size={44}
          />
        </div>

        <Button
    onclick={handleNext}
          disabled={!hasBackup || !keyPair.privateKey}
          width="100%"
        >
          {$_('secretKeyGenerator.nextButton')}
        </Button>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .secret-key-page {
    display: flex;
    justify-content: center;
    min-height: 100vh;
    background: var(--background-color);
    color: var(--text-primary);
  }

  .page-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 480px;
    min-height: 100vh;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 24px;
    overflow-y: auto;
    padding-bottom: 20px;
  }

  .keys-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 0;
    overflow-y: auto;
  }

  .actions-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 0;
    max-width: 480px;
    margin: 0 auto;
    width: 100%;
  }

  .backup-confirmation {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .checkbox-container {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    user-select: none;
    flex: 1;
  }

  .checkbox-input {
    width: 18px;
    height: 18px;
    margin: 0;
    accent-color: var(--primary-purple);
    cursor: pointer;
    flex-shrink: 0;
  }

  .checkbox-text {
    font-size: var(--font-size-medium);
    color: var(--text-secondary);
    line-height: 1.4;
  }

  @media (max-width: 480px) {
    .page-container {
      padding: 0 16px;
    }

    .content {
      gap: 20px;
    }

    .actions-section {
      padding: 12px 0;
      gap: 14px;
    }

    .backup-confirmation {
      gap: 10px;
    }

    .checkbox-text {
      font-size: var(--font-size-small);
    }
  }

  @media (max-width: 360px) {
    .content {
      gap: 16px;
    }
  }

  @media (min-width: 768px) {
    .content {
      max-width: 500px;
      margin: 0 auto;
    }

    .actions-section {
      max-width: 450px;
    }
  }
</style>
