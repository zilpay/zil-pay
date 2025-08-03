<script lang="ts">
  import NavBar from '../components/NavBar.svelte';
  import WordCountSelector from '../components/WordCountSelector.svelte';
  import Dropdown from '../components/Dropdown.svelte';
  import Button from '../components/Button.svelte';
  import ReloadButton from '../components/ReloadButton.svelte';
  import MnemonicWord from '../components/MnemonicWord.svelte';
  import { _ } from 'popup/i18n';
  import { locale } from 'popup/i18n';
  import { pop, push } from '../router/navigation';
  import { generateBip39Words } from 'popup/background/wallet';
  import cacheStore from 'popup/store/cache';

  let wordCount = $state(12);
  let selectedLang = $state('en');
  let wordList = $state([]);
  let phrase: string[] = $state([]);
  let hasBackup = $state(false);

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'es', label: 'Español' }
  ];

  async function loadWordlist(lang: string = selectedLang) {
    try {
      let url = `/bip39/${lang}.json`;
      let res = await fetch(url);
      
      if (!res.ok) {
        url = `/bip39/en.json`;
        res = await fetch(url);
      }
      
      if (!res.ok) {
        throw new Error('Failed to load wordlist');
      }
      
      wordList = await res.json();
    } catch (error) {
      console.error('Error loading wordlist:', error);
      wordList = [];
    }
  }

  async function generateWords() {
    if (!wordList.length) return;
    
    try {
      const raw = await generateBip39Words(wordCount, wordList);
      phrase = raw.split(' ');
      hasBackup = false;
    } catch (error) {
      console.error('Error generating words:', error);
    }
  }

  function handleCountChange(count: number) {
    wordCount = count;
    generateWords();
  }

  function handleLanguageChange(langCode: string) {
    selectedLang = langCode;
    loadWordlist(langCode).then(() => {
      if (wordList.length > 0) {
        generateWords();
      }
    });
  }

  function handleNext() {
    if (hasBackup && phrase.length > 0) {
      cacheStore.set(phrase);
      push(`/verify-bip39`);
    }
  }

  function handleReload() {
    generateWords();
  }

  $effect(() => {
    let lang = ($locale ?? 'en').toLowerCase().split('-')[0];
    
    const supportedLangs = languageOptions.map(opt => opt.code);
    if (!supportedLangs.includes(lang)) {
      lang = 'en';
    }
    
    selectedLang = lang;
    
    loadWordlist(lang).then(() => {
      if (wordList.length > 0) {
        generateWords();
      }
    });
  });
</script>

<div class="bip39-page">
  <div class="page-container">
    <NavBar
      title={$_('bip39.create.title')}
      onBack={pop}
      rightIcon={ReloadButton}
      onRight={handleReload}
    />

    <div class="content">
      <div class="controls-section">
        <div class="control-group">
          <WordCountSelector bind:selected={wordCount} onSelect={handleCountChange} />
        </div>
        
        <div class="control-group centered">
          <Dropdown 
            options={languageOptions}
            bind:selected={selectedLang} 
            onSelect={handleLanguageChange}
            placeholder="Select language"
            width="200px"
          />
        </div>
      </div>

      <div class="phrase-section">
        <h3 class="section-title">{$_('bip39.create.phrase')}</h3>
        <div class="phrase-container">
          {#if phrase.length > 0}
            <div class="phrase-grid">
              {#each phrase as word, i}
                <MnemonicWord index={i + 1} {word} />
              {/each}
            </div>
          {:else}
            <div class="empty-state">
              <span>{$_('bip39.create.noWords')}</span>
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
            {$_('bip39.create.backupConfirm')}
          </span>
        </label>
      </div>

      <Button 
        onclick={handleNext} 
        disabled={!hasBackup || phrase.length === 0}
        width="100%"
      >
        {$_('bip39.create.next')}
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

  .controls-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &.centered {
      align-items: center;
    }
  }

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

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--text-secondary);
    font-size: 14px;
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

    .controls-section {
      gap: 16px;
    }

    .phrase-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 10px;
    }
  }

  @media (max-width: 360px) {
    .phrase-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 8px;
    }
  }
</style>
