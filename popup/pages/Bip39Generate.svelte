<script lang="ts">
  import NavBar from '../components/NavBar.svelte';
  import WordCountSelector from '../components/WordCountSelector.svelte';
  import Dropdown from '../components/Dropdown.svelte';
  import Button from '../components/Button.svelte';
  import MnemonicWord from '../components/MnemonicWord.svelte';
  import CopyIcon from '../components/icons/Copy.svelte';
  import RefreshIcon from '../components/icons/Refresh.svelte';
  import SaveIcon from '../components/icons/Save.svelte';
  import { _ } from 'popup/i18n';
  import { locale } from 'popup/i18n';
  import { pop, push } from '../router/navigation';
  import { generateBip39Words } from 'popup/background/wallet';
  import { cacheStore } from 'popup/store/cache';
  import { LANGUAGE_OPTIONS } from 'config/bip39';

  let wordCount = $state(12);
  let selectedLang = $state('en');
  let wordList = $state<string[]>([]);
  let phrase: string[] = $state([]);
  let hasBackup = $state(false);

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
      cacheStore.set({
        verifyPhrase: phrase,
        verifyCheckSum: true,
        bip39WordList: wordList,
      });
      push(`/verify-bip39`);
    }
  }

  function handleReload() {
    generateWords();
  }
  
  function handleCopy() {
    navigator.clipboard.writeText(phrase.join(' '));
  }

  function handleSave() {
    const data = phrase.join(' ');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recovery-phrase.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  $effect(() => {
    let lang = ($locale ?? 'en').toLowerCase().split('-')[0];
    
    const supportedLangs = LANGUAGE_OPTIONS.map(opt => opt.code);
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

<div class="page-container">
  <NavBar title={$_('bip39.create.title')} onBack={pop} />

  <div class="content">
    <div class="section">
      <h4 class="section-label">{$_('bip39.create.chooseWords')}</h4>
      <WordCountSelector bind:selected={wordCount} onSelect={handleCountChange} />
    </div>

    <div class="section">
      <div class="section-header">
        <h3 class="section-title">{$_('bip39.create.phrase')}</h3>
        <Dropdown 
          options={LANGUAGE_OPTIONS}
          bind:selected={selectedLang} 
          onSelect={handleLanguageChange}
          width="120px"
        />
      </div>

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

    <div class="footer">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={hasBackup} class="checkbox-input" />
        <span class="checkbox-custom"></span>
        <span class="checkbox-text">{$_('bip39.create.backupConfirm')}</span>
      </label>

      <Button onclick={handleNext} disabled={!hasBackup || phrase.length === 0}>
        {$_('bip39.create.next')}
      </Button>
    </div>
  </div>
</div>

<style lang="scss">
  .page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--color-neutral-background-base);
    padding: 0 16px;
    box-sizing: border-box;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px 0;
    overflow-y: auto;
    min-height: 0;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .section-label {
    font-size: var(--font-size-medium);
    color: var(--color-content-text-secondary);
    font-weight: 500;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-title {
    font-size: var(--font-size-xl);
    font-weight: bold;
    color: var(--color-content-text-inverted);
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

  .phrase-container {
    background: var(--color-cards-regular-base-default);
    border: 1px solid var(--color-cards-regular-border-default);
    border-radius: 16px;
    padding: 0 16px;
  }
  
  .phrase-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0 24px;

    @media (min-width: 420px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  .footer {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-top: 16px;
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
