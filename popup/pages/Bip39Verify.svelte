<script lang="ts">
  import { _ } from '../i18n';
  import { push } from '../router/navigation';
  import NavBar from '../components/NavBar.svelte';
  import Button from '../components/Button.svelte';
  import { cacheStore } from '../store/cache';

  const VERIFICATION_COUNT = 4;

  let phrase = $state<string[]>([]);
  let selectedIndices = $state<number[]>([]);
  let userInputs = $state<string[]>(Array(VERIFICATION_COUNT).fill(''));
  let isValid = $state(false);

  function shuffle(array: number[]): number[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function validate() {
    isValid = userInputs.every((input, idx) => {
      const original = phrase[selectedIndices[idx]];
      const userInput = input.trim().toLowerCase();
      const expectedWord = original?.toLowerCase();
      return userInput === expectedWord && userInput.length > 0;
    });
  }

  $effect(() => {
    validate();
  });

  function handleVerify() {
    push('/network-setup');
  }

  $effect(() => {
    if (!$cacheStore.verifyPhrase || $cacheStore.verifyPhrase.length === 0) {
      return push('/generate-bip39');
    }

    phrase = $cacheStore.verifyPhrase;
        
    if (phrase.length < VERIFICATION_COUNT) {
      push('/generate-bip39');
      return;
    }

    const indices = Array.from({ length: phrase.length }, (_, i) => i);
    selectedIndices = shuffle(indices).slice(0, VERIFICATION_COUNT).sort((a, b) => a - b);
    userInputs = Array(VERIFICATION_COUNT).fill('');
    isValid = false;
  });
</script>

<div class="page-container verify-page">
  <NavBar title={$_('bip39.verify.title')} />

  <div class="content">
    <div class="instructions">
      <h2 class="title">{$_('bip39.verify.subtitle')}</h2>
      <p class="description">{$_('bip39.verify.instructions')}</p>
    </div>

    <div class="verification-section">
      {#each selectedIndices as idx, i}
        <div class="input-group">
          <div class="word-indicator">
            <span class="word-number">{idx + 1}</span>
          </div>
          <input
            type="text"
            bind:value={userInputs[i]}
            placeholder={$_('bip39.verify.placeholder')}
            autocapitalize="off"
            autocomplete="off"
            spellcheck="false"
            class="word-input"
          />
        </div>
      {/each}
    </div>

    <div class="actions">
      <Button disabled={!isValid} onclick={handleVerify}>
        {$_('bip39.verify.button')}
      </Button>
    </div>
  </div>
</div>

<style lang="scss">
  .verify-page {
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
  }

  .instructions {
    text-align: center;
  }

  .title {
    font-size: var(--font-size-xl);
    font-weight: bold;
    color: var(--color-content-text-inverted);
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .description {
    font-size: var(--font-size-medium);
    color: var(--color-content-text-secondary);
    max-width: 320px;
    margin: 0 auto;
    line-height: 1.4;
  }

  .verification-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: auto 0;
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .word-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    flex-shrink: 0;
  }

  .word-number {
    font-size: var(--font-size-medium);
    font-weight: 600;
    color: var(--color-content-text-secondary);
  }

  .word-input {
    flex: 1;
    width: 100%;
    height: 52px;
    padding: 0 16px;
    border-radius: 12px;
    border: 2px solid transparent;
    background-color: var(--color-neutral-background-container);
    color: var(--color-content-text-inverted);
    font-size: var(--font-size-medium);
    font-weight: 500;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--color-inputs-border-focus);
      background-color: var(--color-inputs-background-base);
      box-shadow: none;
    }
    
    &:hover:not(:focus) {
      border-color: var(--color-neutral-border-default);
    }

    &::placeholder {
      color: var(--color-content-text-secondary);
    }
  }

  .actions {
    padding: 24px 0;
  }
</style>
