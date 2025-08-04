<script lang="ts">
  import type { IKeyPair } from 'types/wallet';
  import { _ } from 'popup/i18n';

  let {
    phrase = [],
    keyPair = null,
    disabled = false,
    ariaLabel = '',
    size = 44
  }: {
    phrase?: string[];
    keyPair?: IKeyPair | null;
    disabled?: boolean;
    ariaLabel?: string;
    size?: number;
  } = $props();

  const isPhraseMode = $derived(phrase && phrase.length > 0);
  const isKeyPairMode = $derived(keyPair && keyPair.privateKey);

  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function createBip39PrintDocument(words: string[]): string {
    const currentDate = escapeHtml(new Date().toLocaleDateString());
    const phraseString = escapeHtml(words.join(' '));
    const title = escapeHtml($_('print.bip39.title'));
    const headerTitle = escapeHtml($_('print.bip39.header.title'));
    const headerSubtitle = escapeHtml($_('print.bip39.header.subtitle'));
    const generated = escapeHtml($_('print.bip39.header.generated'));
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
              background: #ffffff;
              color: #000000;
              padding: 40px;
              line-height: 1.6;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px solid #e0e0e0;
              padding-bottom: 20px;
            }
            
            .header h1 {
              font-size: 28px;
              font-weight: 700;
              color: #000000;
              margin-bottom: 8px;
            }
            
            .header p {
              font-size: 14px;
              color: #666666;
              margin-bottom: 4px;
            }
            
            .date {
              font-size: 12px;
              color: #999999;
            }
            
            .warning {
              background: #fff3cd;
              border: 2px solid #ffeaa7;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 30px;
              color: #856404;
            }
            
            .warning h2 {
              font-size: 18px;
              margin-bottom: 10px;
              color: #d63031;
            }
            
            .warning ul {
              margin-left: 20px;
            }
            
            .warning li {
              margin-bottom: 6px;
              font-size: 14px;
            }
            
            .phrase-container {
              margin: 30px 0;
            }
            
            .phrase-title {
              font-size: 20px;
              font-weight: 600;
              text-align: center;
              margin-bottom: 25px;
              color: #000000;
            }
            
            .copy-section {
              background: #e8f4fd;
              border: 2px solid #2196f3;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 20px;
            }
            
            .copy-section h3 {
              font-size: 16px;
              margin-bottom: 8px;
              color: #1976d2;
            }
            
            .copy-text {
              font-family: 'Courier New', monospace;
              background: #ffffff;
              padding: 12px;
              border-radius: 4px;
              border: 1px solid #2196f3;
              word-break: break-all;
              line-height: 1.5;
              font-size: 14px;
            }
            
            .phrase-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 12px;
              max-width: 800px;
              margin: 0 auto;
            }
            
            .word-item {
              display: flex;
              align-items: center;
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 6px;
              padding: 12px 16px;
              font-size: 16px;
            }
            
            .word-number {
              background: #000000;
              color: #ffffff;
              border-radius: 4px;
              padding: 4px 8px;
              font-size: 12px;
              font-weight: 600;
              margin-right: 12px;
              min-width: 24px;
              text-align: center;
            }
            
            .word-text {
              font-weight: 500;
              font-family: 'Courier New', monospace;
              color: #000000;
            }
            
            .instructions {
              margin-top: 40px;
              background: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
            }
            
            .instructions h3 {
              font-size: 16px;
              margin-bottom: 12px;
              color: #000000;
            }
            
            .instructions ol {
              margin-left: 20px;
            }
            
            .instructions li {
              margin-bottom: 8px;
              font-size: 14px;
              color: #333333;
            }
            
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #999999;
              border-top: 1px solid #e0e0e0;
              padding-top: 20px;
            }
            
            @media print {
              body {
                padding: 20px;
              }
              
              .warning {
                break-inside: avoid;
              }
              
              .phrase-container {
                break-inside: avoid;
              }
              
              .word-item {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${headerTitle}</h1>
            <p>${headerSubtitle}</p>
            <p class="date">${generated}: ${currentDate}</p>
          </div>
          
          <div class="warning">
            <h2>⚠️ ${escapeHtml($_('print.bip39.warning.title'))}</h2>
            <ul>
              <li>${escapeHtml($_('print.bip39.warning.secure'))}</li>
              <li>${escapeHtml($_('print.bip39.warning.access'))}</li>
              <li>${escapeHtml($_('print.bip39.warning.noOnline'))}</li>
              <li>${escapeHtml($_('print.bip39.warning.multipleBackups'))}</li>
              <li>${escapeHtml($_('print.bip39.warning.testRestore'))}</li>
            </ul>
          </div>
          
          <div class="phrase-container">
            <h2 class="phrase-title">${escapeHtml($_('print.bip39.phrase.title'))} (${words.length} ${escapeHtml($_('print.bip39.phrase.words'))})</h2>
            
            <div class="copy-section">
              <h3>${escapeHtml($_('print.bip39.phrase.copyTitle'))}</h3>
              <div class="copy-text">${phraseString}</div>
            </div>
            
            <div class="phrase-grid">
              ${words.map((word, index) => `
                <div class="word-item">
                  <span class="word-number">${index + 1}</span>
                  <span class="word-text">${escapeHtml(word)}</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="instructions">
            <h3>${escapeHtml($_('print.bip39.instructions.title'))}</h3>
            <ol>
              <li>${escapeHtml($_('print.bip39.instructions.writeDown'))}</li>
              <li>${escapeHtml($_('print.bip39.instructions.doubleCheck'))}</li>
              <li>${escapeHtml($_('print.bip39.instructions.store'))}</li>
              <li>${escapeHtml($_('print.bip39.instructions.test'))}</li>
              <li>${escapeHtml($_('print.bip39.instructions.noPhotos'))}</li>
            </ol>
          </div>
          
          <div class="footer">
            <p>${escapeHtml($_('print.bip39.footer.warning'))}</p>
          </div>
        </body>
      </html>
    `;
  }

  function createKeyPairPrintDocument(keys: IKeyPair): string {
    const currentDate = escapeHtml(new Date().toLocaleDateString());
    const title = escapeHtml($_('print.keypair.title'));
    const headerTitle = escapeHtml($_('print.keypair.header.title'));
    const headerSubtitle = escapeHtml($_('print.keypair.header.subtitle'));
    const generated = escapeHtml($_('print.keypair.header.generated'));
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
              background: #ffffff;
              color: #000000;
              padding: 40px;
              line-height: 1.6;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px solid #e0e0e0;
              padding-bottom: 20px;
            }
            
            .header h1 {
              font-size: 28px;
              font-weight: 700;
              color: #000000;
              margin-bottom: 8px;
            }
            
            .header p {
              font-size: 14px;
              color: #666666;
              margin-bottom: 4px;
            }
            
            .date {
              font-size: 12px;
              color: #999999;
            }
            
            .warning {
              background: #fff3cd;
              border: 2px solid #ffeaa7;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 30px;
              color: #856404;
            }
            
            .warning h2 {
              font-size: 18px;
              margin-bottom: 10px;
              color: #d63031;
            }
            
            .warning ul {
              margin-left: 20px;
            }
            
            .warning li {
              margin-bottom: 6px;
              font-size: 14px;
            }
            
            .phrase-container {
              margin: 30px 0;
            }
            
            .phrase-title {
              font-size: 20px;
              font-weight: 600;
              text-align: center;
              margin-bottom: 25px;
              color: #000000;
            }
            
            .key-section {
              margin: 20px 0;
              padding: 16px;
              background: #f8f9fa;
              border-radius: 8px;
              border: 1px solid #e9ecef;
            }
            
            .key-label {
              font-weight: 600;
              color: #000000;
              margin-bottom: 8px;
              font-size: 14px;
            }
            
            .key-value {
              font-family: 'Courier New', monospace;
              word-break: break-all;
              background: #ffffff;
              padding: 8px;
              border-radius: 4px;
              border: 1px solid #e0e0e0;
              font-size: 12px;
              line-height: 1.4;
            }
            
            .instructions {
              margin-top: 40px;
              background: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
            }
            
            .instructions h3 {
              font-size: 16px;
              margin-bottom: 12px;
              color: #000000;
            }
            
            .instructions ol {
              margin-left: 20px;
            }
            
            .instructions li {
              margin-bottom: 8px;
              font-size: 14px;
              color: #333333;
            }
            
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #999999;
              border-top: 1px solid #e0e0e0;
              padding-top: 20px;
            }
            
            @media print {
              body {
                padding: 20px;
              }
              
              .warning {
                break-inside: avoid;
              }
              
              .phrase-container {
                break-inside: avoid;
              }
              
              .key-section {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${headerTitle}</h1>
            <p>${headerSubtitle}</p>
            <p class="date">${generated}: ${currentDate}</p>
          </div>
          
          <div class="warning">
            <h2>⚠️ ${escapeHtml($_('print.keypair.warning.title'))}</h2>
            <ul>
              <li>${escapeHtml($_('print.keypair.warning.secure'))}</li>
              <li>${escapeHtml($_('print.keypair.warning.access'))}</li>
              <li>${escapeHtml($_('print.keypair.warning.noOnline'))}</li>
              <li>${escapeHtml($_('print.keypair.warning.multipleBackups'))}</li>
              <li>${escapeHtml($_('print.keypair.warning.testImport'))}</li>
            </ul>
          </div>
          
          <div class="phrase-container">
            <h2 class="phrase-title">${escapeHtml($_('print.keypair.keys.title'))}</h2>
            
            <div class="key-section">
              <div class="key-label">${escapeHtml($_('print.keypair.keys.privateKey'))}</div>
              <div class="key-value">${escapeHtml(keys.privateKey)}</div>
            </div>
            
            <div class="key-section">
              <div class="key-label">${escapeHtml($_('print.keypair.keys.publicKey'))}</div>
              <div class="key-value">${escapeHtml(keys.publicKey)}</div>
            </div>
            
            <div class="key-section">
              <div class="key-label">${escapeHtml($_('print.keypair.keys.address'))}</div>
              <div class="key-value">${escapeHtml(keys.address)}</div>
            </div>
          </div>
          
          <div class="instructions">
            <h3>${escapeHtml($_('print.keypair.instructions.title'))}</h3>
            <ol>
              <li>${escapeHtml($_('print.keypair.instructions.writeDown'))}</li>
              <li>${escapeHtml($_('print.keypair.instructions.doubleCheck'))}</li>
              <li>${escapeHtml($_('print.keypair.instructions.store'))}</li>
              <li>${escapeHtml($_('print.keypair.instructions.test'))}</li>
              <li>${escapeHtml($_('print.keypair.instructions.noPhotos'))}</li>
            </ol>
          </div>
          
          <div class="footer">
            <p>${escapeHtml($_('print.keypair.footer.warning'))}</p>
          </div>
        </body>
      </html>
    `;
  }

  function handlePrint() {
    if (disabled) return;
    
    if (!isPhraseMode && !isKeyPairMode) {
      console.error('No phrase or keypair provided');
      return;
    }

    try {
      let printContent: string;
      
      if (isPhraseMode) {
        printContent = createBip39PrintDocument(phrase);
      } else if (isKeyPairMode) {
        printContent = createKeyPairPrintDocument(keyPair!);
      } else {
        return;
      }

      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        console.error('Failed to open print window');
        return;
      }

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    } catch (error) {
      console.error('Error creating print document:', error);
    }
  }
</script>

<button
  class="print-button"
  onclick={handlePrint}
  disabled={disabled || (!isPhraseMode && !isKeyPairMode)}
  aria-label={ariaLabel}
  style="width: {size}px; height: {size}px;"
>
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8Z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="17" cy="11" r="1" fill="currentColor"/>
  </svg>
</button>

<style lang="scss">
  .print-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--card-background);
    border: 2px solid transparent;
    border-radius: 10px;
    cursor: pointer;
    color: var(--primary-purple);
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover:not(:disabled) {
      border-color: color-mix(in srgb, var(--primary-purple) 30%, transparent);
      background: color-mix(in srgb, var(--card-background) 95%, var(--primary-purple));
    }

    &:focus {
      outline: none;
      border-color: var(--primary-purple);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
      color: var(--text-secondary);
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }
  }

  @media (max-width: 480px) {
    .print-button {
      svg {
        width: 18px;
        height: 18px;
      }
    }
  }

  @media (max-width: 360px) {
    .print-button {
      svg {
        width: 16px;
        height: 16px;
      }
    }
  }
</style>
