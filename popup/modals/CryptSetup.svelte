<script lang="ts">
  import { _ } from '../i18n';
  import type { IWalletSettingsState, IWalletHashParams } from 'background/storage';
  import { CipherOrders } from 'crypto/keychain';
  import { HashTypes } from 'background/storage/argon';
  import { ShaAlgorithms } from 'config/pbkdf2';
  import SmartInput from '../components/SmartInput.svelte';
  import RadioOption from '../components/RadioOption.svelte';
  import Switch from '../components/Switch.svelte';
  import Dropdown from '../components/Dropdown.svelte';

  let {
    settings = $bindable(),
    onChange = () => {}
  }: {
    settings: IWalletSettingsState;
    onChange?: (updatedSettings: IWalletSettingsState) => void;
  } = $props();

  let advancedMode = $state(false);

  enum CipherPreset {
    Basic,
    Enhanced,
    QuantumResistant,
    Custom
  }

  const cipherPresets = $derived(() => [
    {
      value: CipherPreset.Basic,
      title: $_('modals.cryptsetup.cipher.presets.basic.title'),
      subtitle: $_('modals.cryptsetup.cipher.presets.basic.subtitle'),
      description: $_('modals.cryptsetup.cipher.presets.basic.description'),
    },
    {
      value: CipherPreset.Enhanced,
      title: $_('modals.cryptsetup.cipher.presets.enhanced.title'),
      subtitle: $_('modals.cryptsetup.cipher.presets.enhanced.subtitle'),
      description: $_('modals.cryptsetup.cipher.presets.enhanced.description'),
    },
    {
      value: CipherPreset.QuantumResistant,
      title: $_('modals.cryptsetup.cipher.presets.quantum.title'),
      subtitle: $_('modals.cryptsetup.cipher.presets.quantum.subtitle'),
      description: $_('modals.cryptsetup.cipher.presets.quantum.description'),
    },
    {
      value: CipherPreset.Custom,
      title: $_('modals.cryptsetup.cipher.presets.custom.title'),
      subtitle: $_('modals.cryptsetup.cipher.presets.custom.subtitle'),
      description: $_('modals.cryptsetup.cipher.presets.custom.description'),
    }
  ]);

  const hashTypeOptions = $derived(() => [
    { code: HashTypes.Argon2.toString(), label: $_('modals.cryptsetup.hash.types.argon2') },
    { code: HashTypes.Pbkdf2.toString(), label: $_('modals.cryptsetup.hash.types.pbkdf2') }
  ]);

  const hashSizeOptions = $derived(() => [
    { code: ShaAlgorithms.sha256, label: $_('modals.cryptsetup.hash.sizes.sha256') },
    { code: ShaAlgorithms.Sha512, label: $_('modals.cryptsetup.hash.sizes.sha512') }
  ]);

  const memoryPresets = $derived(() => [
    {
      value: 0,
      title: $_('modals.cryptsetup.hash.memory.low.title'),
      subtitle: $_('modals.cryptsetup.hash.memory.low.subtitle'),
      description: $_('modals.cryptsetup.hash.memory.low.description'),
    },
    {
      value: 1,
      title: $_('modals.cryptsetup.hash.memory.medium.title'),
      subtitle: $_('modals.cryptsetup.hash.memory.medium.subtitle'),
      description: $_('modals.cryptsetup.hash.memory.medium.description'),
    },
    {
      value: 2,
      title: $_('modals.cryptsetup.hash.memory.high.title'),
      subtitle: $_('modals.cryptsetup.hash.memory.high.subtitle'),
      description: $_('modals.cryptsetup.hash.memory.high.description'),
    }
  ]);

  let selectedCipherPreset = $state(CipherPreset.QuantumResistant);
  let selectedMemoryPreset = $state(1);

  let cipherFlags = $state({
    [CipherOrders.AESGCM256]: true,
    [CipherOrders.KUZNECHIK]: true,
    [CipherOrders.NTRUP761]: true,
    [CipherOrders.AESCBC]: false
  });

  const presetToCipherOrders: Record<CipherPreset, CipherOrders[]> = {
    [CipherPreset.Basic]: [CipherOrders.AESGCM256],
    [CipherPreset.Enhanced]: [CipherOrders.AESGCM256, CipherOrders.KUZNECHIK],
    [CipherPreset.QuantumResistant]: [CipherOrders.AESGCM256, CipherOrders.KUZNECHIK, CipherOrders.NTRUP761],
    [CipherPreset.Custom]: []
  };

  const memoryPresetValues = [
    { memory: 1024, iterations: 1, threads: 1 },
    { memory: 8192, iterations: 3, threads: 1 },
    { memory: 65536, iterations: 5, threads: 2 }
  ];

  function updateCipherOrders() {
    let newCipherOrders: CipherOrders[];

    if (selectedCipherPreset === CipherPreset.Custom) {
      newCipherOrders = Object.entries(cipherFlags)
        .filter(([_, enabled]) => enabled)
        .map(([cipher, _]) => Number(cipher) as CipherOrders);
    } else {
      newCipherOrders = presetToCipherOrders[selectedCipherPreset];
    }

    const updatedSettings: IWalletSettingsState = {
      ...settings,
      cipherOrders: newCipherOrders
    };

    settings = updatedSettings;
    onChange(updatedSettings);
  }

  function updateHashParams() {
    const memoryConfig = memoryPresetValues[selectedMemoryPreset];
    
    const updatedHashParams: IWalletHashParams = {
      ...settings.hashFnParams,
      memory: memoryConfig.memory,
      iterations: memoryConfig.iterations,
      threads: memoryConfig.threads
    };

    const updatedSettings: IWalletSettingsState = {
      ...settings,
      hashFnParams: updatedHashParams
    };

    settings = updatedSettings;
    onChange(updatedSettings);
  }

  function handleCipherPresetChange(preset: CipherPreset) {
    selectedCipherPreset = preset;
    updateCipherOrders();
  }

  function handleCipherFlagChange(cipher: CipherOrders, enabled: boolean) {
    cipherFlags[cipher] = enabled;
    updateCipherOrders();
  }

  function handleMemoryPresetChange(preset: number) {
    selectedMemoryPreset = preset;
    updateHashParams();
  }

  function handleHashTypeChange(type: string) {
    const updatedHashParams: IWalletHashParams = {
      ...settings.hashFnParams,
      hashType: Number(type) as HashTypes
    };

    const updatedSettings: IWalletSettingsState = {
      ...settings,
      hashFnParams: updatedHashParams
    };

    settings = updatedSettings;
    onChange(updatedSettings);
  }

  function handleHashSizeChange(size: string) {
    const updatedHashParams: IWalletHashParams = {
      ...settings.hashFnParams,
      hashSize: size as ShaAlgorithms
    };

    const updatedSettings: IWalletSettingsState = {
      ...settings,
      hashFnParams: updatedHashParams
    };

    settings = updatedSettings;
    onChange(updatedSettings);
  }

  function handleSecretChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    
    const updatedHashParams: IWalletHashParams = {
      ...settings.hashFnParams,
      secret: value
    };

    const updatedSettings: IWalletSettingsState = {
      ...settings,
      hashFnParams: updatedHashParams
    };

    settings = updatedSettings;
    onChange(updatedSettings);
  }

  function handleIterationsChange(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    
    const updatedHashParams: IWalletHashParams = {
      ...settings.hashFnParams,
      iterations: value
    };

    const updatedSettings: IWalletSettingsState = {
      ...settings,
      hashFnParams: updatedHashParams
    };

    settings = updatedSettings;
    onChange(updatedSettings);
  }

  function handleMemoryChange(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    
    const updatedHashParams: IWalletHashParams = {
      ...settings.hashFnParams,
      memory: value
    };

    const updatedSettings: IWalletSettingsState = {
      ...settings,
      hashFnParams: updatedHashParams
    };

    settings = updatedSettings;
    onChange(updatedSettings);
  }

  function handleThreadsChange(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    
    const updatedHashParams: IWalletHashParams = {
      ...settings.hashFnParams,
      threads: value
    };

    const updatedSettings: IWalletSettingsState = {
      ...settings,
      hashFnParams: updatedHashParams
    };

    settings = updatedSettings;
    onChange(updatedSettings);
  }

  $effect(() => {
    const currentCipherOrders = settings.cipherOrders;
    
    if (currentCipherOrders.length === 1 && currentCipherOrders.includes(CipherOrders.AESGCM256)) {
      selectedCipherPreset = CipherPreset.Basic;
    } else if (currentCipherOrders.length === 2 && 
               currentCipherOrders.includes(CipherOrders.AESGCM256) && 
               currentCipherOrders.includes(CipherOrders.KUZNECHIK)) {
      selectedCipherPreset = CipherPreset.Enhanced;
    } else if (currentCipherOrders.length === 3 && 
               currentCipherOrders.includes(CipherOrders.AESGCM256) && 
               currentCipherOrders.includes(CipherOrders.KUZNECHIK) && 
               currentCipherOrders.includes(CipherOrders.NTRUP761)) {
      selectedCipherPreset = CipherPreset.QuantumResistant;
    } else {
      selectedCipherPreset = CipherPreset.Custom;
    }

    for (const cipher of Object.values(CipherOrders)) {
      if (typeof cipher === 'number') {
        cipherFlags[cipher] = currentCipherOrders.includes(cipher);
      }
    }

    const memory = settings.hashFnParams.memory;
    if (memory <= 1024) {
      selectedMemoryPreset = 0;
    } else if (memory <= 8192) {
      selectedMemoryPreset = 1;
    } else {
      selectedMemoryPreset = 2;
    }
  });
