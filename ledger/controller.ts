import { LEDGER_USB_VENDOR_ID } from 'config/ledger';
import { ScillaLedgerInterface } from 'ledger/scilla';
import { EthLedgerInterface } from 'ledger/eth';
import TransportWebHID from 'ledger/webhid';
import TransportWebBLE from 'ledger/webble';
import type { LedgerPublicAddress, EthSignature } from 'types/ledger';
import { ETHEREUM } from 'config/slip44';
import { hexToUint8Array } from 'lib/utils/hex';
import type { IChainConfigState } from 'background/storage';

export enum DeviceType {
    USB = 0,
    Bluetooth = 1
}

export interface LedgerDevice {
    id: string;
    name: string;
    type: DeviceType;
    raw: HIDDevice | BluetoothDevice;
}

export interface LedgerSupport {
    usb: boolean;
    ble: boolean;
}

type LedgerInterface = ScillaLedgerInterface | EthLedgerInterface;
type LedgerTransport = TransportWebHID | TransportWebBLE;

function isHIDDevice(device: HIDDevice | BluetoothDevice): device is HIDDevice {
    return 'vendorId' in device;
}

class LedgerController {
    private transport: LedgerTransport | null = null;
    private interface: LedgerInterface | null = null;
    private device: LedgerDevice | null = null;
    private currentChain: IChainConfigState | null = null;

    async checkSupport(): Promise<LedgerSupport> {
        const [ble, usb] = await Promise.all([
            TransportWebBLE.isSupported(),
            TransportWebHID.isSupported()
        ]);
        return { usb, ble };
    }

    async findUSBDevices(): Promise<LedgerDevice[]> {
        await window.navigator.hid.requestDevice({
            filters: [{ vendorId: LEDGER_USB_VENDOR_ID }]
        });
        const permitted = await window.navigator.hid.getDevices();
        const ledgers = permitted.filter(d => d.vendorId === LEDGER_USB_VENDOR_ID);
        
        return ledgers.map(d => ({
            id: `usb-${d.productId}`,
            name: d.productName || 'Ledger Device',
            type: DeviceType.USB,
            raw: d
        }));
    }

    async getPermittedUSBDevices(): Promise<LedgerDevice[]> {
        const permitted = await window.navigator.hid.getDevices();
        const ledgers = permitted.filter(d => d.vendorId === LEDGER_USB_VENDOR_ID);
        
        return ledgers.map(d => ({
            id: `usb-${d.productId}`,
            name: d.productName || 'Ledger Device',
            type: DeviceType.USB,
            raw: d
        }));
    }

    async findBLEDevices(): Promise<LedgerDevice[]> {
        return new Promise((resolve) => {
            const found: LedgerDevice[] = [];
            TransportWebBLE.listen({
                next: (event) => {
                    if (event.type === 'add') {
                        const device = event.descriptor as BluetoothDevice;
                        found.push({
                            id: `ble-${device.id}`,
                            name: device.name || 'Ledger Bluetooth',
                            type: DeviceType.Bluetooth,
                            raw: device
                        });
                    }
                },
                error: () => resolve([]),
                complete: () => resolve(found)
            });
        });
    }

    async connect(device: LedgerDevice, chain: IChainConfigState): Promise<void> {
        this.device = device;
        this.currentChain = chain;

        let tempTransport: LedgerTransport;

        if (device.type === DeviceType.USB && isHIDDevice(device.raw)) {
            tempTransport = await TransportWebHID.openDevice(device.raw);
        } else {
            tempTransport = await TransportWebBLE.create();
        }

        let determinedInterface: LedgerInterface | null = null;

        try {
            const scillaInterface = new ScillaLedgerInterface(tempTransport);
            await scillaInterface.getVersion();
            determinedInterface = scillaInterface;
        } catch (scillaError) {
            try {
                const ethInterface = new EthLedgerInterface(tempTransport);
                await ethInterface.getAppConfiguration();
                determinedInterface = ethInterface;
            } catch (ethError) {
                await tempTransport.close();
                throw new Error('Failed to detect Ledger app');
            }
        }

        this.transport = tempTransport;
        this.interface = determinedInterface;
    }

    async disconnect(): Promise<void> {
        if (this.transport) {
            await this.transport.close();
        }
        this.transport = null;
        this.interface = null;
        this.device = null;
        this.currentChain = null;
    }

    async generateAccounts(count: number, startIndex: number = 0): Promise<LedgerPublicAddress[]> {
        if (!this.interface || !this.currentChain) {
            throw new Error('Not connected');
        }

        const accounts: LedgerPublicAddress[] = [];

        if (this.interface instanceof ScillaLedgerInterface) {
            for (let i = 0; i < count; i++) {
                const index = startIndex + i;
                const account = await this.interface.getPublicAddress(index);
                account.name = `Account ${index + 1}`;
                accounts.push(account);
            }
        } else if (this.interface instanceof EthLedgerInterface) {
            const slip44 = this.currentChain.slip44 ?? ETHEREUM;
            for (let i = 0; i < count; i++) {
                const index = startIndex + i;
                const path = `44'/${slip44}'/0'/0/${index}`;
                const account = await this.interface.getAddress(path, false);
                account.name = `Account ${index + 1}`;
                accounts.push(account);
            }
        }

        return accounts;
    }

    async signMessage(message: string, accountIndex: number): Promise<string> {
        if (!this.interface || !this.currentChain) {
            throw new Error('Not connected');
        }

        if (this.interface instanceof ScillaLedgerInterface) {
            const signature = await this.interface.signHash(accountIndex, { hash: message });
            return signature;
        } else {
            throw new Error('Scilla message signing not supported on Ethereum app');
        }
    }

    async signPersonalMessage(message: string, accountIndex: number): Promise<EthSignature> {
        if (!this.interface || !this.currentChain) {
            throw new Error('Not connected');
        }

        if (this.interface instanceof EthLedgerInterface) {
            const slip44 = this.currentChain.slip44 ?? ETHEREUM;
            const path = `44'/${slip44}'/0'/0/${accountIndex}`;
            const messageBytes = hexToUint8Array(message);
            const signature = await this.interface.signPersonalMessage(path, messageBytes);
            return signature;
        } else {
            throw new Error('Personal message signing not supported on Zilliqa app');
        }
    }

    async signEIP712Message(domainHash: string, messageHash: string, accountIndex: number): Promise<EthSignature> {
        if (!this.interface || !this.currentChain) {
            throw new Error('Not connected');
        }

        if (this.interface instanceof EthLedgerInterface) {
            const slip44 = this.currentChain.slip44 ?? ETHEREUM;
            const path = `44'/${slip44}'/0'/0/${accountIndex}`;
            const domainHashBytes = hexToUint8Array(domainHash);
            const messageHashBytes = hexToUint8Array(messageHash);
            const signature = await this.interface.signEIP712Message(path, domainHashBytes, messageHashBytes);
            return signature;
        } else {
            throw new Error('EIP712 signing not supported on Zilliqa app');
        }
    }

    get isConnected(): boolean {
        return this.transport !== null && this.interface !== null;
    }

    get currentDevice(): LedgerDevice | null {
        return this.device;
    }

    get currentInterface(): LedgerInterface | null {
        return this.interface;
    }

    get isScillaApp(): boolean {
        return this.interface instanceof ScillaLedgerInterface;
    }

    get isEthApp(): boolean {
        return this.interface instanceof EthLedgerInterface;
    }
}

export const ledgerController = new LedgerController();
