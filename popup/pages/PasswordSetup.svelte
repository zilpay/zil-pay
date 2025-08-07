<script lang="ts">
  import { HashTypes, type Bip32Account, type IWalletSettingsState } from 'background/storage';
  import NavBar from '../components/NavBar.svelte';
  import Button from '../components/Button.svelte';
  import SmartInput from '../components/SmartInput.svelte';
  import LittleButton from '../components/LittleButton.svelte';
  import Modal from '../components/Modal.svelte';
  import { _ } from '../i18n';
  import { pop, push } from '../router/navigation';
  import { cacheStore } from '../store/cache';
  import globalStore from '../store/global';
  import { CipherOrders } from 'crypto/keychain';
  import { ShaAlgorithms } from 'config/pbkdf2';
  import { RatesApiOptions } from 'config/api';
  import CryptModal from '../modals/CryptSetup.svelte';
  import type { WalletFromBip39Params, WalletFromPrivateKeyParams } from 'types/wallet';
  import { walletFromBip39Mnemonic, walletFromPrivateKey } from 'popup/background/wallet';

  let password = $state('');
  let confirmPassword = $state('');
  let walletName = $state('');
  let accountName = $state('');
  let passwordStrength = $state(0);
  let isValid = $state(false);
  let errors = $state<string[]>([]);
  let showAdvancedModal = $state(false);
  let walletSettings = $state<IWalletSettingsState>({
    cipherOrders: [CipherOrders.AESGCM256, CipherOrders.KUZNECHIK, CipherOrders.NTRUP761],
    hashFnParams: {
      memory: 2097152, 
      threads: 2,
      secret: "",
      iterations: 1,
      hashType: HashTypes.Argon2,
      hashSize: ShaAlgorithms.Sha512,
    },
    currencyConvert: "BTC",
    ipfsNode: null,
    ensEnabled: true,
    tokensListFetcher: true,
    nodeRankingEnabled: true,
    maxConnections: 15,
    requestTimeoutSecs: 15,
    ratesApiOptions: RatesApiOptions.CoinGecko,
    sessionTime: 3600,
  });

  const strengthLabels = [
    'passwordSetup.strength.veryWeak',
    'passwordSetup.strength.weak', 
    'passwordSetup.strength.fair',
    'passwordSetup.strength.good',
    'passwordSetup.strength.strong'
  ];

  const strengthColors = [
    'var(--danger-color)',
    'var(--warning-color)', 
    'var(--warning-color)',
    'var(--success-color)',
    'var(--success-color)'
  ];

  function generateDefaultWalletName(): string {
    const chainName = $cacheStore.chain?.name || 'Wallet';
    const walletCount = $globalStore.wallets.length;
    return `${chainName} ${walletCount}`;
  }

  function calculatePasswordStrength(pwd: string): number {
    if (!pwd) return 0;
    
    let score = 0;
    
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    return Math.min(Math.floor(score / 1.2), 4);
  }

  function validatePassword(): string[] {
    const validationErrors: string[] = [];
    
    if (password.length < 8) {
      validationErrors.push($_('passwordSetup.errors.minLength'));
    }
    
    if (!/[a-z]/.test(password)) {
      validationErrors.push($_('passwordSetup.errors.lowercase'));
    }
    
    if (!/[A-Z]/.test(password)) {
      validationErrors.push($_('passwordSetup.errors.uppercase'));
    }
    
    if (!/[0-9]/.test(password)) {
      validationErrors.push($_('passwordSetup.errors.number'));
    }
    
    if (password !== confirmPassword && confirmPassword.length > 0) {
      validationErrors.push($_('passwordSetup.errors.mismatch'));
    }
    
    return validationErrors;
  }

  function handlePasswordInput() {
    passwordStrength = calculatePasswordStrength(password);
    updateValidation();
  }

  function handleConfirmPasswordInput() {
    updateValidation();
  }

  function updateValidation() {
    errors = validatePassword();
    isValid = errors.length === 0 && password.length > 0 && confirmPassword.length > 0 && walletName.trim().length > 0;
  }

  async function handleCreateWallet() {
    if (!isValid) return;
    
    try {
      if ($cacheStore.keyPair && $cacheStore.chain) {
        const payload: WalletFromPrivateKeyParams = {
          walletName,
          accountName,
          password,
          key: $cacheStore.keyPair,
          chain: $cacheStore.chain,
          settings: walletSettings,
        };

        await walletFromPrivateKey(payload);
      } else if ($cacheStore.verifyPhrase && $cacheStore.chain && $cacheStore.bip39WordList) {
        const accounts: Bip32Account[] = [{
          index: 0,
          name: accountName,
        }]; // TODO: it might be better, if user select first 10 accounts.
        const payload: WalletFromBip39Params = {
          walletName,
          accounts,
          password,
          bip39WordList: $cacheStore.bip39WordList,
          verifyCheckSum: Boolean($cacheStore.verifyCheckSum),
          mnemonic: $cacheStore.verifyPhrase.join(" "),
          chain: $cacheStore.chain,
          settings: walletSettings,
        }

        await walletFromBip39Mnemonic(payload);
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  }

  function handleAdvancedSettings() {
    showAdvancedModal = true;
  }

  function handleModalClose() {
    showAdvancedModal = false;
  }

  $effect(() => {
    if (!$cacheStore.chain || (!$cacheStore.keyPair && !$cacheStore.verifyPhrase)) {
      return push("/start");
    }
    
    if (!walletName) {
      walletName = generateDefaultWalletName();
    }

    if (!accountName) {
      accountName = $_('wallet.naming.defaultChain') + ` 0`;
    }
  });
</script>

<div class="page-container password-setup">
  <NavBar title={$_('passwordSetup.title')} onBack={pop} />

  <div class="content">
    <div class="intro-section">
      <h2 class="subtitle">{$_('passwordSetup.subtitle')}</h2>
      <p class="description">{$_('passwordSetup.description')}</p>
    </div>

    <div class="form-section">
      <SmartInput
        id="wallet-name"
        hide={false}
        label={$_('passwordSetup.walletNameLabel')}
        placeholder={$_('passwordSetup.walletNamePlaceholder')}
        bind:value={walletName}
        required
        showToggle={false}
      />

      <SmartInput
        id="password"
        label={$_('passwordSetup.passwordLabel')}
        placeholder={$_('passwordSetup.passwordPlaceholder')}
        bind:value={password}
        onInput={handlePasswordInput}
        required
        hasError={password.length > 0 && passwordStrength < 2}
        ariaDescribedBy="password-strength"
      />

      {#if password.length > 0}
        <div id="password-strength" class="strength-indicator">
          <div class="strength-label">
            {$_('passwordSetup.strength.label')}: 
            <span 
              class="strength-text"
              style="color: {strengthColors[passwordStrength]}"
            >
              {$_(strengthLabels[passwordStrength])}
            </span>
          </div>
          <div class="strength-bar">
            {#each Array(5) as _, index}
              <div 
                class="strength-segment"
                class:active={index <= passwordStrength}
                style="background-color: {index <= passwordStrength ? strengthColors[passwordStrength] : 'var(--card-background)'}"
              ></div>
            {/each}
          </div>
        </div>
      {/if}

      <SmartInput
        id="confirm-password"
        label={$_('passwordSetup.confirmLabel')}
        placeholder={$_('passwordSetup.confirmPlaceholder')}
        bind:value={confirmPassword}
        onInput={handleConfirmPasswordInput}
        required
        hasError={confirmPassword.length > 0 && password !== confirmPassword}
        errorMessage={confirmPassword.length > 0 && password !== confirmPassword ? $_('passwordSetup.errors.mismatch') : ''}
      />

      {#if errors.length > 0}
        <div class="error-section">
          <div class="error-title">{$_('passwordSetup.requirements')}</div>
          <ul class="error-list">
            {#each errors as error}
              <li class="error-item">{error}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>

    <div class="actions-section">
      <div class="advanced-section">
        <LittleButton onclick={handleAdvancedSettings}>
          {$_('passwordSetup.advanced')}
        </LittleButton>
      </div>

      <div class="security-note">
        <div class="note-icon">🔒</div>
        <p class="note-text">{$_('passwordSetup.securityNote')}</p>
      </div>

      <Button 
        disabled={!isValid} 
        onclick={handleCreateWallet}
        width="100%"
      >
        {$_('passwordSetup.createButton')}
      </Button>
    </div>
  </div>
</div>

<Modal 
  bind:show={showAdvancedModal}
  title={$_('passwordSetup.advancedTitle')}
  onClose={handleModalClose}
  width="600px"
  closeOnOverlay={true}
>
  <CryptModal
    walletSettings={walletSettings}
    onchange={(settings) => walletSettings = settings}
  />
</Modal>

<style lang="scss">
  .password-setup {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--background-color);
    color: var(--text-primary);
    padding: 0 16px;
  }

  .page-container {
    max-width: 420px;
    margin: 0 auto;
    width: 100%;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px 0 16px;
  }

  .intro-section {
    text-align: center;
    padding: 8px 0;
  }

  .subtitle {
    font-size: var(--font-size-large);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 4px 0;
    line-height: 1.2;
  }

  .description {
    font-size: calc(var(--font-size-small) * 0.95);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.3;
    opacity: 0.9;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .strength-indicator {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .strength-label {
    font-size: calc(var(--font-size-small) * 0.9);
    color: var(--text-secondary);
  }

  .strength-text {
    font-weight: 600;
  }

  .strength-bar {
    display: flex;
    gap: 2px;
    height: 3px;
  }

  .strength-segment {
    flex: 1;
    border-radius: 1.5px;
    transition: background-color 0.3s ease;
  }

  .error-section {
    padding: 10px;
    background-color: color-mix(in srgb, var(--danger-color) 10%, var(--card-background));
    border: 1px solid var(--danger-color);
    border-radius: 8px;
  }

  .error-title {
    font-size: calc(var(--font-size-small) * 0.9);
    font-weight: 600;
    color: var(--danger-color);
    margin-bottom: 4px;
  }

  .error-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .error-item {
    font-size: calc(var(--font-size-small) * 0.85);
    color: var(--danger-color);
    margin-bottom: 2px;
    position: relative;
    padding-left: 10px;

    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: var(--danger-color);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .actions-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .advanced-section {
    display: flex;
    justify-content: center;
    padding: 2px 0;
  }

  .security-note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px;
    background: color-mix(in srgb, var(--primary-purple) 8%, var(--card-background));
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, var(--primary-purple) 20%, transparent);
  }

  .note-icon {
    font-size: calc(var(--font-size-small) * 1.1);
    flex-shrink: 0;
    line-height: 1;
  }

  .note-text {
    font-size: calc(var(--font-size-small) * 0.85);
    color: var(--text-secondary);
    line-height: 1.3;
    margin: 0;
  }

  @media (max-width: 480px) {
    .password-setup {
      padding: 0 12px;
    }

    .page-container {
      max-width: 100%;
    }

    .content {
      gap: 14px;
      padding: 6px 0 12px;
    }

    .intro-section {
      padding: 6px 0;
    }

    .subtitle {
      font-size: var(--font-size-medium);
      margin-bottom: 3px;
    }

    .description {
      font-size: calc(var(--font-size-small) * 0.9);
    }

    .form-section {
      gap: 10px;
    }

    .actions-section {
      gap: 8px;
    }

    .security-note {
      padding: 8px;
      gap: 6px;
    }

    .note-text {
      font-size: calc(var(--font-size-small) * 0.8);
    }
  }

  @media (max-width: 360px) {
    .password-setup {
      padding: 0 10px;
    }

    .form-section {
      gap: 8px;
    }

    .actions-section {
      gap: 6px;
    }
  }
</style>
