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
  <div class="page-container">
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
        <Button 
          disabled={!isValid} 
          onclick={handleVerify}
          width="100%"
        >
          {$_('bip39.verify.button')}
        </Button>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .verify-page {
    display: flex;
    justify-content: center;
    min-height: 100vh;
    background: var(--background-color);
    color: var(--text-primary);
    padding: 0 var(--padding-side);
    box-sizing: border-box;
  }

  .page-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: var(--max-content-width);
    min-height: 100vh;
    box-sizing: border-box;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 20px;
    padding-bottom: 20px;
  }

  .instructions {
    text-align: center;
    padding: 16px 0;
  }

  .title {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 8px 0;
    line-height: 1.3;
  }

  .description {
    font-size: var(--font-size-medium);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
    opacity: 0.9;
    max-width: 320px;
    margin: 0 auto;
  }

  .verification-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
    justify-content: center;
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
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
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--primary-purple), color-mix(in srgb, var(--primary-purple) 80%, #000));
    border-radius: 10px;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--primary-purple) 25%, transparent);
    flex-shrink: 0;
  }

  .word-number {
    font-size: var(--font-size-medium);
    font-weight: 700;
    color: white;
  }

  .word-input {
    flex: 1;
    padding: 12px 16px;
    border-radius: 10px;
    border: 2px solid color-mix(in srgb, var(--text-secondary) 20%, transparent);
    background: var(--card-background);
    color: var(--text-primary);
    font-size: var(--font-size-medium);
    font-weight: 500;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--primary-purple);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-purple) 15%, transparent);
    }

    &::placeholder {
      color: var(--text-secondary);
      opacity: 0.6;
    }
  }

  .actions {
    padding: 16px 0;
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
  }

  @media (max-width: 480px) {
    .content {
      gap: 16px;
    }

    .instructions {
      padding: 12px 0;
    }

    .title {
      font-size: calc(var(--font-size-xl) * 0.9);
    }

    .description {
      font-size: var(--font-size-small);
      max-width: 280px;
    }

    .verification-section {
      gap: 14px;
    }

    .input-group {
      gap: 10px;
    }

    .word-indicator {
      width: 36px;
      height: 36px;
    }

    .word-number {
      font-size: var(--font-size-small);
    }

    .word-input {
      padding: 10px 14px;
      font-size: var(--font-size-small);
    }

    .actions {
      padding: 12px 0;
    }
  }

  @media (max-width: 360px) {
    .verification-section {
      gap: 12px;
    }

    .input-group {
      gap: 8px;
    }

    .word-indicator {
      width: 32px;
      height: 32px;
    }

    .word-input {
      padding: 8px 12px;
    }
  }

  @media (min-width: 768px) {
    .content {
      max-width: 500px;
      margin: 0 auto;
    }

    .verification-section {
      max-width: 450px;
    }

    .actions {
      max-width: 450px;
    }
  }
</style>
