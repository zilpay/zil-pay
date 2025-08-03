<script lang="ts">
  import { _ } from '../i18n';
  import { push } from '../router/navigation';
  import NavBar from '../components/NavBar.svelte';
  import Button from '../components/Button.svelte';
  import cacheStore from '../store/cache';

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
      return input.trim().toLowerCase() === original?.toLowerCase();
    });
  }

  function handleVerify() {
    cacheStore.set([]);
    push('/home');
  }

  $effect(() => {
    phrase = $cacheStore;
    
    if (phrase.length === 0) {
      push('/generate-bip39');
      return;
    }
    
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
              oninput={validate}
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
    gap: 32px;
    padding-bottom: 20px;
  }

  .instructions {
    text-align: center;
    padding: 20px 0;
  }

  .title {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 12px 0;
    line-height: 1.3;
  }

  .description {
    font-size: 16px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
    opacity: 0.9;
  }

  .verification-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 0 8px;
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 4px 0;
  }

  .word-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--primary-purple), color-mix(in srgb, var(--primary-purple) 80%, #000));
    border-radius: 12px;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-purple) 25%, transparent);
    flex-shrink: 0;
  }

  .word-number {
    font-size: 16px;
    font-weight: 700;
    color: white;
  }

  .word-input {
    flex: 1;
    padding: 16px 20px;
    border-radius: 12px;
    border: 2px solid color-mix(in srgb, var(--text-secondary) 20%, transparent);
    background: var(--card-background);
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 500;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--primary-purple);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-purple) 15%, transparent);
    }

    &::placeholder {
      color: var(--text-secondary);
      opacity: 0.6;
    }
  }

  .actions {
    margin-top: auto;
    padding: 20px 0;
  }

  @media (max-width: 480px) {
    .page-container {
      padding: 0 16px;
    }

    .content {
      gap: 24px;
    }

    .title {
      font-size: 20px;
    }

    .description {
      font-size: 15px;
    }

    .verification-section {
      gap: 16px;
      padding: 0 4px;
    }

    .input-group {
      gap: 12px;
    }

    .word-indicator {
      width: 44px;
      height: 44px;
    }

    .word-number {
      font-size: 15px;
    }

    .word-input {
      padding: 14px 16px;
      font-size: 15px;
    }
  }

  @media (max-width: 360px) {
    .input-group {
      gap: 10px;
    }

    .word-indicator {
      width: 40px;
      height: 40px;
    }

    .word-number {
      font-size: 14px;
    }

    .word-input {
      padding: 12px 14px;
      font-size: 14px;
    }
  }
</style>
