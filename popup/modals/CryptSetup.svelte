<script lang="ts">
  import type { IWalletSettingsState, IWalletHashParams } from 'background/storage';
  import { CipherOrders } from 'crypto/keychain';
  import { HashTypes } from 'background/storage/argon';
  import { ShaAlgorithms } from 'config/pbkdf2';
  import { _ } from '../i18n';
  import RadioOption, { type OptionData } from '../components/RadioOption.svelte';
  import SmartInput from '../components/SmartInput.svelte';
  import Switch from '../components/Switch.svelte';
  import Dropdown from '../components/Dropdown.svelte';

  let {
    walletSettings,
    onchange
  }: {
    walletSettings: IWalletSettingsState;
    onchange: (settings: IWalletSettingsState) => void;
  } = $props();

  enum CipherPreset {
    Basic,
    Enhanced,
    QuantumResistant
  }

  enum MemoryPreset {
    Low,
    Medium,
    Secure
  }

  type DropdownOption = {
    code: string;
    label: string;
  };

  let advancedMode = $state(false);
  let selectedCipherPreset = $state(CipherPreset.QuantumResistant);
  let selectedMemoryPreset = $state(MemoryPreset.Medium);

  const cipherPresets: OptionData<CipherPreset>[] = [
    {
      value: CipherPreset.Basic,
      title: 'Standard Encryption',
      subtitle: 'AES-256',
      description: 'Basic, fast, and widely-used encryption algorithm.'
    },
    {
      value: CipherPreset.Enhanced,
      title: 'Hybrid Encryption',
      subtitle: 'AES-256 + KUZNECHIK',
      description: 'Enhanced security combining AES-256 with the GOST standard KUZNECHIK.'
    },
    {
      value: CipherPreset.QuantumResistant,
      title: 'Quantum-Resistant',
      subtitle: 'AES-256 + KUZNECHIK + NTRUP761',
      description: 'Highest security, designed to be resistant to attacks from quantum computers.'
    }
  ];

  const memoryPresets: OptionData<MemoryPreset>[] = [
    {
      value: MemoryPreset.Low,
      title: 'Low Memory',
      subtitle: '64KB RAM, 3 iterations',
      description: 'Minimal memory usage, suitable for low-end devices.'
    },
    {
      value: MemoryPreset.Medium,
      title: 'OWASP Default',
      subtitle: '6.5MB RAM, 2 iterations',
      description: 'Recommended by OWASP for general use.'
    },
    {
      value: MemoryPreset.Secure,
      title: 'Secure',
      subtitle: '256MB RAM, 4 iterations',
      description: 'High security with increased memory and iterations.'
    }
  ];

  const hashTypeOptions: DropdownOption[] = [
    { code: String(HashTypes.Argon2), label: 'Argon2id' },
    { code: String(HashTypes.Pbkdf2), label: 'PBKDF2' }
  ];

  const hashSizeOptions: DropdownOption[] = [
    { code: ShaAlgorithms.sha256, label: 'SHA-256' },
    { code: ShaAlgorithms.Sha512, label: 'SHA-512' }
  ];

  const presetToCipherOrders: Record<CipherPreset, CipherOrders[]> = {
    [CipherPreset.Basic]: [CipherOrders.AESGCM256],
    [CipherPreset.Enhanced]: [CipherOrders.AESGCM256, CipherOrders.KUZNECHIK],
    [CipherPreset.QuantumResistant]: [CipherOrders.AESGCM256, CipherOrders.KUZNECHIK, CipherOrders.NTRUP761]
  };

  const memoryPresetValues: Record<MemoryPreset, Partial<IWalletHashParams>> = {
    [MemoryPreset.Low]: { memory: 64, iterations: 3, threads: 1 },
    [MemoryPreset.Medium]: { memory: 6500, iterations: 2, threads: 2 },
    [MemoryPreset.Secure]: { memory: 262144, iterations: 4, threads: 2 }
  };

  function updateSettings(newSettings: Partial<IWalletSettingsState>) {
    const updated = { ...walletSettings, ...newSettings };
    if (JSON.stringify(updated) !== JSON.stringify(walletSettings)) {
      onchange(updated);
    }
  }

  function handleCipherPresetChange(preset: CipherPreset) {
    selectedCipherPreset = preset;
    updateSettings({ cipherOrders: presetToCipherOrders[preset] });
  }

  function handleMemoryPresetChange(preset: MemoryPreset) {
    selectedMemoryPreset = preset;
    const params = memoryPresetValues[preset];
    updateSettings({
      hashFnParams: {
        ...walletSettings.hashFnParams,
        ...params
      }
    });
  }

  function handleHashParamChange(key: keyof IWalletHashParams, value: any) {
    updateSettings({
      hashFnParams: {
        ...walletSettings.hashFnParams,
        [key]: value
      }
    });
  }

  function handleHashTypeSelect(code: string) {
    handleHashParamChange('hashType', Number(code));
  }

  function handleHashSizeSelect(code: string) {
    handleHashParamChange('hashSize', code);
  }

  $effect(() => {
    const orders = walletSettings.cipherOrders.slice().sort();
    if (JSON.stringify(orders) === JSON.stringify(presetToCipherOrders[CipherPreset.Basic].sort())) {
      selectedCipherPreset = CipherPreset.Basic;
    } else if (JSON.stringify(orders) === JSON.stringify(presetToCipherOrders[CipherPreset.Enhanced].sort())) {
      selectedCipherPreset = CipherPreset.Enhanced;
    } else {
      selectedCipherPreset = CipherPreset.QuantumResistant;
    }

    const { memory } = walletSettings.hashFnParams;
    if (memory <= 64) {
      selectedMemoryPreset = MemoryPreset.Low;
    } else if (memory <= 6500) {
      selectedMemoryPreset = MemoryPreset.Medium;
    } else {
      selectedMemoryPreset = MemoryPreset.Secure;
    }
  });
