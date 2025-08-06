<script lang="ts">
  import { _ } from '../i18n';
  import type { IWalletSettingsState } from 'background/storage';
  import { CipherOrders } from 'crypto/keychain';
  import SmartInput from '../components/SmartInput.svelte';
  import RadioOption from '../components/RadioOption.svelte';

  enum CipherMode {
    Basic,
    Enhanced,
    QuantumResistant
  }

  enum MemoryProfile {
    Weak,
    Medium,
    Strong
  }

  let {
    settings = $bindable(),
    onChange = () => {}
  }: {
    settings: IWalletSettingsState;
    onChange?: (updatedSettings: IWalletSettingsState) => void;
  } = $props();

  const cipherOptions = $derived(() => [
    {
      value: CipherMode.Basic,
      title: $_('modals.cipher.modes.basic.title'),
      subtitle: $_('modals.cipher.modes.basic.subtitle'),
      description: $_('modals.cipher.modes.basic.description'),
    },
    {
      value: CipherMode.Enhanced,
      title: $_('modals.cipher.modes.enhanced.title'),
      subtitle: $_('modals.cipher.modes.enhanced.subtitle'),
      description: $_('modals.cipher.modes.enhanced.description'),
    },
    {
      value: CipherMode.QuantumResistant,
      title: $_('modals.cipher.modes.quantum-resistant.title'),
      subtitle: $_('modals.cipher.modes.quantum-resistant.subtitle'),
      description: $_('modals.cipher.modes.quantum-resistant.description'),
    }
  ]);

  const memoryProfiles = $derived(() => [
    {
      value: MemoryProfile.Weak,
      title: $_('modals.cipher.memory.weak.title'),
      subtitle: $_('modals.cipher.memory.weak.subtitle'),
      description: $_('modals.cipher.memory.weak.description'),
    },
    {
      value: MemoryProfile.Medium,
      title: $_('modals.cipher.memory.medium.title'),
      subtitle: $_('modals.cipher.memory.medium.subtitle'),
      description: $_('modals.cipher.memory.medium.description'),
    },
    {
      value: MemoryProfile.Strong,
      title: $_('modals.cipher.memory.strong.title'),
      subtitle: $_('modals.cipher.memory.strong.subtitle'),
      description: $_('modals.cipher.memory.strong.description'),
    }
  ]);

  let selectedCipherMode = $state<CipherMode>(CipherMode.QuantumResistant);
  let selectedMemoryProfile = $state<MemoryProfile>(MemoryProfile.Medium);

  const profileToParams: Record<MemoryProfile, { memory: number; iterations: number; threads: number }> = {
    [MemoryProfile.Weak]: { memory: 64, iterations: 1, threads: 1 },
    [MemoryProfile.Medium]: { memory: 8192, iterations: 2, threads: 1 },
    [MemoryProfile.Strong]: { memory: 262144, iterations: 4, threads: 2 }
  };

  const cipherToCipherOrders: Record<CipherMode, CipherOrders[]> = {
    [CipherMode.Basic]: [CipherOrders.AESGCM256],
    [CipherMode.Enhanced]: [CipherOrders.AESGCM256, CipherOrders.KUZNECHIK],
    [CipherMode.QuantumResistant]: [CipherOrders.AESGCM256, CipherOrders.KUZNECHIK, CipherOrders.NTRUP761]
  };

  function updateSettings() {
    const profile = profileToParams[selectedMemoryProfile];
    const cipherOrders = cipherToCipherOrders[selectedCipherMode];
    
    const updatedSettings: IWalletSettingsState = {
      ...settings,
      cipherOrders,
      hashFnParams: {
        ...settings.hashFnParams,
        memory: profile.memory,
        iterations: profile.iterations,
        threads: profile.threads
      }
    };

    settings = updatedSettings;
    onChange(updatedSettings);
  }

  function handleCipherChange(value: CipherMode) {
    selectedCipherMode = value;
    updateSettings();
  }

  function handleMemoryChange(value: MemoryProfile) {
    selectedMemoryProfile = value;
    updateSettings();
  }

  function handleSecretChange() {
    updateSettings();
  }

  $effect(() => {
    const currentMemory = settings.hashFnParams.memory;
    if (currentMemory <= 64) {
      selectedMemoryProfile = MemoryProfile.Weak;
    } else if (currentMemory <= 8192) {
      selectedMemoryProfile = MemoryProfile.Medium;
    } else {
      selectedMemoryProfile = MemoryProfile.Strong;
    }

    const orderCount = settings.cipherOrders.length;
    if (orderCount <= 1) {
      selectedCipherMode = CipherMode.Basic;
    } else if (orderCount <= 2) {
      selectedCipherMode = CipherMode.Enhanced;
    } else {
      selectedCipherMode = CipherMode.QuantumResistant;
    }
  });
</script>

<div class="cipher-options-content">
  <div class="options-section">
    <h3 class="section-title">{$_('modals.cipher.encryptionTitle')}</h3>
    <RadioOption
      options={cipherOptions}
      bind:selected={selectedCipherMode}
      name="cipher"
      onSelect={handleCipherChange}
    />
  </div>

  <div class="options-section">
    <h3 class="section-title">{$_('modals.cipher.memoryTitle')}</h3>
    <RadioOption
      options={memoryProfiles}
      bind:selected={selectedMemoryProfile}
      name="memory"
      onSelect={handleMemoryChange}
    />
  </div>

  <div class="options-section">
    <SmartInput
      label={$_('modals.cipher.secretLabel')}
      placeholder={$_('modals.cipher.secretPlaceholder')}
      bind:value={settings.hashFnParams.secret}
      onInput={handleSecretChange}
      showToggle={false}
    />
  </div>
</div>

<style lang="scss">
  .cipher-options-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .options-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .section-title {
    font-size: var(--font-size-large);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  @media (max-width: 480px) {
    .cipher-options-content {
      gap: 20px;
    }

    .options-section {
      gap: 12px;
    }
  }

  @media (max-width: 360px) {
    .cipher-options-content {
      gap: 16px;
    }
  }
</style>
