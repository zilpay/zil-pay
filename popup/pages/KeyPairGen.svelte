<script lang="ts">
  import type { IKeyPair } from 'types/wallet';
  import NavBar from '../components/NavBar.svelte';
  import HexKey from '../components/HexKey.svelte';
  import Button from '../components/Button.svelte';
  import CopyIcon from '../components/icons/Copy.svelte';
  import RefreshIcon from '../components/icons/Refresh.svelte';
  import SaveIcon from '../components/icons/Save.svelte';
  import { _ } from '../i18n';
  import { pop, push } from '../router/navigation';
  import { generateKeyPair } from 'popup/background/wallet';
  import { ETHEREUM } from 'config/slip44';
  import { cacheStore } from 'popup/store/cache';
  import { printKeyPair } from '../mixins/print';

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
      hasBackup = false;
    } catch (error) {
      console.error('Error generating keys:', error);
    }
  }

  function handleNext() {
    cacheStore.set({
      keyPair: keyPair,
    });
    push("/network-setup");
  }

  function handleReload() {
    generateKeys();
  }

  function handleCopy() {
    if (keyPair.privateKey) {
      navigator.clipboard.writeText(keyPair.privateKey);
    }
  }

  function handleSave() {
    if (keyPair.privateKey) {
      printKeyPair(keyPair, $_);
    }
  }

  $effect(() => {
    generateKeys();
  });
</script>

<div class="page-container secret-key-page">
  <NavBar title={$_('secretKeyGenerator.title')} onBack={pop} />

  <div class="content">
    <div class="key-display-section">
      <HexKey
        hexKey={keyPair.privateKey}
        title={$_('secretKeyGenerator.privateKey')}
      />
      
      <div class="action-buttons">
        <button class="action-btn" onclick={handleCopy}>
          <CopyIcon />
          <span class="btn-text">{$_('bip39.create.copy')}</span>
        </button>
        <button class="action-btn" onclick={handleReload}>
          <RefreshIcon />
          <span class="btn-text">{$_('bip39.create.refresh')}</span>
        </button>
        <button class="action-btn" onclick={handleSave}>
          <SaveIcon />
          <span class="btn-text">{$_('bip39.create.save')}</span>
        </button>
      </div>
    </div>

    <div class="footer">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={hasBackup} class="checkbox-input" />
        <span class="checkbox-custom"></span>
        <span class="checkbox-text">{$_('secretKeyGenerator.backupCheckbox')}</span>
      </label>

      <Button
        onclick={handleNext}
        disabled={!hasBackup || !keyPair.privateKey}
      >
        {$_('secretKeyGenerator.nextButton')}
      </Button>
    </div>
  </div>
</div>

<style lang="scss">
  .secret-key-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--color-neutral-background-base);
    padding: 0 16px;
    box-sizing: border-box;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-top: 24px;
    min-height: 0;
  }

  .key-display-section {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .action-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 36px;
    background-color: var(--color-button-regular-quaternary-default);
    border: 1px solid var(--color-cards-regular-border-default);
    border-radius: 8px;
    cursor: pointer;
    font-size: var(--font-size-medium);
    font-weight: 500;
    color: var(--color-content-text-inverted);
    transition: background-color 0.2s ease;
    min-width: 0;

    &:hover {
      background-color: var(--color-button-regular-quaternary-hover);
    }
    
    :global(svg) {
      width: 16px;
      height: 16px;
      color: var(--color-content-icon-secondary);
      flex-shrink: 0;
    }
  }

  .btn-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .footer {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px 0;
    margin-top: auto;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    user-select: none;
    font-size: var(--font-size-medium);
    color: var(--color-content-text-secondary);
  }

  .checkbox-input {
    display: none;
  }

  .checkbox-custom {
    width: 20px;
    height: 20px;
    border: 1px solid var(--color-controls-selector-border);
    border-radius: 6px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .checkbox-input:checked + .checkbox-custom {
    background-color: var(--color-controls-selector-select);
    border-color: var(--color-controls-selector-select);
    &::after {
      content: '✓';
      color: var(--color-content-icon-primary);
      font-weight: bold;
    }
  }
</style>
