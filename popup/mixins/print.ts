import type { IKeyPair } from 'types/wallet';

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function generatePrintWindow(htmlContent: string): void {
  try {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      console.error('Failed to open print window');
      return;
    }

    printWindow.document.write(htmlContent);
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

function createBip39PrintDocument(words: string[], t: (key: string) => string): string {
    const currentDate = escapeHtml(new Date().toLocaleDateString());
    const title = escapeHtml(t('print.bip39.title'));
    const headerTitle = escapeHtml(t('print.bip39.header.title'));
    const headerSubtitle = escapeHtml(t('print.bip39.header.subtitle'));
    const generated = escapeHtml(t('print.bip39.header.generated'));
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; line-height: 1.6; color: #000; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
            .header h1 { font-size: 24px; margin-bottom: 4px; }
            .warning { background: #fffbe6; border: 1px solid #ffe58f; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
            .warning h2 { font-size: 18px; margin-bottom: 10px; color: #d46b08; }
            .warning ul { margin-left: 20px; padding-left: 0; }
            .phrase-container { margin: 30px 0; }
            .phrase-title { font-size: 20px; font-weight: 600; text-align: center; margin-bottom: 25px; }
            .phrase-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
            .word-item { display: flex; align-items: center; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 10px 14px; }
            .word-number { font-size: 12px; color: #888; margin-right: 12px; min-width: 20px; }
            .word-text { font-weight: 500; font-family: monospace; }
            @media print { .warning, .phrase-container { break-inside: avoid; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${headerTitle}</h1>
            <p>${headerSubtitle}</p>
            <p>${generated}: ${currentDate}</p>
          </div>
          <div class="warning">
            <h2>⚠️ ${escapeHtml(t('print.bip39.warning.title'))}</h2>
            <ul>
              <li>${escapeHtml(t('print.bip39.warning.secure'))}</li>
              <li>${escapeHtml(t('print.bip39.warning.access'))}</li>
              <li>${escapeHtml(t('print.bip39.warning.noOnline'))}</li>
            </ul>
          </div>
          <div class="phrase-container">
            <h2 class="phrase-title">${escapeHtml(t('print.bip39.phrase.title'))} (${words.length} ${escapeHtml(t('print.bip39.phrase.words'))})</h2>
            <div class="phrase-grid">
              ${words.map((word, index) => `
                <div class="word-item">
                  <span class="word-number">${index + 1}</span>
                  <span class="word-text">${escapeHtml(word)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </body>
      </html>
    `;
}

function createKeyPairPrintDocument(keys: IKeyPair, t: (key: string) => string): string {
    const currentDate = escapeHtml(new Date().toLocaleDateString());
    const title = escapeHtml(t('print.keypair.title'));
    const headerTitle = escapeHtml(t('print.keypair.header.title'));
    const headerSubtitle = escapeHtml(t('print.keypair.header.subtitle'));
    const generated = escapeHtml(t('print.keypair.header.generated'));
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; line-height: 1.6; color: #000; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
            .header h1 { font-size: 24px; margin-bottom: 4px; }
            .warning { background: #fffbe6; border: 1px solid #ffe58f; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
            .warning h2 { font-size: 18px; margin-bottom: 10px; color: #d46b08; }
            .warning ul { margin-left: 20px; padding-left: 0; }
            .key-container { margin: 30px 0; }
            .key-title { font-size: 20px; font-weight: 600; text-align: center; margin-bottom: 25px; }
            .key-section { margin-bottom: 16px; }
            .key-label { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
            .key-value { font-family: monospace; word-break: break-all; background: #f8f9fa; padding: 8px; border-radius: 4px; border: 1px solid #e9ecef; }
            @media print { .warning, .key-container { break-inside: avoid; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${headerTitle}</h1>
            <p>${headerSubtitle}</p>
            <p>${generated}: ${currentDate}</p>
          </div>
          <div class="warning">
            <h2>⚠️ ${escapeHtml(t('print.keypair.warning.title'))}</h2>
            <ul>
              <li>${escapeHtml(t('print.keypair.warning.secure'))}</li>
              <li>${escapeHtml(t('print.keypair.warning.access'))}</li>
              <li>${escapeHtml(t('print.keypair.warning.noOnline'))}</li>
            </ul>
          </div>
          <div class="key-container">
            <h2 class="key-title">${escapeHtml(t('print.keypair.keys.title'))}</h2>
            <div class="key-section">
              <div class="key-label">${escapeHtml(t('print.keypair.keys.privateKey'))}</div>
              <div class="key-value">${escapeHtml(keys.privateKey)}</div>
            </div>
            <div class="key-section">
              <div class="key-label">${escapeHtml(t('print.keypair.keys.publicKey'))}</div>
              <div class="key-value">${escapeHtml(keys.publicKey)}</div>
            </div>
            <div class="key-section">
              <div class="key-label">${escapeHtml(t('print.keypair.keys.address'))}</div>
              <div class="key-value">${escapeHtml(keys.address)}</div>
            </div>
          </div>
        </body>
      </html>
    `;
}

export function printBip39(phrase: string[], t: (key: string) => string) {
  if (!phrase || phrase.length === 0) {
    console.error('No phrase provided to print.');
    return;
  }
  const htmlContent = createBip39PrintDocument(phrase, t);
  generatePrintWindow(htmlContent);
}

export function printKeyPair(keyPair: IKeyPair, t: (key: string) => string) {
  if (!keyPair || !keyPair.privateKey) {
    console.error('No keyPair provided to print.');
    return;
  }
  const htmlContent = createKeyPairPrintDocument(keyPair, t);
  generatePrintWindow(htmlContent);
}
