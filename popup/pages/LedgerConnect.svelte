<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { _ } from 'popup/i18n';
    import { LEDGER_USB_VENDOR_ID } from 'config/ledger';
    import { cacheStore } from 'popup/store/cache';
    import { push } from 'popup/router/navigation';
    import { ScillaLedgerInterface } from 'ledger/scilla';
    import TransportWebHID from 'ledger/webhid';
    import type { LedgerPublicAddress } from 'types/ledger';

    import NavBar from '../components/NavBar.svelte';
    import Button from '../components/Button.svelte';
    import LedgerIcon from '../components/icons/Ledger.svelte';
    import RefreshIcon from '../components/icons/Refresh.svelte';
    import OptionCard from '../components/OptionCard.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import Counter from '../components/Counter.svelte';
    import Switch from '../components/Switch.svelte';
    import AccountCard from '../components/AccountCard.svelte';
    import { ZILLIQA } from 'config/slip44';

    const STEP_SEARCHING = 0;
    const STEP_DEVICES_FOUND = 1;
    const STEP_CONFIGURING = 2;

    interface Account {
        name: string;
        address: string;
        publicKey: string;
        index: number;
    }

    let step = $state(STEP_SEARCHING);
    let devices = $state<HIDDevice[]>([]);
    let selectedDevice = $state<HIDDevice | null>(null);
    let error = $state<string | null>(null);
    let isLoading = $state(false);
    let ledgerTransport = $state<TransportWebHID | null>(null);
    let ledgerInterface = $state<ScillaLedgerInterface | null>(null);

    let accountName = $state('');
    let accountCount = $state(1);
    let isZilliqaLegacy = $state(false);
    let connectedAccounts = $state<Account[]>([]);

    const selectedChain = $derived($cacheStore.chain);
    const isZilliqaChain = $derived(selectedChain?.slip44 === ZILLIQA);
    const isConnectDisabled = $derived(!accountName.trim() || isLoading);
    const hasAccounts = $derived(connectedAccounts.length > 0);

    async function findDevices() {
        isLoading = true;
        error = null;
        try {
            await window.navigator.hid.requestDevice({
                filters: [{ vendorId: LEDGER_USB_VENDOR_ID }]
            });
            const permittedDevices = await window.navigator.hid.getDevices();
            
            devices = permittedDevices.filter(d => d.vendorId === LEDGER_USB_VENDOR_ID);

            if (devices.length > 0) {
                step = STEP_DEVICES_FOUND;
            } else {
                error = $_('ledger.errors.no_devices');
            }
        } catch (err) {
            error = String(err);
        } finally {
            isLoading = false;
        }
    }

    async function handleDeviceSelect(device: HIDDevice) {
        selectedDevice = device;
        accountName = `${device.productName} ${selectedChain?.name || ''}`;
        error = null;
        isLoading = true;

        try {
            ledgerTransport = await TransportWebHID.create();
            ledgerInterface = new ScillaLedgerInterface(ledgerTransport);

            const versionInfo = await ledgerInterface.getVersion();
            console.log('Ledger app version:', versionInfo.version);

            step = STEP_CONFIGURING;
        } catch (err) {
            console.error(err);
            error = String(err);
            ledgerTransport = null;
            ledgerInterface = null;
        } finally {
            isLoading = false;
        }
    }

    async function handleConnectAccounts() {
        if (isConnectDisabled || !ledgerInterface) return;
        isLoading = true;
        error = null;

        try {
            const accounts: Account[] = [];
            
            for (let i = 0; i < accountCount; i++) {
                const result: LedgerPublicAddress = await ledgerInterface.getPublicAddress(i);
                
                accounts.push({
                    name: `${accountName} ${i + 1}`,
                    address: result.pubAddr,
                    publicKey: result.publicKey,
                    index: i
                });
            }
            
            connectedAccounts = accounts;
        } catch (err) {
            if (err instanceof Error) {
                if (err.message.includes('0x6985')) {
                    error = $_('ledger.errors.user_rejected');
                } else if (err.message.includes('0x6e00')) {
                    error = $_('ledger.errors.app_not_open');
                } else if (err.message.includes('0x5515')) {
                    error = $_('ledger.errors.device_locked');
                } else {
                    error = err.message;
                }
            } else {
                error = String(err);
            }
        } finally {
            isLoading = false;
        }
    }
    
    async function resetToDeviceSelection() {
        if (ledgerTransport) {
            try {
                await ledgerTransport.close();
            } catch (err) {
                console.error('Error closing transport:', err);
            }
        }
        
        ledgerTransport = null;
        ledgerInterface = null;
        selectedDevice = null;
        step = STEP_DEVICES_FOUND;
        error = null;
        accountCount = 1;
        accountName = '';
        connectedAccounts = [];
    }

    async function handleDone() {
        if (ledgerTransport) {
            try {
                await ledgerTransport.close();
            } catch (err) {
                console.error('Error closing transport:', err);
            }
        }
        push('/');
    }

    $effect(() => {
        const getPermittedDevices = async () => {
            try {
                const permitted = await window.navigator.hid.getDevices();
                const ledgerDevices = permitted.filter(d => d.vendorId === LEDGER_USB_VENDOR_ID);
                if (ledgerDevices.length > 0) {
                    devices = ledgerDevices;
                    step = STEP_DEVICES_FOUND;
                }
            } catch (err) {
                error = String(err);
            }
        };

        getPermittedDevices();

        if (!$cacheStore.chain) {
            return push("/start");
        }

        return () => {
            if (ledgerTransport) {
                ledgerTransport.close().catch(console.error);
            }
        };
    });
</script>

