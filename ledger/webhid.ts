import Transport from './transport';
import { LEDGER_USB_VENDOR_ID } from 'config/ledger';
import hidFraming from './framinghid';
import { identifyUSBProductId } from '@ledgerhq/devices';
import type { DeviceModel } from '@ledgerhq/devices';
import { 
  TransportOpenUserCancelled,
  DisconnectedDeviceDuringOperation,
  DisconnectedDevice,
  TransportError
} from '@ledgerhq/errors';
import type { Subscription, Observer, DescriptorEvent } from './transport';

const ledgerDevices = [{ vendorId: LEDGER_USB_VENDOR_ID }];

const isSupported = () => Promise.resolve(!!(window.navigator && window.navigator.hid));

const getHID = (): HID => {
  const { hid } = navigator as any;
  if (!hid) throw new TransportError('navigator.hid is not supported', 'HIDNotSupported');
  return hid;
};

async function requestLedgerDevices(): Promise<HIDDevice[]> {
  const device = await getHID().requestDevice({ filters: ledgerDevices });
  if (Array.isArray(device)) return device;
  return [device];
}

async function getLedgerDevices(): Promise<HIDDevice[]> {
  const devices = await getHID().getDevices();
  return devices.filter(d => d.vendorId === LEDGER_USB_VENDOR_ID);
}

async function getFirstLedgerDevice(): Promise<HIDDevice> {
  const existingDevices = await getLedgerDevices();
  if (existingDevices.length > 0) return existingDevices[0];
  const devices = await requestLedgerDevices();
  return devices[0];
}

export default class TransportWebHID extends Transport {
  device: HIDDevice;
  deviceModel: DeviceModel | null | undefined;
  channel = Math.floor(Math.random() * 0xffff);
  packetSize = 64;
  inputs: Uint8Array[] = [];
  inputCallback: ((arg0: Uint8Array) => void) | null | undefined;
  _disconnectEmitted = false;

  constructor(device: HIDDevice) {
    super();
    this.device = device;
    this.deviceModel = typeof device.productId === 'number' 
      ? identifyUSBProductId(device.productId) 
      : undefined;
    device.addEventListener('inputreport', this.onInputReport);
  }

  read = (): Promise<Uint8Array> => {
    if (this.inputs.length) {
      return Promise.resolve(this.inputs.shift()!);
    }
    return new Promise(success => {
      this.inputCallback = success;
    });
  };

  onInputReport = (e: HIDInputReportEvent) => {
    const buffer = new Uint8Array(e.data.buffer);
    if (this.inputCallback) {
      this.inputCallback(buffer);
      this.inputCallback = null;
    } else {
      this.inputs.push(buffer);
    }
  };

  static isSupported = isSupported;
  static list = getLedgerDevices;

  static listen = (observer: Observer<DescriptorEvent<HIDDevice>>): Subscription => {
    let unsubscribed = false;
    getFirstLedgerDevice().then(
      device => {
        if (!device) {
          observer.error(new TransportOpenUserCancelled('Access denied to use Ledger device'));
        } else if (!unsubscribed) {
          const deviceModel = typeof device.productId === 'number'
            ? identifyUSBProductId(device.productId)
            : undefined;
          observer.next({
            type: 'add',
            descriptor: device,
            deviceModel
          });
          observer.complete();
        }
      },
      error => {
        observer.error(new TransportOpenUserCancelled(error.message));
      }
    );
    return {
      unsubscribe: () => {
        unsubscribed = true;
      }
    };
  };

  static async request() {
    const [device] = await requestLedgerDevices();
    return TransportWebHID.openDevice(device);
  }

  static async create() {
    const devices = await getLedgerDevices();
    if (devices.length === 0) {
      const [device] = await requestLedgerDevices();
      return TransportWebHID.openDevice(device);
    }
    return TransportWebHID.openDevice(devices[0]);
  }

  static async openConnected() {
    const devices = await getLedgerDevices();
    if (devices.length === 0) return null;
    return TransportWebHID.openDevice(devices[0]);
  }

  static async openDevice(device: HIDDevice) {
    if (device.opened) {
      await device.close();
    }

    await device.open();
    const transport = new TransportWebHID(device);
    const onDisconnect = (e: HIDConnectionEvent) => {
      if (device === e.device) {
        getHID().removeEventListener('disconnect', onDisconnect);
        transport._emitDisconnect(new DisconnectedDevice());
      }
    };
    getHID().addEventListener('disconnect', onDisconnect);
    return transport;
  }

  _emitDisconnect = (e: Error) => {
    if (this._disconnectEmitted) return;
    this._disconnectEmitted = true;
    this.emit('disconnect', e);
  };

  async close(): Promise<void> {
    await this.exchangeBusyPromise;
    this.device.removeEventListener('inputreport', this.onInputReport);
    await this.device.close();
  }

  exchange = async (apdu: Uint8Array): Promise<Uint8Array> => {
    const b = await this.exchangeAtomicImpl(async () => {
      const { channel, packetSize } = this;
      const framing = hidFraming(channel, packetSize);
      const blocks = framing.makeBlocks(apdu);

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const buffer = block.buffer.slice(block.byteOffset, block.byteOffset + block.byteLength);
        await this.device.sendReport(0, buffer as BufferSource);
      }

      let result;
      let acc;

      while (!(result = framing.getReducedResult(acc))) {
        try {
          const buffer = await this.read();
          acc = framing.reduceResponse(acc, buffer);
        } catch (e) {
          if (e instanceof TransportError && e.id === 'InvalidChannel') {
            continue;
          }
          throw e;
        }
      }

      return result;
    }).catch(e => {
      if (e && e.message && e.message.includes('write')) {
        this._emitDisconnect(e);
        throw new DisconnectedDeviceDuringOperation(e.message);
      }
      throw e;
    });
    return b;
  };

  setScrambleKey() {}
}
