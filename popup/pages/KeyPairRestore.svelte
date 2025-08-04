<script lang="ts">
  import type { IKeyPair } from 'types/wallet';
  import { _ } from '../i18n';
  import { pop, push } from '../router/navigation';
  import NavBar from '../components/NavBar.svelte';
  import Button from '../components/Button.svelte';
  import HexKey from '../components/HexKey.svelte';
  import { cacheStore }  from 'popup/store/cache';
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
      keyPair = await fromRpivKey(ETHEREUM, value); // TODO: change it depends of network
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
  <NavBar title={$_('restoreKeyPair.title')} onBack={pop} />

  <div class="content">
    <div class="input-section">
      <label for="private-key" class="input-label">
        {$_('restoreKeyPair.inputLabel')}
      </label>
      <input
        id="private-key"
        type="text"
        class="text-input"
        placeholder={$_('restoreKeyPair.placeholder')}
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
        bind:value={input}
        oninput={handleInput}
      />
    </div>

    {#if isValid && keyPair.privateKey}
      <HexKey hexKey={keyPair.privateKey} title={$_('restoreKeyPair.previewTitle')} />
    {/if}

    <Button width="100%" disabled={!isValid} onclick={handleRestore}>
      {$_('restoreKeyPair.restoreButton')}
    </Button>
  </div>
</div>

<style lang="scss">
  .keypair-restore {
    display: flex;
    flex-direction: column;
    background-color: var(--background-color);
    color: var(--text-primary);
    height: 100vh;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .content {
    padding: 16px 0 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
  }

  .input-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .input-label {
    font-size: var(--font-size-medium);
    font-weight: 500;
    color: var(--text-secondary);
  }

  .text-input {
    width: 100%;
    padding: 14px 16px;
    font-size: var(--font-size-medium);
    font-weight: 500;
    color: var(--text-primary);
    border: 2px solid color-mix(in srgb, var(--text-secondary) 20%, transparent);
    background-color: var(--card-background);
    border-radius: 12px;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--primary-purple);
    }

    &::placeholder {
      color: var(--text-secondary);
      opacity: 0.6;
    }
  }

  @media (max-width: 480px) {
    .keypair-restore {
      padding: 0 16px;
    }
  }
</style>