</script>

<div class="crypt-setup-content">
  <div class="section">
    <div class="section-header">
      <h3 class="section-title">Encryption Strength</h3>
      <p class="section-description">
        Determines the combination of cryptographic algorithms used to secure your wallet.
      </p>
    </div>
    <RadioOption
      options={cipherPresets}
      bind:selected={selectedCipherPreset}
      name="cipher-preset"
      onSelect={handleCipherPresetChange}
    />
  </div>

  <div class="section">
    <div class="section-header">
      <h3 class="section-title">Password Hashing</h3>
      <p class="section-description">
        Controls how your password is processed to derive the encryption key. Higher values are more secure but slower.
      </p>
      <div class="advanced-toggle">
        <Switch
          bind:checked={advancedMode}
          ariaLabel="Advanced hashing settings"
          size="small"
        />
        <span class="toggle-label">Advanced Mode</span>
      </div>
    </div>

    {#if !advancedMode}
      <RadioOption
        options={memoryPresets}
        bind:selected={selectedMemoryPreset}
        name="memory-preset"
        onSelect={handleMemoryPresetChange}
      />
    {:else}
      <div class="advanced-hash-settings">
        <div class="setting-row">
          <Dropdown
            options={hashTypeOptions}
            selected={String(walletSettings.hashFnParams.hashType)}
            onSelect={handleHashTypeSelect}
            width="100%"
          />
          <Dropdown
            options={hashSizeOptions}
            selected={walletSettings.hashFnParams.hashSize}
            onSelect={handleHashSizeSelect}
            width="100%"
          />
        </div>

        <div class="setting-row">
          <div class="input-group">
            <label for="memory-input">Memory (KB)</label>
            <input
              id="memory-input"
              type="number"
              min="64"
              step="64"
              value={walletSettings.hashFnParams.memory}
              oninput={(e) => handleHashParamChange('memory', Number(e.currentTarget.value))}
              class="number-input"
            />
          </div>
          <div class="input-group">
            <label for="iterations-input">Iterations</label>
            <input
              id="iterations-input"
              type="number"
              min="1"
              value={walletSettings.hashFnParams.iterations}
              oninput={(e) => handleHashParamChange('iterations', Number(e.currentTarget.value))}
              class="number-input"
            />
          </div>
          <div class="input-group">
            <label for="threads-input">Threads</label>
            <input
              id="threads-input"
              type="number"
              min="1"
              max="8"
              value={walletSettings.hashFnParams.threads}
              oninput={(e) => handleHashParamChange('threads', Number(e.currentTarget.value))}
              class="number-input"
            />
          </div>
        </div>
      </div>
    {/if}

    <SmartInput
      label="Secret (Optional)"
      placeholder="Enter an optional secret phrase"
      value={walletSettings.hashFnParams.secret}
      onInput={(e) => handleHashParamChange('secret', (e.target as HTMLInputElement).value)}
      showToggle={true}
    />
  </div>
</div>

<style lang="scss">
  .crypt-setup-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .section-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
  }

  .section-title {
    font-size: var(--font-size-large);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .section-description {
    font-size: var(--font-size-small);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .advanced-toggle {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
  }

  .toggle-label {
    font-size: var(--font-size-medium);
    color: var(--text-secondary);
    font-weight: 500;
  }

  .advanced-hash-settings {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 16px;
    background: var(--background-color);
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--text-secondary) 15%, transparent);
  }

  .setting-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    label {
      font-size: var(--font-size-small);
      font-weight: 500;
      color: var(--text-secondary);
    }
  }

  .number-input {
    padding: 12px 16px;
    border: 2px solid color-mix(in srgb, var(--text-secondary) 20%, transparent);
    border-radius: 8px;
    background: var(--card-background);
    color: var(--text-primary);
    font-size: var(--font-size-medium);
    font-weight: 500;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--primary-purple);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-purple) 15%, transparent);
    }
  }
</style>