<div class="page-container">
    {#if step === STEP_CONFIGURING}
        <NavBar title={$_('ledger.configure.title')} onback={resetToDeviceSelection} />
    {:else}
        <NavBar title={$_('ledger.connect.title')} />
    {/if}

    <main class="content" in:fade>
        {#if error}
            <div class="error-banner" transition:fly={{ y: -20, duration: 300 }}>
                {error}
            </div>
        {/if}

        {#if step === STEP_SEARCHING}
            <div class="step-container" in:fly={{ y: 20 }}>
                <div class="centered-content">
                    <div class="icon-wrapper">
                        <LedgerIcon />
                    </div>
                    <h2 class="step-title">{$_('ledger.search.title')}</h2>
                    <p class="step-description">{$_('ledger.search.description')}</p>
                </div>
                <Button onclick={findDevices} loading={isLoading} disabled={isLoading}>
                    {$_('ledger.search.button')}
                </Button>
            </div>

        {:else if step === STEP_DEVICES_FOUND && devices.length > 0}
            <div class="step-container" in:fly={{ y: 20 }}>
                <div class="header-with-action">
                    <h2 class="list-title">{$_('ledger.found.title', { values: { count: devices.length } })}</h2>
                    <button class="icon-button" onclick={findDevices} disabled={isLoading}>
                        <RefreshIcon />
                    </button>
                </div>
                <div class="device-list">
                    {#each devices as device (device.productId)}
                        <OptionCard
                            title={device.productName}
                            description={$_('ledger.vendorId') + `: 0x${device.vendorId.toString(16)}`}
                            icon={LedgerIcon as any}
                            showArrow={true}
                            onclick={() => handleDeviceSelect(device)}
                        />
                    {/each}
                </div>
            </div>

        {:else if step === STEP_CONFIGURING && selectedDevice}
            <div class="step-container" in:fly={{ y: 20 }}>
                <div class="form-wrapper">
                    <div class="configuration-box">
                        <SmartInput
                            bind:value={accountName}
                            label={$_('ledger.accountName.label')}
                            placeholder={$_('ledger.accountName.placeholder')}
                            hide={false}
                            showToggle={false}
                        />

                        {#if isZilliqaChain}
                            <div class="setting-row">
                                <span class="setting-label">{$_('ledger.zilliqaLegacy.label')}</span>
                                <Switch bind:checked={isZilliqaLegacy} variant="default" />
                            </div>
                        {/if}

                        <div class="counter-row">
                            <span class="counter-label">{$_('ledger.accountCount.label')}</span>
                            <Counter
                                bind:value={accountCount}
                                title=""
                                min={1}
                                max={255}
                            />
                        </div>
                    </div>

                    {#if hasAccounts}
                        <div class="accounts-section">
                            <h3 class="accounts-title">{$_('ledger.accounts.title')}</h3>
                            <div class="accounts-list">
                                {#each connectedAccounts as account (account.address)}
                                    <AccountCard 
                                        name={account.name} 
                                        address={account.address} 
                                        onclick={() => {}} 
                                    />
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>

                <Button 
                    onclick={hasAccounts ? handleDone : handleConnectAccounts} 
                    loading={isLoading} 
                    disabled={isConnectDisabled}
                >
                    {hasAccounts ? $_('common.done') : $_('ledger.connect.button')}
                </Button>
            </div>
        {/if}
    </main>
</div>

<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: var(--color-neutral-background-base);
        padding: 0 var(--padding-side);
        box-sizing: border-box;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 24px 0;
        min-height: 0;
    }

    .step-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 24px;
        min-height: 0;
    }

    .centered-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 16px;
        margin: auto 0;
    }

    .icon-wrapper {
        :global(svg) {
            width: 64px;
            height: 64px;
            fill: var(--color-content-text-secondary);
        }
    }

    .step-title {
        font-size: var(--font-size-xl);
        font-weight: 600;
        color: var(--color-content-text-inverted);
    }

    .step-description {
        font-size: var(--font-size-large);
        color: var(--color-content-text-secondary);
        max-width: 300px;
    }

    .error-banner {
        padding: 12px;
        background: var(--color-error-background);
        border-radius: 8px;
        color: var(--color-error-text);
        font-size: var(--font-size-medium);
        text-align: center;
        margin-bottom: 16px;
        flex-shrink: 0;
    }
    
    .header-with-action {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .list-title {
        font-size: var(--font-size-large);
        font-weight: 600;
        color: var(--color-content-text-inverted);
    }
    
    .icon-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
        color: var(--color-content-icon-secondary);
        transition: background-color 0.2s;
        
        &:hover {
            background-color: var(--color-button-regular-quaternary-hover);
        }

        :global(svg) {
            width: 24px;
            height: 24px;
        }
    }
    
    .device-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
        flex: 1;
    }

    .form-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-height: 0;
        overflow: hidden;
    }

    .configuration-box {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px;
        background: var(--color-cards-regular-base-default);
        border: 1px solid var(--color-cards-regular-border-default);
        border-radius: 16px;
        flex-shrink: 0;
    }
    
    .setting-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--color-neutral-border-default);
    }

    .setting-label {
        font-size: var(--font-size-large);
        font-weight: 500;
        color: var(--color-content-text-inverted);
    }

    .counter-row {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .counter-label {
        font-size: var(--font-size-large);
        font-weight: 600;
        color: var(--color-content-text-inverted);
    }

    .accounts-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 0;
        overflow-y: auto;
    }

    .accounts-title {
        font-size: var(--font-size-large);
        font-weight: 600;
        color: var(--color-content-text-inverted);
        margin: 0;
        flex-shrink: 0;
        position: sticky;
        top: 0;
        background: var(--color-neutral-background-base);
        padding-bottom: 4px;
        z-index: 1;
    }

    .accounts-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
</style>
