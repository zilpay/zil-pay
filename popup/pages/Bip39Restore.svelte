<script lang="ts">
  import { _ } from '../i18n';
  import { pop } from '../router/navigation';
  import NavBar from '../components/NavBar.svelte';
  import WordCountSelector from '../components/WordCountSelector.svelte';
  import MnemonicWordInput from '../components/MnemonicWordInput.svelte';
  import Button from '../components/Button.svelte';
  import { detectLanguage } from 'lib/utils/locale';
  import { ALLOWED_COUNTS, LANGUAGE_OPTIONS } from 'config/bip39';
  import { validateBip39Checksum } from 'popup/background/wallet';

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
    console.log('Restoring wallet with phrase:', words.join(' '));
  }

  $effect(() => {
    loadWordlist('en');
  });
</script>

<div class="page-container restore-page">
  <NavBar title={$_('bip39.restore.title')} onBack={pop} />

  <div class="content">
    <WordCountSelector
      bind:selected={count}
      onSelect={handleCountChange}
    />

    <div class="words-grid">
      {#each words as word, index (index)}
        <MnemonicWordInput
          index={index + 1}
          {word}
          isEditable={true}
          hasError={wordErrors.includes(index)}
          onChanged={handleWordChange}
        />
      {/each}
    </div>

    {#if showChecksumWarning}
      <div class="checksum-warning">
        <p class="warning-text">{$_('bip39.restore.checksumWarning')}</p>
        <label class="bypass-checkbox">
          <input
            type="checkbox"
            bind:checked={bypassChecksum}
          />
          <span class="checkbox-text">{$_('bip39.restore.bypassCheckbox')}</span>
        </label>
      </div>
    {/if}

    <Button
      disabled={!isButtonEnabled}
      onclick={handleRestore}
      width="100%"
    >
      {$_('bip39.restore.restoreButton')}
    </Button>
  </div>
</div>

<style lang="scss">
  .restore-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--background-color);
    color: var(--text-primary);
    padding: 0 20px;
    box-sizing: border-box;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
    padding-bottom: 20px;
  }

  .words-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
    overflow-y: auto;
    padding: 8px 0;
    min-height: 200px;
  }

  .checksum-warning {
    padding: 16px;
    background-color: color-mix(in srgb, var(--danger-color) 10%, var(--card-background));
    border: 1px solid var(--danger-color);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .warning-text {
    color: var(--danger-color);
    font-weight: 600;
    font-size: var(--font-size-medium);
    margin: 0;
  }

  .bypass-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: var(--text-primary);
    user-select: none;
  }

  .checkbox-text {
    font-size: var(--font-size-medium);
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .bypass-checkbox input {
    width: 16px;
    height: 16px;
    accent-color: var(--primary-purple);
    cursor: pointer;
  }

  @media (max-width: 480px) {
    .restore-page {
      padding: 0 16px;
    }

    .content {
      gap: 16px;
    }

    .words-grid {
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 10px;
    }

    .checksum-warning {
      padding: 12px;
      gap: 10px;
    }

    .warning-text,
    .checkbox-text {
      font-size: var(--font-size-small);
    }
  }

  @media (max-width: 360px) {
    .words-grid {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 8px;
    }
  }
</style>
