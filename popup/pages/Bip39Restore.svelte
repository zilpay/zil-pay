<script lang="ts">
  import { _ } from 'popup/i18n';
  import { pop, push } from 'popup/router/navigation';
  import NavBar from '../components/NavBar.svelte';
  import Button from '../components/Button.svelte';
  import WordCountSelector from '../components/WordCountSelector.svelte';

  import {
    validateBip39Checksum
  } from 'popup/background/wallet';
  import { LANGUAGE_OPTIONS, ALLOWED_COUNTS } from 'config/bip39';


  let wordCount = $state(12);
  let words = $state<string[]>(Array(wordCount).fill(''));
  let wordErrors = $state<boolean[]>(Array(wordCount).fill(false));
  let isChecksumValid = $state(true);
  let showChecksumWarning = $state(false);
  let bypassChecksum = $state(false);
  
  let wordlists = $state<Record<string, string[]>>({});
  let detectedLang = $state('en');

  let allWordsEntered = $derived(words.every(word => word.length > 0));

  const isButtonEnabled = $derived(() => {
    if (!allWordsEntered) return false;
    if (wordErrors.some(e => e)) return false;
    if (isChecksumValid) return true;
    return bypassChecksum;
  });

  async function detectAndValidateWords() {
    const filledWords = words.map(w => w.trim()).filter(w => w);
    if (filledWords.length === 0) {
      wordErrors = Array(wordCount).fill(false);
      return;
    }

    const firstWord = filledWords[0];
    let langFound = false;
    for (const lang of LANGUAGE_OPTIONS) {
      if (wordlists[lang.code]?.includes(firstWord)) {
        detectedLang = lang.code;
        langFound = true;
        break;
      }
    }
    
    const currentWordlist = wordlists[detectedLang] || [];
    const newErrors = words.map(word => word.trim() && !currentWordlist.includes(word.trim()));
    wordErrors = newErrors;

    const allValid = !newErrors.some(e => e);

    if (allWordsEntered && allValid) {
      const phrase = words.join(' ');
      // Для демонстрации, предположим, что фраза невалидна, если содержит 'error'.
      const checksumIsValid = !phrase.includes('error');
      // const checksumIsValid = await validateBip39Checksum(phrase, detectedLang);
      
      isChecksumValid = checksumIsValid;
      showChecksumWarning = !checksumIsValid;
    } else {
      isChecksumValid = true;
      showChecksumWarning = false;
    }
  }

  function handleWordChange(index: number, value: string) {
    const pastedWords = value.trim().split(/\s+/).filter(w => w);

    if (pastedWords.length > 1) {
      handlePaste(pastedWords);
      return;
    }

    words[index] = value.trim().toLowerCase();
    showChecksumWarning = false;
    bypassChecksum = false;
    
    detectAndValidateWords();
  }

  function handlePaste(pastedWords: string[]) {
    const targetCount = ALLOWED_COUNTS.find(c => c >= pastedWords.length) || ALLOWED_COUNTS[ALLOWED_COUNTS.length - 1];
    
    if (targetCount !== wordCount) {
      handleCountChange(targetCount);
    }
    
    const newWords = Array(targetCount).fill('');
    for(let i = 0; i < Math.min(pastedWords.length, targetCount); i++) {
      newWords[i] = pastedWords[i].toLowerCase();
    }
    
    words = newWords;
    showChecksumWarning = false;
    bypassChecksum = false;
    detectAndValidateWords();
  }

  function handleCountChange(newCount: number) {
    wordCount = newCount;
    const newWords = Array(newCount).fill('');
    const min = Math.min(words.length, newCount);
    for (let i = 0; i < min; i++) {
      newWords[i] = words[i];
    }
    words = newWords;
    wordErrors = Array(newCount).fill(false);
    showChecksumWarning = false;
    bypassChecksum = false;
  }

  function handleRestore() {
    if (!isButtonEnabled) return;
    const phrase = words.join(' ');
    console.log('Restoring with phrase:', phrase, 'Bypass checksum:', bypassChecksum);
    push('/home');
  }

  $effect(() => {
    async function loadAllWordlists() {
      const promises = LANGUAGE_OPTIONS.map(async (lang) => {
        try {
          const res = await fetch(`/bip39/${lang.code}.json`);
          if (res.ok) {
            return { [lang.code]: await res.json() };
          }
        } catch (e) {
          console.error(`Failed to load wordlist for ${lang.code}`, e);
        }
        return {};
      });
      const results = await Promise.all(promises);
      wordlists = Object.assign({}, ...results);
    }
    loadAllWordlists();
  });

