<script lang="ts">
  import { _ } from '../i18n';
  import { pop } from '../router/navigation';
  import NavBar from '../components/NavBar.svelte';
  import Button from '../components/Button.svelte';
  import HexKey from '../components/HexKey.svelte';

  let input = $state('');
  let isValid = $state(false);
  let hexKey = $state('');

  function handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim();
    input = value;
    validateKey(value);
  }

  function validateKey(value: string) {
    const clean = value.replace(/^0x/, '').toLowerCase();
    if (/^[0-9a-f]{64}$/i.test(clean)) {
      hexKey = clean;
      isValid = true;
    } else {
      hexKey = '';
      isValid = false;
    }
  }

  function handleRestore() {
    console.log('Restore key:', hexKey);
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

    {#if isValid}
      <HexKey hexKey={hexKey} title={$_('restoreKeyPair.previewTitle')} />
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
