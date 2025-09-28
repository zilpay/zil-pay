<script lang="ts">
    import type { IWalletSettingsState, IWalletHashParams } from 'background/storage';
    import { CipherOrders } from 'crypto/keychain';
    import { HashTypes } from 'background/storage/argon';
    import { ShaAlgorithms } from 'config/pbkdf2';
    import { _ } from '../i18n';
    import RadioOption, { type OptionData } from '../components/RadioOption.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import Dropdown, { type DropdownOption } from '../components/Dropdown.svelte';
    import Button from '../components/Button.svelte';
    import DownIcon from '../components/icons/Down.svelte';

    let {
        walletSettings,
        onchange,
        onSave = () => {},
        onReset = () => {}
    }: {
        walletSettings: IWalletSettingsState;
        onchange: (settings: IWalletSettingsState) => void;
        onSave?: () => void;
        onReset?: () => void;
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

    let advancedMode = $state(false);
    let selectedCipherPreset = $state(CipherPreset.QuantumResistant);
    let selectedMemoryPreset = $state(MemoryPreset.Medium);

    const cipherPresets = $derived<OptionData<CipherPreset>[]>([
        {
            value: CipherPreset.Basic,
            title: $_('modals.cryptsetup.cipherPresets.basic.title'),
            subtitle: $_('modals.cryptsetup.cipherPresets.basic.subtitle'),
            description: $_('modals.cryptsetup.cipherPresets.basic.description')
        },
        {
            value: CipherPreset.Enhanced,
            title: $_('modals.cryptsetup.cipherPresets.enhanced.title'),
            subtitle: $_('modals.cryptsetup.cipherPresets.enhanced.subtitle'),
            description: $_('modals.cryptsetup.cipherPresets.enhanced.description')
        },
        {
            value: CipherPreset.QuantumResistant,
            title: $_('modals.cryptsetup.cipherPresets.quantumResistant.title'),
            subtitle: $_('modals.cryptsetup.cipherPresets.quantumResistant.subtitle'),
            description: $_('modals.cryptsetup.cipherPresets.quantumResistant.description')
        }
    ]);

    const memoryPresets = $derived<OptionData<MemoryPreset>[]>([
        {
            value: MemoryPreset.Low,
            title: $_('modals.cryptsetup.memoryPresets.low.title'),
            subtitle: $_('modals.cryptsetup.memoryPresets.low.subtitle'),
            description: $_('modals.cryptsetup.memoryPresets.low.description')
        },
        {
            value: MemoryPreset.Medium,
            title: $_('modals.cryptsetup.memoryPresets.medium.title'),
            subtitle: $_('modals.cryptsetup.memoryPresets.medium.subtitle'),
            description: $_('modals.cryptsetup.memoryPresets.medium.description')
        },
        {
            value: MemoryPreset.Secure,
            title: $_('modals.cryptsetup.memoryPresets.secure.title'),
            subtitle: $_('modals.cryptsetup.memoryPresets.secure.subtitle'),
            description: $_('modals.cryptsetup.memoryPresets.secure.description')
        }
    ]);

    const hashTypeOptions: DropdownOption[] = [
        { code: String(HashTypes.Argon2), label: 'Argon2id' },
        { code: String(HashTypes.Pbkdf2), label: 'PBKDF2' }
    ];

    const hashSizeOptions: DropdownOption[] = [
        { code: ShaAlgorithms.sha256, label: ShaAlgorithms.sha256 },
        { code: ShaAlgorithms.Sha512, label: ShaAlgorithms.Sha512 }
    ];

    const presetToCipherOrders: Record<CipherPreset, CipherOrders[]> = {
        [CipherPreset.Basic]: [CipherOrders.AESGCM256],
        [CipherPreset.Enhanced]: [CipherOrders.AESGCM256, CipherOrders.KUZNECHIK],
        [CipherPreset.QuantumResistant]: [
            CipherOrders.AESGCM256,
            CipherOrders.KUZNECHIK,
            CipherOrders.NTRUP761
        ]
    };

    const memoryPresetValues: Record<MemoryPreset, Partial<IWalletHashParams>> = {
        [MemoryPreset.Low]: { memory: 64, iterations: 3, threads: 1 },
        [MemoryPreset.Medium]: { memory: 650, iterations: 2, threads: 2 },
        [MemoryPreset.Secure]: { memory: 65536, iterations: 3, threads: 4 }
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
        if (
            JSON.stringify(orders) === JSON.stringify(presetToCipherOrders[CipherPreset.Basic].sort())
        ) {
            selectedCipherPreset = CipherPreset.Basic;
        } else if (
            JSON.stringify(orders) ===
            JSON.stringify(presetToCipherOrders[CipherPreset.Enhanced].sort())
        ) {
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

<div class="crypt-setup-container">
    <div class="main-content">
        <div class="section">
            <div class="section-header">
                <h3 class="section-title">{$_('modals.cryptsetup.encryption.title')}</h3>
                <p class="section-description">
                    {$_('modals.cryptsetup.encryption.description')}
                </p>
            </div>
            <RadioOption
                options={cipherPresets}
                bind:selected={selectedCipherPreset}
                onSelect={handleCipherPresetChange}
            />
        </div>

        <div class="section">
            <div class="section-header">
                <h3 class="section-title">{$_('modals.cryptsetup.hashing.title')}</h3>
                <p class="section-description">
                    {$_('modals.cryptsetup.hashing.description')}
                </p>
            </div>
            
            <button class="more-options-toggle" onclick={() => (advancedMode = !advancedMode)}>
                <span>{$_('modals.cryptsetup.hashing.advancedMode')}</span>
                <div class="arrow-icon" class:rotated={advancedMode}>
                    <DownIcon />
                </div>
            </button>

            {#if advancedMode}
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
                            <label for="memory-input">{$_('modals.cryptsetup.advanced.memory')}</label>
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
                            <label for="iterations-input">{$_('modals.cryptsetup.advanced.iterations')}</label>
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
                            <label for="threads-input">{$_('modals.cryptsetup.advanced.threads')}</label>
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
            {:else}
                <RadioOption
                    options={memoryPresets}
                    bind:selected={selectedMemoryPreset}
                    onSelect={handleMemoryPresetChange}
                />
            {/if}

            <SmartInput
                label={$_('modals.cryptsetup.advanced.secret.label')}
                placeholder={$_('modals.cryptsetup.advanced.secret.placeholder')}
                value={walletSettings.hashFnParams.secret}
                oninput={(e) => handleHashParamChange('secret', (e.target as HTMLInputElement).value)}
                showToggle={true}
            />
        </div>
    </div>
    
    <div class="footer-actions">
        <Button onclick={onSave}>{$_('modals.cryptsetup.saveButton')}</Button>
        <Button class="secondary" onclick={onReset}>{$_('modals.cryptsetup.resetButton')}</Button>
    </div>
</div>

<style lang="scss">
    .crypt-setup-container {
        display: flex;
        flex-direction: column;
        gap: 32px;
    }

    .main-content {
        display: flex;
        flex-direction: column;
        gap: 32px;
    }

    .section {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .section-header {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .section-title {
        font-size: var(--font-size-large);
        font-weight: 600;
        color: var(--color-content-text-inverted);
        margin: 0;
    }

    .section-description {
        font-size: var(--font-size-medium);
        color: var(--color-content-text-secondary);
        margin: 0;
        line-height: 1.5;
    }

    .more-options-toggle {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-content-text-secondary);
        font-size: var(--font-size-medium);
        font-weight: 500;
        padding: 8px 0;
        align-self: flex-start;
    }
    
    .arrow-icon {
        display: flex;
        align-items: center;
        transition: transform 0.2s ease-in-out;
        &.rotated {
            transform: rotate(180deg);
        }
    }

    .advanced-hash-settings {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        background-color: var(--color-neutral-background-container);
        border: 1px solid var(--color-neutral-border-default);
        border-radius: 12px;
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
            color: var(--color-content-text-secondary);
        }
    }

    .number-input {
        height: 48px;
        padding: 0 16px;
        border: 1px solid var(--color-inputs-border-default);
        border-radius: 12px;
        background-color: var(--color-inputs-background-base);
        color: var(--color-content-text-inverted);
        font-size: var(--font-size-medium);
        font-weight: 500;
        transition: all 0.2s ease;

        &:focus {
            outline: none;
            border-color: var(--color-inputs-border-focus);
        }
    }
    
    .footer-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
</style>

