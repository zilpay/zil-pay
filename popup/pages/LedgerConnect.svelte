<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { _ } from 'popup/i18n';
    import { LEDGER_USB_VENDOR_ID } from 'config/ledger';
    import { cacheStore } from 'popup/store/cache';
    import { push } from 'popup/router/navigation';
    import { ScillaLedgerInterface } from 'ledger/scilla';
    import { EthLedgerInterface } from 'ledger/eth';
    import TransportWebHID from 'ledger/webhid';
    import TransportWebBLE from 'ledger/webble';
    import type { LedgerPublicAddress } from 'types/ledger';

    import NavBar from '../components/NavBar.svelte';
    import Button from '../components/Button.svelte';
    import LedgerIcon from '../components/icons/Ledger.svelte';
    import RefreshIcon from '../components/icons/Refresh.svelte';
    import OptionCard from '../components/OptionCard.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import Counter from '../components/Counter.svelte';
    import AccountCard from '../components/AccountCard.svelte';
    import { ETHEREUM } from 'config/slip44';
    import { walletFromLedger } from 'popup/background/wallet';
    import { GasSpeed } from 'config/gas';
    import { RatesApiOptions } from 'config/api';
    import { ShaAlgorithms } from 'config/pbkdf2';
    import { HashTypes } from 'config/argon2';
    import type { IWalletSettingsState } from 'background/storage';

    const STEP_DEVICES_FOUND = 0;
    const STEP_CONFIGURING = 1;

    interface Device {
        id: string;
        name: string;
        type: 'usb' | 'bluetooth';
        raw: HIDDevice | BluetoothDevice;
    }

    let walletSettings = $state<IWalletSettingsState>({
        cipherOrders: [],
        hashFnParams: {
            memory: 6553,
            threads: 4,
            secret: "",
            iterations: 3,
            hashType: HashTypes.Argon2,
            hashSize: ShaAlgorithms.Sha512,
        },
        currencyConvert: "BTC",
        ensEnabled: true,
        tokensListFetcher: true,
        ratesApiOptions: RatesApiOptions.CoinGecko,
        sessionTime: 0,
        gasOption: GasSpeed.Market,
    });
    let step = $state(STEP_DEVICES_FOUND);
    let usbDevices = $state<Device[]>([]);
    let bleDevices = $state<Device[]>([]);
    let selectedDevice = $state<Device | null>(null);
    let error = $state<string | null>(null);
    let isLoadingUsb = $state(false);
    let isLoadingBle = $state(false);
    let isConnecting = $state(false);
    let ledgerTransport = $state<TransportWebHID | TransportWebBLE | null>(null);
    let ledgerInterface = $state<ScillaLedgerInterface | EthLedgerInterface | null>(null);
    let bleSupported = $state(false);
    let usbSupported = $state(false);

    let walletName = $state('');
    let accountCount = $state(1);
    let connectedAccounts = $state<LedgerPublicAddress[]>([]);

    const selectedChain = $derived($cacheStore.chain);
    const isConnectDisabled = $derived(!walletName.trim() || isConnecting);
    const hasAccounts = $derived(connectedAccounts.length > 0);
    const allDevices = $derived([...usbDevices, ...bleDevices]);
    const isLoading = $derived(isLoadingUsb || isLoadingBle);

    async function checkSupport() {
        try {
            const [ble, usb] = await Promise.all([
                TransportWebBLE.isSupported(),
                TransportWebHID.isSupported()
            ]);
            bleSupported = ble;
            usbSupported = usb;
            console.log('[LEDGER-CONNECT:checkSupport]', { bleSupported: ble, usbSupported: usb });
        } catch(err) {
            console.error('[LEDGER-CONNECT:checkSupport] Error checking transport support', err);
            error = String(err);
        }
    }

    async function findUSBDevices() {
        if (!usbSupported) return;
        isLoadingUsb = true;
        error = null;
        console.log('[LEDGER-CONNECT:findUSBDevices] Starting USB device search...');

        try {
            await window.navigator.hid.requestDevice({
                filters: [{ vendorId: LEDGER_USB_VENDOR_ID }]
            });
            const permitted = await window.navigator.hid.getDevices();
            const ledgers = permitted.filter(d => d.vendorId === LEDGER_USB_VENDOR_ID);
            console.log(`[LEDGER-CONNECT:findUSBDevices] Found ${ledgers.length} permitted Ledger devices.`);
            
            usbDevices = ledgers.map(d => ({
                id: `usb-${d.productId}`,
                name: d.productName || 'Ledger Device',
                type: 'usb' as const,
                raw: d
            }));
        } catch (err: any) {
            if (!err.message?.includes('cancel')) {
                console.error('[LEDGER-CONNECT:findUSBDevices] Error finding USB devices', err);
                error = String(err);
            } else {
                console.log('[LEDGER-CONNECT:findUSBDevices] USB device request canceled by user.');
            }
        } finally {
            isLoadingUsb = false;
        }
    }

    async function findBLEDevices() {
        if (!bleSupported) return;
        isLoadingBle = true;
        error = null;
        console.log('[LEDGER-CONNECT:findBLEDevices] Starting BLE device search...');

        try {
            const devices: Device[] = await new Promise((resolve) => {
                const found: Device[] = [];
                TransportWebBLE.listen({
                    next: (event) => {
                        if (event.type === 'add') {
                            const device = event.descriptor as BluetoothDevice;
                            found.push({
                                id: `ble-${device.id}`,
                                name: device.name || 'Ledger Bluetooth',
                                type: 'bluetooth',
                                raw: device
                            });
                        }
                    },
                    error: (err) => {
                        console.error('[LEDGER-CONNECT:findBLEDevices] BLE listen error', err);
                        resolve([]);
                    },
                    complete: () => resolve(found)
                });
            });
            console.log(`[LEDGER-CONNECT:findBLEDevices] Found ${devices.length} BLE devices.`);
            bleDevices = devices;
        } catch (err: any) {
            if (!err.message?.includes('cancel')) {
                console.error('[LEDGER-CONNECT:findBLEDevices] Error finding BLE devices', err);
                error = String(err);
            } else {
                console.log('[LEDGER-CONNECT:findBLEDevices] BLE device request canceled by user.');
            }
        } finally {
            isLoadingBle = false;
        }
    }

    async function handleDeviceSelect(device: Device) {
        selectedDevice = device;
        walletName = `${device.name} ${selectedChain?.name || ''}`;
        error = null;
        isConnecting = true;
        console.log('[LEDGER-CONNECT:handleDeviceSelect] Selecting device:', { id: device.id, type: device.type });

        let tempTransport: TransportWebHID | TransportWebBLE | null = null;

        try {
            if (device.type === 'usb') {
                tempTransport = await TransportWebHID.openDevice(device.raw as HIDDevice);
            } else {
                tempTransport = await TransportWebBLE.create();
            }
            console.log('[LEDGER-CONNECT:handleDeviceSelect] Transport created.');

            let determinedInterface: ScillaLedgerInterface | EthLedgerInterface | null = null;

            try {
                console.log('[LEDGER-CONNECT:handleDeviceSelect] Attempt 1: Connecting to Zilliqa (Scilla) app...');
                const scillaInterface = new ScillaLedgerInterface(tempTransport);
                const scillaVersion = await scillaInterface.getVersion();
                determinedInterface = scillaInterface;
                console.log('[LEDGER-CONNECT:handleDeviceSelect] Success: Zilliqa (Scilla) app', scillaVersion);
            } catch (scillaError: any) {
                console.warn('[LEDGER-CONNECT:handleDeviceSelect] Attempt 1 Failed: Scilla app not responsive.', scillaError);

                try {
                    console.log('[LEDGER-CONNECT:handleDeviceSelect] Attempt 2: Connecting to Ethereum app...');
                    const ethInterface = new EthLedgerInterface(tempTransport);
                    await ethInterface.getAppConfiguration();
                    determinedInterface = ethInterface;
                    console.log('[LEDGER-CONNECT:handleDeviceSelect] Success: Ethereum app detected.');
                } catch (ethError: any) {
                    console.error('[LEDGER-CONNECT:handleDeviceSelect] Attempt 2 Failed: ETH app also not responsive.', ethError);
                    throw new Error($_('ledger.errors.app_not_open_generic'));
                }
            }
            
            ledgerTransport = tempTransport;
            ledgerInterface = determinedInterface;
            step = STEP_CONFIGURING;

        } catch (err: any) {
            console.error('[LEDGER-CONNECT:handleDeviceSelect] Overall connection process failed.', { device: device.id, error: err });
            
            if (err?.message?.includes('0x5515')) {
                error = $_('ledger.errors.device_locked');
            } else {
                error = err.message || $_('ledger.errors.connection_failed');
            }

            if (tempTransport) {
                try {
                    await tempTransport.close();
                } catch (closeErr) {
                    console.error('[LEDGER-CONNECT:handleDeviceSelect] Error closing transport after failure.', closeErr);
                }
            }
            ledgerTransport = null;
            ledgerInterface = null;
            selectedDevice = null;

        } finally {
            isConnecting = false;
        }
    }

    async function handleConnectAccounts() {
        if (isConnectDisabled || !ledgerInterface) return;
        isConnecting = true;
        error = null;
        console.log('[LEDGER-CONNECT:handleConnectAccounts] Connecting accounts...', { count: accountCount });

        try {
            const accounts: LedgerPublicAddress[] = [];
            
            for (let i = 0; i < accountCount; i++) {
                let ledgerAccount: LedgerPublicAddress;

                if (ledgerInterface instanceof EthLedgerInterface && selectedChain) {
                    const path = `44'/${ETHEREUM}'/0'/0/${i}`;
                    console.log(`[LEDGER-CONNECT:handleConnectAccounts] Getting ETH address for path: ${path}`);
                    ledgerAccount = await ledgerInterface.getAddress(path);
                } else if (ledgerInterface instanceof ScillaLedgerInterface) {
                    console.log(`[LEDGER-CONNECT:handleConnectAccounts] Getting Scilla address for index: ${i}`);
                    ledgerAccount = await ledgerInterface.getPublicAddress(i);
                } else {
                    console.warn('[LEDGER-CONNECT:handleConnectAccounts] Skipping account connection due to invalid ledger interface', { index: i });
                    continue;
                }

                accounts.push({
                    ...ledgerAccount,
                    name: `${selectedDevice?.name} ${i + 1}`,
                    index: i
                });
            }
            console.log('[LEDGER-CONNECT:handleConnectAccounts] Successfully fetched accounts:', accounts.map(a => a.pubAddr));
            connectedAccounts = accounts;
        } catch (err: any) {
            console.error('[LEDGER-CONNECT:handleConnectAccounts] Error connecting accounts', { count: accountCount, error: err });
            if (err instanceof Error) {
                if (err.message.includes('0x6985')) {
                    error = $_('ledger.errors.user_rejected');
                } else if (err.message.includes('0x6e00') || err.message.includes('0x6d00')) {
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
            isConnecting = false;
        }
    }
    
    async function resetToDeviceSelection() {
        if (ledgerTransport) {
            try {
                await ledgerTransport.close();
                console.log('[LEDGER-CONNECT:resetToDeviceSelection] Transport closed.');
            } catch (err){
                console.error('[LEDGER-CONNECT:resetToDeviceSelection] Error closing transport', err);
            }
        }
        
        ledgerTransport = null;
        ledgerInterface = null;
        selectedDevice = null;
        step = STEP_DEVICES_FOUND;
        error = null;
        accountCount = 1;
        walletName = '';
        connectedAccounts = [];
    }

    async function handleDone() {
        if (ledgerTransport) {
            try {
                await ledgerTransport.close();
                await walletFromLedger({
                    walletName,
                    accounts: connectedAccounts,
                    chain: selectedChain!,
                    settings: walletSettings,
                });
                console.log('[LEDGER-CONNECT:handleDone] Wallet created from Ledger.');
            } catch (err) {
                console.error('[LEDGER-CONNECT:handleDone] Error finalizing wallet creation', err);
                error = String(err);
                return;
            }
        }
        push('/');
    }

    $effect(() => {
        if (!$cacheStore.chain) {
            console.warn('[LEDGER-CONNECT:init] No chain in cacheStore, redirecting to /start');
            return push("/start");
        }

        checkSupport().then(async () => {
            if (usbSupported) {
                try {
                    const permitted = await window.navigator.hid.getDevices();
                    const ledgers = permitted.filter(d => d.vendorId === LEDGER_USB_VENDOR_ID);
                    if (ledgers.length > 0) {
                        usbDevices = ledgers.map(d => ({
                            id: `usb-${d.productId}`,
                            name: d.productName || 'Ledger Device',
                            type: 'usb' as const,
                            raw: d
                        }));
                    }
                } catch (err) {
                    console.error('[LEDGER-CONNECT:init] Error getting permitted HID devices', err);
                }
            }
        });

        return () => {
            if (ledgerTransport) {
                ledgerTransport.close().catch((err) => {
                    console.error('[LEDGER-CONNECT:cleanup] Error closing transport on component destroy', err);
                });
            }
        };
    });

    function hanldeCounterChange(_: number) {
        if (connectedAccounts.length > 0) {
            connectedAccounts = [];
        }
    }
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

        {#if step === STEP_DEVICES_FOUND}
            <div class="step-container" in:fly={{ y: 20 }}>
                {#if allDevices.length === 0 && !isLoading}
                    <div class="centered-content">
                        <div class="icon-wrapper">
                            <LedgerIcon />
                        </div>
                        <h2 class="step-title">{$_('ledger.noDevices.title')}</h2>
                        <p class="step-description">{$_('ledger.noDevices.description')}</p>
                    </div>
                {/if}

                <div class="device-list">
                    {#if usbSupported}
                        <div class="device-category">
                            <div class="category-header">
                                <h3 class="category-title">USB</h3>
                                <button 
                                    class="icon-button" 
                                    onclick={findUSBDevices} 
                                    disabled={isLoadingUsb}
                                >
                                    <RefreshIcon />
                                </button>
                            </div>
                            {#if usbDevices.length > 0}
                                {#each usbDevices as device (device.id)}
                                    <OptionCard
                                        title={device.name}
                                        description={$_('ledger.vendorId') + `: 0x${(device.raw as HIDDevice).vendorId.toString(16)}`}
                                        icon={LedgerIcon as any}
                                        showArrow={true}
                                        onclick={() => handleDeviceSelect(device)}
                                    />
                                {/each}
                            {:else if !isLoadingUsb}
                                <p class="empty-message">{$_('ledger.noUsbDevices')}</p>
                            {/if}
                        </div>
                    {/if}

                    {#if bleSupported}
                        <div class="device-category">
                            <div class="category-header">
                                <h3 class="category-title">Bluetooth</h3>
                                <button 
                                    class="icon-button" 
                                    onclick={findBLEDevices} 
                                    disabled={isLoadingBle}
                                >
                                    <RefreshIcon />
                                </button>
                            </div>
                            {#if bleDevices.length > 0}
                                {#each bleDevices as device (device.id)}
                                    <OptionCard
                                        title={device.name}
                                        description="Bluetooth"
                                        icon={LedgerIcon as any}
                                        showArrow={true}
                                        onclick={() => handleDeviceSelect(device)}
                                    />
                                {/each}
                            {:else if !isLoadingBle}
                                <p class="empty-message">{$_('ledger.noBleDevices')}</p>
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>

        {:else if step === STEP_CONFIGURING && selectedDevice}
            <div class="step-container" in:fly={{ y: 20 }}>
                <div class="form-wrapper">
                    <div class="configuration-box">
                        <SmartInput
                            bind:value={walletName}
                            label={$_('ledger.accountName.label')}
                            placeholder={$_('ledger.accountName.placeholder')}
                            hide={false}
                            showToggle={false}
                        />
                        <div class="counter-row">
                            <span class="counter-label">{$_('ledger.accountCount.label')}</span>
                            <Counter
                                bind:value={accountCount}
                                title=""
                                min={1}
                                max={255}
                                onInput={hanldeCounterChange}
                            />
                        </div>
                    </div>

                    {#if hasAccounts}
                        <div class="accounts-section">
                            <h3 class="accounts-title">{$_('ledger.accounts.title')}</h3>
                            <div class="accounts-list">
                                {#each connectedAccounts as account (account.pubAddr)}
                                    <AccountCard 
                                        name={account.name} 
                                        address={account.pubAddr} 
                                        onclick={() => {}} 
                                    />
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>

                <Button 
                    onclick={hasAccounts ? handleDone : handleConnectAccounts} 
                    loading={isConnecting} 
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
    
    .device-list {
        display: flex;
        flex-direction: column;
        gap: 24px;
        overflow-y: auto;
        flex: 1;
    }

    .device-category {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .category-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .category-title {
        font-size: var(--font-size-medium);
        font-weight: 600;
        color: var(--color-content-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
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
        
        &:hover:not(:disabled) {
            background-color: var(--color-button-regular-quaternary-hover);
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        :global(svg) {
            width: 24px;
            height: 24px;
        }
    }

    .empty-message {
        font-size: var(--font-size-medium);
        color: var(--color-content-text-secondary);
        padding: 12px;
        text-align: center;
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
