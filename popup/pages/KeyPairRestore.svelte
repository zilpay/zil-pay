<script lang="ts">
  import type { IKeyPair } from 'types/wallet';
  import { _ } from '../i18n';
  import { pop, push } from '../router/navigation';
  import NavBar from '../components/NavBar.svelte';
  import Button from '../components/Button.svelte';
  import HexKey from '../components/HexKey.svelte';
  import { cacheStore } from 'popup/store/cache';
  import { fromRpivKey } from 'popup/background/wallet';
  import { ETHEREUM } from 'config/slip44';


  let input = $state('');
  let isValid = $state(false);
  let keyPair = $state<IKeyPair>({
    address: "",
    privateKey: "",
    publicKey: "",
    slip44: ETHEREUM,
  });

  async function handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim();
    input = value;
    validateKey(value);

    try {
      keyPair = await fromRpivKey(ETHEREUM, value);
    } catch {
      isValid = false;
    }
  }

  function validateKey(value: string) {
    const clean = value.replace(/^0x/, '').toLowerCase();
    if (/^[0-9a-f]{64}$/i.test(clean)) {
      isValid = true;
    } else {
      isValid = false;
    }
  }

  function handleRestore() {
    cacheStore.set({
      keyPair: keyPair,
    });
    push("/network-setup");
  }
</script>

<div class="page-container keypair-restore">
  <NavBar title={$_('restoreKeyPair.title')} />

  <div class="content">
    <div class="input-section">
      <label for="private-key" class="input-label">
        {$_('restoreKeyPair.inputLabel')}
      </label>
      <textarea
        id="private-key"
        class="text-input"
        placeholder={$_('restoreKeyPair.placeholder')}
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
        bind:value={input}
        oninput={handleInput}
        rows="3"
      ></textarea>
    </div>

    <div class="hex-key-container">
      {#if isValid && keyPair.privateKey}
        <HexKey hexKey={keyPair.privateKey} title={$_('restoreKeyPair.previewTitle')} />
      {/if}
    </div>

    <div class="footer">
      <Button disabled={!isValid} onclick={handleRestore}>
        {$_('restoreKeyPair.restoreButton')}
      </Button>
    </div>
  </div>
</div>

<style lang="scss">
  .keypair-restore {
    display: flex;
    flex-direction: column;
    background-color: var(--color-neutral-background-base);
    min-height: 100vh;
    padding: 0 16px;
    box-sizing: border-box;
  }

  .content {
    padding: 24px 0;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .input-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0;
  }

  .input-label {
    font-size: var(--font-size-medium);
    font-weight: 500;
    color: var(--color-content-text-secondary);
  }

  .text-input {
    width: 100%;
    padding: 14px 16px;
    border-radius: 12px;
    border: 2px solid transparent;
    background-color: var(--color-neutral-background-container);
    color: var(--color-content-text-inverted);
    font-size: var(--font-size-medium);
    font-weight: 500;
    transition: all 0.2s ease;
    resize: none;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: var(--color-inputs-border-focus);
      background-color: var(--color-inputs-background-base);
    }
    
    &:hover:not(:focus) {
      border-color: var(--color-neutral-border-default);
    }

    &::placeholder {
      color: var(--color-content-text-secondary);
    }
  }

  .hex-key-container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .footer {
    padding-top: 24px;
    margin-top: auto;
  }
</style>
