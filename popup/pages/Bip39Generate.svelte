<script lang="ts">
  import NavBar from '../components/NavBar.svelte';
  import WordCountSelector from '../components/WordCountSelector.svelte';
  import Button from '../components/Button.svelte';
  import ReloadButton from '../components/ReloadButton.svelte';
  import { _ } from 'popup/i18n';
  import { locale } from 'popup/i18n';
  import { pop, push } from '../router/navigation';
  import { generateBip39Words } from 'popup/background/wallet';

  let wordCount = $state(12);
  let wordList = $state([]);
  let phrase: string[] = $state([]);
  let hasBackup = $state(false);
  let isLoading = $state(false);

  async function loadWordlist() {
    try {
      let lang = ($locale ?? 'en').toLowerCase().split('-')[0];
      let url = `/bip39/${lang}.json`;
      let res = await fetch(url);
      
      if (!res.ok) {
        url = `/bip39/en.json`;
        res = await fetch(url);
      }
      
      if (!res.ok) {
        throw new Error('');
      }
      
      wordList = await res.json();
    } catch (error) {
      console.error('', error);
      wordList = [];
    }
  }

  async function generateWords() {
    if (!wordList.length) return;
    
    try {
      isLoading = true;
      const raw = await generateBip39Words(wordCount, wordList);
      phrase = raw.split(' ');
      hasBackup = false;
    } catch (error) {
      console.error('Error generating words:', error);
    } finally {
      isLoading = false;
    }
  }

  function handleCountChange(count: number) {
    wordCount = count;
    generateWords();
  }

  function handleNext() {
    if (hasBackup && phrase.length > 0) {
      // push('/verify-bip39', { phrase: phrase.join(' ') });
    }
  }

  function handleReload() {
    generateWords();
  }

  $effect(() => {
    loadWordlist().then(() => {
      if (wordList.length > 0) {
        generateWords();
      }
    });
  });
</script>

<div class="bip39-page">
  <div class="page-container">
    <NavBar
      title={$_('generateWallet.bip39.title')}
      onBack={pop}
      rightIcon={ReloadButton}
      onRight={handleReload}
    />

    <div class="content">
      <div class="selector-section">
        <WordCountSelector bind:selected={wordCount} onSelect={handleCountChange} />
      </div>

      <div class="phrase-section">
        <h3 class="section-title">{$_('generateWallet.bip39.phrase')}</h3>
        <div class="phrase-container">
          {#if isLoading}
            <div class="loading-state">
              <span class="loading-spinner"></span>
              <span>{$_('generateWallet.bip39.generating')}</span>
            </div>
          {:else if phrase.length > 0}
            <div class="phrase-grid">
              {#each phrase as word, i}
                <div class="mnemonic-word">
                  <span class="word-index">{i + 1}</span>
                  <span class="word-text">{word}</span>
                </div>
              {/each}
            </div>
          {:else}
            <div class="empty-state">
              <span>{$_('generateWallet.bip39.noWords')}</span>
            </div>
          {/if}
        </div>
      </div>

      <div class="backup-section">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            bind:checked={hasBackup}
            class="checkbox-input"
          />
          <span class="checkbox-text">
            {$_('generateWallet.bip39.backupConfirm')}
          </span>
        </label>
      </div>

      <Button 
        onclick={handleNext} 
        disabled={!hasBackup || phrase.length === 0 || isLoading}
        width="100%"
      >
        {$_('generateWallet.bip39.next')}
      </Button>
    </div>
  </div>
</div>

<style lang="scss">
  .bip39-page {
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
    gap: 24px;
    overflow-y: auto;
    padding-bottom: 20px;
  }

  .selector-section,
  .phrase-section,
  .backup-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .phrase-container {
    background: var(--card-background);
    border-radius: 16px;
    padding: 20px;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .phrase-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
    width: 100%;
    max-width: 100%;
  }

  .mnemonic-word {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--background-color);
    border-radius: 8px;
    padding: 14px 16px;
    border: 1px solid color-mix(in srgb, var(--text-secondary) 20%, transparent);
    min-width: 0;
  }

  .word-index {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    min-width: 20px;
    flex-shrink: 0;
  }

  .word-text {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid color-mix(in srgb, var(--primary-purple) 30%, transparent);
    border-top: 2px solid var(--primary-purple);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    user-select: none;
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
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  @media (max-width: 480px) {
    .page-container {
      padding: 0 16px;
    }

    .phrase-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 10px;
    }

    .mnemonic-word {
      padding: 12px 14px;
    }
  }

  @media (max-width: 360px) {
    .phrase-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 8px;
    }

    .mnemonic-word {
      padding: 10px 12px;
      gap: 8px;
    }

    .word-text {
      font-size: 13px;
    }
  }
</style>
