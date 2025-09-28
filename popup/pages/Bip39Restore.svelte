<script lang="ts">
  import { _ } from '../i18n';
  import { pop, push } from '../router/navigation';
  import NavBar from '../components/NavBar.svelte';
  import WordCountSelector from '../components/WordCountSelector.svelte';
  import MnemonicWordInput from '../components/MnemonicWordInput.svelte';
  import Button from '../components/Button.svelte';
  import { detectLanguage } from 'lib/utils/locale';
  import { ALLOWED_COUNTS, LANGUAGE_OPTIONS } from 'config/bip39';
  import { validateBip39Checksum } from 'popup/background/wallet';
  import { cacheStore } from 'popup/store/cache';

  let words = $state<string[]>(Array(12).fill(''));
  let wordErrors = $state<number[]>([]);
  let count = $state(12);
  let isChecksumValid = $state(true);
  let bypassChecksum = $state(false);
  let showChecksumWarning = $state(false);
  let allWordsEntered = $state(false);
  let currentLanguage = $state('en');
  let wordlist = $state<string[]>([]);

  const isButtonEnabled = $derived(() => {
    if (!allWordsEntered) return false;
    if (isChecksumValid) return true;
    return bypassChecksum;
  });

  async function loadWordlist(language: string) {
    try {
      const response = await fetch(`/bip39/${language}.json`);
      if (!response.ok) throw new Error(`Failed to load ${language} wordlist`);
      wordlist = await response.json();
      currentLanguage = language;
    } catch (error) {
      console.error('Error loading wordlist:', error);
      if (language !== 'en') {
        await loadWordlist('en');
      }
    }
  }

  async function detectAndLoadLanguage(word: string) {
    try {
      const detectedLang = detectLanguage(word);
      const langExists = LANGUAGE_OPTIONS.some(lang => lang.code === detectedLang);
      
      if (langExists && detectedLang !== currentLanguage) {
        await loadWordlist(detectedLang);
      }
    } catch (error) {
      if (currentLanguage !== 'en') {
        await loadWordlist('en');
      }
    }
  }

  async function checkWords() {
    try {
      const nonEmptyWords = words.filter(word => word.length > 0);
      if (nonEmptyWords.length === 0) return;

      await detectAndLoadLanguage(nonEmptyWords[0]);

      const errorIndexes: number[] = [];

      for (let i = 0; i < words.length; i++) {
        if (words[i].length > 0) {
          if (!wordlist.includes(words[i])) {
            errorIndexes.push(i);
          }
        }
      }

      wordErrors = errorIndexes;
      validateForm();
    } catch (error) {
      console.error('Error checking words:', error);
    }
  }

  async function validateForm() {
    const areAllWordsValid = words.every(word => word.length > 0) && wordErrors.length === 0;
    allWordsEntered = areAllWordsValid;

    if (areAllWordsValid && !showChecksumWarning) {
      const phrase = words.join(' ');
      const checksumValid = await validateBip39Checksum(phrase, wordlist);
      
      isChecksumValid = checksumValid;
      showChecksumWarning = !checksumValid;
    } else if (!areAllWordsValid) {
      showChecksumWarning = false;
      bypassChecksum = false;
    }
  }

  function handleWordChange(index: number, word: string) {
    if (word.trim().includes(' ')) {
      handlePhraseInput(word);
      return;
    }

    const trimmedWord = word.trim().toLowerCase().replace(/[^a-z]/g, '');
    const currentIndex = index - 1;

    words[currentIndex] = trimmedWord;
    
    if (wordErrors.includes(currentIndex)) {
      wordErrors = wordErrors.filter(i => i !== currentIndex);
    }

    if (showChecksumWarning) {
      showChecksumWarning = false;
      bypassChecksum = false;
    }

    validateForm();

    if (trimmedWord.length > 0) {
      queueMicrotask(() => checkWords());
    }
  }

  function handlePhraseInput(phrase: string) {
    const wordsArray = phrase
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);

    const targetCount = ALLOWED_COUNTS.find(c => c >= wordsArray.length) || ALLOWED_COUNTS[ALLOWED_COUNTS.length - 1];

    if (targetCount !== count) {
      handleCountChange(targetCount);
    }

    for (let i = 0; i < wordsArray.length && i < targetCount; i++) {
      words[i] = wordsArray[i].toLowerCase();
    }

    showChecksumWarning = false;
    bypassChecksum = false;

    validateForm();

    if (wordsArray.length > 0) {
      queueMicrotask(() => checkWords());
    }
  }

  function handleCountChange(newCount: number) {
    count = newCount;
    const newWords = Array(newCount).fill('');
    
    for (let i = 0; i < Math.min(words.length, newCount); i++) {
      newWords[i] = words[i];
    }
    
    words = newWords;
    wordErrors = [];
    showChecksumWarning = false;
    bypassChecksum = false;
    allWordsEntered = false;

    validateForm();
  }

  function handleRestore() {
    cacheStore.set({
      verifyPhrase: words,
      verifyCheckSum: !bypassChecksum,
      bip39WordList: wordlist,
    });
    push("/network-setup");
  }

  $effect(() => {
    loadWordlist('en');
  });
</script>

<div class="page-container restore-page">
  <NavBar title={$_('bip39.restore.title')} />

  <div class="content">
    <WordCountSelector
      bind:selected={count}
      onSelect={handleCountChange}
    />

    <div class="words-grid">
      {#each { length: count } as _, index}
        <MnemonicWordInput
          index={index + 1}
          word={words[index] || ''}
          isEditable={true}
          hasError={wordErrors.includes(index)}
          onChanged={handleWordChange}
        />
      {/each}
    </div>

    {#if showChecksumWarning}
      <div class="checksum-warning">
        <p class="warning-text">{$_('bip39.restore.checksumWarning')}</p>
        <label class="checkbox-label">
          <input type="checkbox" bind:checked={bypassChecksum} class="checkbox-input" />
          <span class="checkbox-custom"></span>
          <span class="checkbox-text">{$_('bip39.restore.bypassCheckbox')}</span>
        </label>
      </div>
    {/if}

    <div class="footer">
      <Button disabled={!isButtonEnabled} onclick={handleRestore}>
        {$_('bip39.restore.restoreButton')}
      </Button>
    </div>
  </div>
</div>

<style lang="scss">
  .restore-page {
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
    gap: 24px;
    padding: 24px 0;
    min-height: 0;
  }

  .words-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
    overflow-y: auto;
    align-content: start;
  }

  .checksum-warning {
    padding: 16px;
    background-color: color-mix(in srgb, var(--color-inputs-border-error) 10%, transparent);
    border: 1px solid var(--color-inputs-border-error);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .warning-text {
    color: var(--color-inputs-border-error);
    font-weight: 600;
    font-size: var(--font-size-medium);
    margin: 0;
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

  .footer {
    padding-top: 16px;
    margin-top: auto;
  }
</style>