</script>

<div class="crypt-setup-content">
  <div class="section">
    <div class="section-header">
      <h3 class="section-title">{$_('modals.cryptsetup.cipher.title')}</h3>
      <p class="section-description">{$_('modals.cryptsetup.cipher.description')}</p>
    </div>

    <RadioOption
      options={cipherPresets}
      bind:selected={selectedCipherPreset}
      name="cipher-preset"
      onSelect={handleCipherPresetChange}
    />

    {#if selectedCipherPreset === CipherPreset.Custom}
      <div class="custom-cipher-section">
        <h4 class="subsection-title">{$_('modals.cryptsetup.cipher.algorithms')}</h4>
        <div class="cipher-checkboxes">
          <label class="cipher-checkbox">
            <input
              type="checkbox"
              bind:checked={cipherFlags[CipherOrders.AESGCM256]}
              onchange={(e) => handleCipherFlagChange(CipherOrders.AESGCM256, e.target.checked)}
            />
            <span>{$_('modals.cryptsetup.cipher.aes256gcm')}</span>
          </label>
          
          <label class="cipher-checkbox">
            <input
              type="checkbox"
              bind:checked={cipherFlags[CipherOrders.KUZNECHIK]}
              onchange={(e) => handleCipherFlagChange(CipherOrders.KUZNECHIK, e.target.checked)}
            />
            <span>{$_('modals.cryptsetup.cipher.kuznechik')}</span>
          </label>
          
          <label class="cipher-checkbox">
            <input
              type="checkbox"
              bind:checked={cipherFlags[CipherOrders.NTRUP761]}
              onchange={(e) => handleCipherFlagChange(CipherOrders.NTRUP761, e.target.checked)}
            />
            <span>{$_('modals.cryptsetup.cipher.ntrup761')}</span>
          </label>
          
          <label class="cipher-checkbox">
            <input
              type="checkbox"
              bind:checked={cipherFlags[CipherOrders.AESCBC]}
              onchange={(e) => handleCipherFlagChange(CipherOrders.AESCBC, e.target.checked)}
            />
            <span>{$_('modals.cryptsetup.cipher.aescbc')}</span>
          </label>
        </div>
      </div>
    {/if}
  </div>

  <div class="section">
    <div class="section-header">
      <h3 class="section-title">{$_('modals.cryptsetup.hash.title')}</h3>
      <p class="section-description">{$_('modals.cryptsetup.hash.description')}</p>
      
      <div class="advanced-toggle">
        <Switch
          bind:checked={advancedMode}
          ariaLabel={$_('modals.cryptsetup.advanced.toggle')}
        />
        <span class="toggle-label">{$_('modals.cryptsetup.advanced.label')}</span>
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
            selected={settings.hashFnParams.hashType.toString()}
            placeholder={$_('modals.cryptsetup.hash.typeLabel')}
            onSelect={handleHashTypeChange}
            width="200px"
          />
          
          <Dropdown
            options={hashSizeOptions}
            selected={settings.hashFnParams.hashSize}
            placeholder={$_('modals.cryptsetup.hash.sizeLabel')}
            onSelect={handleHashSizeChange}
            width="200px"
          />
        </div>

        <div class="setting-row">
          <div class="input-group">
            <label for="memory-input">{$_('modals.cryptsetup.hash.memoryLabel')}</label>
            <input
              id="memory-input"
              type="number"
              min="64"
              max="1048576"
              step="64"
              value={settings.hashFnParams.memory}
              oninput={handleMemoryChange}
              class="number-input"
            />
          </div>
          
          <div class="input-group">
            <label for="iterations-input">{$_('modals.cryptsetup.hash.iterationsLabel')}</label>
            <input
              id="iterations-input"
              type="number"
              min="1"
              max="100"
              value={settings.hashFnParams.iterations}
              oninput={handleIterationsChange}
              class="number-input"
            />
          </div>
          
          <div class="input-group">
            <label for="threads-input">{$_('modals.cryptsetup.hash.threadsLabel')}</label>
            <input
              id="threads-input"
              type="number"
              min="1"
              max="8"
              value={settings.hashFnParams.threads}
              oninput={handleThreadsChange}
              class="number-input"
            />
          </div>
        </div>

        <SmartInput
          label={$_('modals.cryptsetup.hash.secretLabel')}
          placeholder={$_('modals.cryptsetup.hash.secretPlaceholder')}
          value={settings.hashFnParams.secret}
          onInput={handleSecretChange}
          showToggle={false}
        />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .crypt-setup-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
    max-height: 70vh;
    overflow-y: auto;
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
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .section-description {
    font-size: var(--font-size-medium);
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

  .custom-cipher-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background: var(--background-color);
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--text-secondary) 15%, transparent);
  }

  .subsection-title {
    font-size: var(--font-size-large);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .cipher-checkboxes {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .cipher-checkbox {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 12px;
    border-radius: 8px;
    background: var(--card-background);
    border: 1px solid color-mix(in srgb, var(--text-secondary) 10%, transparent);
    transition: all 0.2s ease;
    
    &:hover {
      border-color: color-mix(in srgb, var(--primary-purple) 30%, transparent);
      background: color-mix(in srgb, var(--primary-purple) 5%, var(--card-background));
    }

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--primary-purple);
      cursor: pointer;
    }

    span {
      font-size: var(--font-size-medium);
      font-weight: 500;
      color: var(--text-primary);
    }
  }

  .advanced-hash-settings {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .setting-row {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-width: 140px;

    label {
      font-size: var(--font-size-medium);
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
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--primary-purple);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-purple) 15%, transparent);
    }

    &:hover:not(:focus) {
      border-color: color-mix(in srgb, var(--primary-purple) 30%, transparent);
    }
  }

  /* Scrollbar styling */
  .crypt-setup-content::-webkit-scrollbar {
    width: 6px;
  }

  .crypt-setup-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .crypt-setup-content::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--text-secondary) 30%, transparent);
    border-radius: 3px;

    &:hover {
      background: color-mix(in srgb, var(--text-secondary) 50%, transparent);
    }
  }

  @media (max-width: 480px) {
    .crypt-setup-content {
      gap: 24px;
    }

    .section {
      gap: 16px;
    }

    .setting-row {
      flex-direction: column;
      gap: 12px;
    }

    .input-group {
      min-width: unset;
    }

    .cipher-checkbox {
      padding: 10px;

      span {
        font-size: var(--font-size-small);
      }
    }

    .section-title {
      font-size: var(--font-size-large);
    }

    .section-description {
      font-size: var(--font-size-small);
    }
  }

  @media (max-width: 360px) {
    .crypt-setup-content {
      gap: 20px;
    }

    .section {
      gap: 14px;
    }

    .custom-cipher-section {
      padding: 12px;
    }

    .cipher-checkboxes {
      gap: 10px;
    }
  }
</style>