</script>

<div class="restore-page">
  <div class="page-container">
    <NavBar title={$_('bip39.restore.title')} onBack={pop} />
    
    <div class="content">
      <div class="controls-section">
        <WordCountSelector 
          bind:selected={wordCount}
          onSelect={handleCountChange}
          wordCounts={ALLOWED_COUNTS} 
        />
      </div>

      <div class="phrase-grid-container">
        <div class="phrase-grid">
          {#each { length: wordCount } as _, i}
            <div class="word-input-group" class:error-group={wordErrors[i]}>
              <span class="word-index">{i + 1}</span>
              <input
                type="text"
                class="word-input"
                bind:value={words[i]}
                oninput={(e) => handleWordChange(i, e.currentTarget.value)}
                autocapitalize="off"
                autocomplete="off"
                spellcheck="false"
              />
            </div>
          {/each}
        </div>
      </div>

      <div class="footer">
        {#if showChecksumWarning}
          <div class="checksum-warning">
            <p class="warning-title">{$_('bip39.restore.checksumFailed')}</p>
            <label class="checkbox-label">
              <input
                type="checkbox"
                class="checkbox-input"
                bind:checked={bypassChecksum}
              />
              <span class="checkbox-text">{$_('bip39.restore.proceedAnyway')}</span>
            </label>
          </div>
        {/if}
        
        <Button
          onclick={handleRestore}
          disabled={!isButtonEnabled}
          width="100%"
        >
          {$_('bip39.restore.button')}
        </Button>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .restore-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--background-color);
  }

  .page-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    padding: 0 20px;
    box-sizing: border-box;
    height: 100%;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: hidden;
    padding-bottom: 20px;
  }

  .controls-section {
    padding-top: 16px;
  }
  
  .phrase-grid-container {
    flex: 1;
    overflow-y: auto;
    margin: 0 -10px;
    padding: 0 10px;
  }

  .phrase-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    width: 100%;
  }

  .word-input-group {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--card-background);
    border-radius: 8px;
    padding: 4px 16px;
    border: 1px solid color-mix(in srgb, var(--text-secondary) 20%, transparent);
    transition: border-color 0.2s ease;

    &:focus-within {
      border-color: var(--primary-purple);
    }

    &.error-group {
      border-color: var(--danger-color);
    }
  }

  .word-index {
    font-size: var(--font-size-small);
    font-weight: 600;
    color: var(--text-secondary);
    transition: color 0.2s ease;

    .error-group & {
      color: var(--danger-color);
    }
  }

  .word-input {
    flex: 1;
    width: 100%;
    height: 44px;
    border: none;
    background: transparent;
    color: var(--text-primary);
    font-size: var(--font-size-medium);
    font-weight: 500;
    
    &:focus {
      outline: none;
    }
  }

  .footer {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 8px;
  }

  .checksum-warning {
    padding: 12px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--danger-color) 10%, transparent);
    border: 1px solid var(--danger-color);
  }

  .warning-title {
    font-weight: 600;
    font-size: var(--font-size-medium);
    color: var(--danger-color);
    margin-bottom: 8px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }

  .checkbox-input {
    width: 18px;
    height: 18px;
    accent-color: var(--primary-purple);
    cursor: pointer;
    flex-shrink: 0;
  }
  
  .checkbox-text {
    font-size: var(--font-size-small);
    color: var(--text-primary);
    line-height: 1.4;
  }
  
  @media (max-width: 480px) {
    .phrase-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
    }
  }

  @media (max-width: 360px) {
    .phrase-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }
  }
</style>
