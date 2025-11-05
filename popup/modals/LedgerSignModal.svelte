<script lang="ts">
    import { _ } from 'popup/i18n';
    import { ledgerController, type LedgerDevice } from 'ledger/controller';
    
    import Button from '../components/Button.svelte';
    import OptionCard from '../components/OptionCard.svelte';
    import LedgerIcon from '../components/icons/Ledger.svelte';
    import RefreshIcon from '../components/icons/Refresh.svelte';
    import Modal from '../components/Modal.svelte';
    import type { IChainConfigState } from 'background/storage';

    let {
        show = $bindable(false),
        chain,
        accountIndex,
        signFunction,
        onSuccess,
        onError,
        onCancel = () => null,
    }: {
        show: boolean;
        chain: IChainConfigState;
        accountIndex: number;
        signFunction: (index: number) => Promise<string>;
        onSuccess: (signature: string) => void;
        onCancel?: () => void;
        onError: (error: string) => void;
    } = $props();

    let usbDevices = $state<LedgerDevice[]>([]);
    let bleDevices = $state<LedgerDevice[]>([]);
    let error = $state<string | null>(null);
    let isLoadingUsb = $state(false);
    let isLoadingBle = $state(false);
    let isSigning = $state(false);
    let bleSupported = $state(false);
    let usbSupported = $state(false);

    const allDevices = $derived([...usbDevices, ...bleDevices]);

    async function init() {
        try {
            const support = await ledgerController.checkSupport();
            bleSupported = support.ble;
            usbSupported = support.usb;

            if (usbSupported) {
                const devices = await ledgerController.getPermittedUSBDevices();
                if (devices.length > 0) {
                    usbDevices = devices;
                }
            }
        } catch (err) {
            error = String(err);
        }
    }

    async function findUSBDevices() {
        if (!usbSupported) return;
        isLoadingUsb = true;
        error = null;

        try {
            usbDevices = await ledgerController.findUSBDevices();
        } catch (err: unknown) {
            error = String(err);
        } finally {
            isLoadingUsb = false;
        }
    }

    async function findBLEDevices() {
        if (!bleSupported) return;
        isLoadingBle = true;
        error = null;

        try {
            bleDevices = await ledgerController.findBLEDevices();
        } catch (err: unknown) {
            error = String(err);
        } finally {
            isLoadingBle = false;
        }
    }

    async function handleDeviceSelect(device: LedgerDevice) {
        if (!chain) return;
        
        error = null;
        isSigning = true;

        try {
            await ledgerController.connect(device, chain);
            const signature = await signFunction(accountIndex);
            onSuccess(signature);
            show = false;
        } catch (err: unknown) {
            const errMsg = String(err);
            error = errMsg;
            onError(errMsg);
        } finally {
            isSigning = false;
        }
    }

    function handleClose() {
        if (!isSigning) {
            show = false;
            onCancel();
        }
    }

    $effect(() => {
        if (show) {
            init();
        }
    });
</script>

<Modal bind:show onClose={handleClose}>
    <div class="modal-content">
        <h2 class="modal-title">{$_('ledger.connect.title')}</h2>

        {#if error}
            <div class="error-banner">
                {error}
            </div>
        {/if}

        {#if allDevices.length === 0 && !isLoadingUsb && !isLoadingBle}
            <div class="empty-state">
                <div class="icon-wrapper">
                    <LedgerIcon />
                </div>
                <p class="empty-text">{$_('ledger.noDevices.description')}</p>
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
                            disabled={isLoadingUsb || isSigning}
                        >
                            <RefreshIcon />
                        </button>
                    </div>
                    {#if usbDevices.length > 0}
                        {#each usbDevices as device (device.id)}
                            <OptionCard
                                title={device.name}
                                description="USB Device"
                                icon={LedgerIcon as any}
                                showArrow={true}
                                disabled={isSigning}
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
                            disabled={isLoadingBle || isSigning}
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
                                disabled={isSigning}
                                onclick={() => handleDeviceSelect(device)}
                            />
                        {/each}
                    {:else if !isLoadingBle}
                        <p class="empty-message">{$_('ledger.noBleDevices')}</p>
                    {/if}
                </div>
            {/if}
        </div>

        <div class="modal-actions">
            <Button variant="outline" onclick={handleClose} disabled={isSigning}>
                {$_('common.cancel')}
            </Button>
        </div>
    </div>
</Modal>

<style lang="scss">
    .modal-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 24px;
        max-height: 70vh;
    }

    .modal-title {
        font-size: 20px;
        font-weight: 700;
        color: var(--color-content-text-inverted);
        margin: 0;
    }

    .error-banner {
        padding: 12px;
        background: var(--color-error-background);
        border-radius: 8px;
        color: var(--color-error-text);
        font-size: var(--font-size-medium);
        text-align: center;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 32px 16px;
    }

    .icon-wrapper {
        :global(svg) {
            width: 48px;
            height: 48px;
            fill: var(--color-content-text-secondary);
        }
    }

    .empty-text {
        font-size: var(--font-size-medium);
        color: var(--color-content-text-secondary);
        text-align: center;
        margin: 0;
    }

    .device-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
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
        margin: 0;
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
            width: 20px;
            height: 20px;
        }
    }

    .empty-message {
        font-size: var(--font-size-medium);
        color: var(--color-content-text-secondary);
        padding: 12px;
        text-align: center;
        margin: 0;
    }

    .modal-actions {
        display: flex;
        gap: 8px;
        
        :global(button) {
            flex: 1;
        }
    }
</style>
