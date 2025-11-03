<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { _ } from 'popup/i18n';
    import { LEDGER_USB_VENDOR_ID } from 'config/ledger';
    import { cacheStore } from 'popup/store/cache';
    import { push } from 'popup/router/navigation';

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

    type Step = 'searching' | 'devices-found' | 'configuring' | 'accounts-listed';

    interface MockAccount {
        name: string;
        address: string;
    }

    let step: Step = $state('searching');
    let devices = $state<HIDDevice[]>([]);
    let selectedDevice = $state<HIDDevice | null>(null);
    let error = $state<string | null>(null);
    let isLoading = $state(false);

    let accountName = $state('');
    let accountCount = $state(1);
    let isZilliqaLegacy = $state(false);
    let connectedAccounts = $state<MockAccount[]>([]);

    const selectedChain = $derived($cacheStore.chain);
    const isZilliqaChain = $derived(selectedChain?.slip44 == ZILLIQA);
    const isConnectDisabled = $derived(!accountName.trim() || isLoading);

    async function findDevices() {
        isLoading = true;
        error = null;
        try {
            await window.navigator.hid.requestDevice({
                filters: [{ vendorId: LEDGER_USB_VENDOR_ID }]
            });
            const permittedDevices = await window.navigator.hid.getDevices();
            
            const foundDevices = permittedDevices.filter(
                d => d.vendorId === LEDGER_USB_VENDOR_ID
            );

            devices = foundDevices;

            if (devices.length > 0) {
                step = 'devices-found';
            } else {
                error = $_('ledger.errors.no_devices');
            }
        } catch (err) {
            error = String(err);
        } finally {
            isLoading = false;
        }
    }

    function handleDeviceSelect(device: HIDDevice) {
        selectedDevice = device;
        accountName = `${device.productName} ${selectedChain?.name || ''}`;
        step = 'configuring';
    }

    async function handleConnectAccounts() {
        if (isConnectDisabled) return;
        isLoading = true;
        error = null;

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mockAccounts: MockAccount[] = [];
            for (let i = 0; i < accountCount; i++) {
                mockAccounts.push({
                    name: `${accountName} ${i + 1}`,
                    address: `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
                });
            }
            connectedAccounts = mockAccounts;
            step = 'accounts-listed';
        } catch (err) {
            error = String(err);
        } finally {
            isLoading = false;
        }
    }
    
    function resetToDeviceSelection() {
        selectedDevice = null;
        step = 'devices-found';
        error = null;
        accountCount = 1;
        accountName = '';
    }

    $effect(() => {
        const getPermittedDevices = async () => {
            try {
                const permitted = await window.navigator.hid.getDevices();
                const ledgerDevices = permitted.filter(d => d.vendorId === LEDGER_USB_VENDOR_ID);
                if (ledgerDevices.length > 0) {
                    devices = ledgerDevices;
                    step = 'devices-found';
                }
            } catch (err) {
                error = String(err);
            }
        };

        getPermittedDevices();

        if (!$cacheStore.chain) {
            return push("/start");
        }
    });
</script>

<div class="page-container">
    {#if step === 'configuring'}
        <NavBar title={$_('ledger.configure.title')} onback={resetToDeviceSelection} />
    {:else if step === 'accounts-listed'}
        <NavBar title={$_('ledger.accounts.title')} onback={resetToDeviceSelection} />
    {:else}
        <NavBar title={$_('ledger.connect.title')} />
    {/if}

    <main class="content" in:fade>
        {#if error}
            <div class="error-banner" transition:fly={{ y: -20, duration: 300 }}>
                {error}
            </div>
        {/if}

        {#if step === 'searching'}
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

        {:else if step === 'devices-found' && devices.length > 0}
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

        {:else if step === 'configuring' && selectedDevice}
            <div class="step-container" in:fly={{ y: 20 }}>
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
                <Button onclick={handleConnectAccounts} loading={isLoading} disabled={isConnectDisabled}>
                    {$_('ledger.connect.button')}
                </Button>
            </div>

        {:else if step === 'accounts-listed'}
            <div class="step-container" in:fly={{ y: 20 }}>
                <div class="accounts-list-content">
                    {#each connectedAccounts as account (account.address)}
                        <AccountCard name={account.name} address={account.address} onclick={() => {}} />
                    {/each}
                </div>
                <Button onclick={() => push('/')}>
                    {$_('common.done')}
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
        justify-content: space-between;
        gap: 24px;
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

    .configuration-box {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px;
        background: var(--color-cards-regular-base-default);
        border: 1px solid var(--color-cards-regular-border-default);
        border-radius: 16px;
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

    .accounts-list-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
    }
</style>
