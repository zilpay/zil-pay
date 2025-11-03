import Transport from './transport';
import type { DeviceModel } from '@ledgerhq/devices';
import { getBluetoothServiceUuids, getInfosForServiceUuid } from '@ledgerhq/devices';
import {
  DisconnectedDevice,
  TransportOpenUserCancelled,
  TransportError
} from '@ledgerhq/errors';
import type { Subscription, Observer, DescriptorEvent, Device } from './transport';
import { concatUint8Arrays, readUInt16BE } from 'lib/utils/bytes';

const TagId = 0x05;

const requiresBluetooth = () => {
  const { bluetooth } = navigator as any;
  if (!bluetooth) throw new TransportError('Web Bluetooth not supported', 'BluetoothNotSupported');
  return bluetooth;
};

const isSupported = (): Promise<boolean> => 
  Promise.resolve()
    .then(requiresBluetooth)
    .then(() => true, () => false);

const requestDeviceParam = () => ({
  filters: getBluetoothServiceUuids().map(uuid => ({ services: [uuid] }))
});

async function retrieveService(device: BluetoothDevice) {
  if (!device.gatt) throw new TransportError('Bluetooth GATT not found', 'GATTNotFound');
  const [service] = await device.gatt.getPrimaryServices();
  if (!service) throw new TransportError('Bluetooth service not found', 'ServiceNotFound');
  const infos = getInfosForServiceUuid(service.uuid);
  if (!infos) throw new TransportError('Bluetooth service infos not found', 'ServiceInfosNotFound');
  return [service, infos] as const;
}

function createChunkedBuffers(
  buffer: Uint8Array,
  sizeForIndex: (index: number) => number
): Uint8Array[] {
  const chunks: Uint8Array[] = [];
  for (let i = 0, size = sizeForIndex(0); i < buffer.length; i += size, size = sizeForIndex(i)) {
    chunks.push(buffer.slice(i, i + size));
  }
  return chunks;
}

async function sendAPDU(
  write: (buffer: Uint8Array) => Promise<void>,
  apdu: Uint8Array,
  mtuSize: number
): Promise<void> {
  const toHex = (b: number) => b.toString(16).padStart(2, '0');
  console.log('[BLE] sendAPDU length:', apdu.length, 'hex:', Array.from(apdu).map(toHex).join(''), 'mtu:', mtuSize);

  const chunks = createChunkedBuffers(apdu, i => mtuSize - (i === 0 ? 5 : 3)).map((buffer, i) => {
    const head = new Uint8Array(i === 0 ? 5 : 3);
    head[0] = TagId;
    head[1] = (i >> 8) & 0xff;
    head[2] = i & 0xff;
    if (i === 0) {
      head[3] = (apdu.length >> 8) & 0xff;
      head[4] = apdu.length & 0xff;
    }
    return concatUint8Arrays(head, buffer);
  });

  console.log('[BLE] sendAPDU chunks count:', chunks.length);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log('[BLE] => chunk', i, ':', Array.from(chunk).map(toHex).join(''));
    await write(chunk);
  }

  console.log('[BLE] sendAPDU complete');
}

function monitorCharacteristic(characteristic: BluetoothRemoteGATTCharacteristic) {
  const queue: Uint8Array[] = [];
  const waiters: Array<(value: Uint8Array) => void> = [];

  const handler = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;
    
    const buffer = new Uint8Array(value.buffer);
    if (waiters.length > 0) {
      const resolve = waiters.shift()!;
      resolve(buffer);
    } else {
      queue.push(buffer);
    }
  };

  characteristic.addEventListener('characteristicvaluechanged', handler);

  const iterator: AsyncIterableIterator<Uint8Array> = {
    next(): Promise<IteratorResult<Uint8Array>> {
      if (queue.length > 0) {
        return Promise.resolve({ value: queue.shift()!, done: false });
      }
      return new Promise(resolve => {
        waiters.push(value => resolve({ value, done: false }));
      });
    },
    return(): Promise<IteratorResult<Uint8Array>> {
      characteristic.removeEventListener('characteristicvaluechanged', handler);
      return Promise.resolve({ value: undefined, done: true });
    },
    throw(error: any): Promise<IteratorResult<Uint8Array>> {
      characteristic.removeEventListener('characteristicvaluechanged', handler);
      return Promise.reject(error);
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };

  return iterator;
}

async function receiveAPDU(notifyObservable: AsyncIterableIterator<Uint8Array>): Promise<Uint8Array> {
  const toHex = (b: number) => b.toString(16).padStart(2, '0');
  console.log('[BLE] receiveAPDU: waiting for data...');
  let notifiedIndex = 0;
  let notifiedDataLength = 0;
  let notifiedData = new Uint8Array(0);

  while (true) {
    const result = await notifyObservable.next();
    if (result.done) {
      console.error('[BLE] Stream ended unexpectedly');
      throw new TransportError('BLE stream ended unexpectedly', 'UnexpectedEnd');
    }

    const value = result.value;
    console.log('[BLE] <= received:', Array.from(value).map(toHex).join(''));
    
    const tag = value[0];
    const chunkIndex = readUInt16BE(value, 1);
    let chunkData = value.slice(3);

    console.log('[BLE] receiveAPDU tag:', tag.toString(16), 'chunk:', chunkIndex, 'expected:', notifiedIndex, 'data len:', chunkData.length);

    if (tag !== TagId) {
      console.error('[BLE] Invalid tag:', tag.toString(16), 'expected:', TagId.toString(16));
      throw new TransportError(`Invalid tag ${tag.toString(16)}`, 'InvalidTag');
    }

    if (notifiedIndex !== chunkIndex) {
      console.error('[BLE] Invalid sequence:', chunkIndex, 'expected:', notifiedIndex);
      throw new TransportError(
        `Invalid sequence number. Received ${chunkIndex} but expected ${notifiedIndex}`,
        'InvalidSequence'
      );
    }

    if (chunkIndex === 0) {
      notifiedDataLength = readUInt16BE(chunkData, 0);
      chunkData = chunkData.slice(2);
      console.log('[BLE] First chunk, total length:', notifiedDataLength);
    }

    notifiedIndex++;
    const combined = concatUint8Arrays(notifiedData, chunkData);
    notifiedData = new Uint8Array(combined);

    console.log('[BLE] Progress:', notifiedData.length, '/', notifiedDataLength);

    if (notifiedData.length > notifiedDataLength) {
      console.error('[BLE] Too much data:', notifiedData.length, 'expected:', notifiedDataLength);
      throw new TransportError(
        `Received too much data. Got ${notifiedData.length} but expected ${notifiedDataLength}`,
        'BLETooMuchData'
      );
    }

    if (notifiedData.length === notifiedDataLength) {
      console.log('[BLE] receiveAPDU complete:', Array.from(notifiedData).map(toHex).join(''));
      return notifiedData;
    }
  }
}

const transportsCache = new Map<string, TransportWebBLE>();

async function open(deviceOrId: Device | string, needsReconnect: boolean): Promise<TransportWebBLE> {
  let device: BluetoothDevice;

  if (typeof deviceOrId === 'string') {
    const cached = transportsCache.get(deviceOrId);
    if (cached) return cached;
    
    const bluetooth = requiresBluetooth();
    device = await bluetooth.requestDevice(requestDeviceParam());
  } else {
    device = deviceOrId as unknown as BluetoothDevice;
  }

  if (!device.gatt?.connected) {
    await device.gatt?.connect();
  }

  const [service, infos] = await retrieveService(device);
  const { deviceModel, writeUuid, notifyUuid } = infos;
  const [writeC, notifyC] = await Promise.all([
    service.getCharacteristic(writeUuid),
    service.getCharacteristic(notifyUuid)
  ]);

  await notifyC.startNotifications();
  const notifyObservable = monitorCharacteristic(notifyC);
  const transport = new TransportWebBLE(device, writeC, notifyObservable, deviceModel);

  if (!device.gatt?.connected) {
    throw new DisconnectedDevice();
  }

  transportsCache.set(transport.id, transport);

  const onDisconnect = () => {
    transportsCache.delete(transport.id);
    transport.notYetDisconnected = false;
    transport.emit('disconnect', new DisconnectedDevice());
  };

  device.addEventListener('gattserverdisconnected', onDisconnect);

  const beforeMTUTime = Date.now();
  
  try {
    await transport.inferMTU();
  } finally {
    const afterMTUTime = Date.now();
    if (afterMTUTime - beforeMTUTime < 1000) {
      needsReconnect = false;
    }

    if (needsReconnect) {
      device.gatt?.disconnect();
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  }

  if (needsReconnect) {
    return open(device, false);
  }

  return transport;
}

export default class TransportWebBLE extends Transport {
  id: string;
  device: BluetoothDevice;
  mtuSize = 20;
  writeCharacteristic: BluetoothRemoteGATTCharacteristic;
  notifyObservable: AsyncIterableIterator<Uint8Array>;
  notYetDisconnected = true;
  deviceModel: DeviceModel;

  constructor(
    device: BluetoothDevice,
    writeCharacteristic: BluetoothRemoteGATTCharacteristic,
    notifyObservable: AsyncIterableIterator<Uint8Array>,
    deviceModel: DeviceModel
  ) {
    super();
    this.id = device.id;
    this.device = device;
    this.writeCharacteristic = writeCharacteristic;
    this.notifyObservable = notifyObservable;
    this.deviceModel = deviceModel;
  }

  static isSupported = isSupported;

  static list = (): Promise<Device[]> => Promise.resolve([]);

  static listen = (observer: Observer<DescriptorEvent<Device>>): Subscription => {
    let unsubscribed = false;
    const bluetooth = requiresBluetooth();

    bluetooth.requestDevice(requestDeviceParam()).then(
      (device: BluetoothDevice) => {
        if (!unsubscribed) {
          observer.next({
            type: 'add',
            descriptor: device as unknown as Device
          });
          observer.complete();
        }
      },
      (error: Error) => {
        observer.error(new TransportOpenUserCancelled(error.message));
      }
    );

    return {
      unsubscribe: () => {
        unsubscribed = true;
      }
    };
  };

  static async create(): Promise<TransportWebBLE> {
    const bluetooth = requiresBluetooth();
    const device = await bluetooth.requestDevice(requestDeviceParam());
    return open(device as unknown as Device, true);
  }

  static async disconnect(id: string): Promise<void> {
    const transport = transportsCache.get(id);
    if (transport?.device?.gatt) {
      transport.device.gatt.disconnect();
    }
  }

  async inferMTU(): Promise<number> {
    console.log('[BLE] inferMTU: start');
    let mtu = 23;

    await this.exchangeAtomicImpl(async () => {
      try {
        console.log('[BLE] inferMTU: sending 0x08 command');
        await this.write(new Uint8Array([0x08, 0, 0, 0, 0]));
        
        console.log('[BLE] inferMTU: waiting for response');
        const result = await this.notifyObservable.next();
        console.log('[BLE] inferMTU: received', result);
        
        if (!result.done && result.value[0] === 0x08) {
          mtu = result.value[5] + 3;
          console.log('[BLE] inferMTU: calculated mtu', mtu);
        }
      } catch (e) {
        console.error('[BLE] inferMTU: error', e);
        if (this.device.gatt) {
          this.device.gatt.disconnect();
        }
        throw e;
      }
    });

    if (mtu > 23) {
      this.mtuSize = mtu - 3;
    }

    console.log('[BLE] inferMTU: final mtuSize', this.mtuSize);
    return this.mtuSize;
  }

  async exchange(apdu: Uint8Array): Promise<Uint8Array> {
    console.log('[BLE] exchange: start');
    const result = await this.exchangeAtomicImpl(async () => {
      try {
        const responsePromise = receiveAPDU(this.notifyObservable);
        await sendAPDU(this.write, apdu, this.mtuSize);
        return await responsePromise;
      } catch (e) {
        console.error('[BLE] exchange: error', e);
        if (this.notYetDisconnected && this.device.gatt) {
          this.device.gatt.disconnect();
        }
        throw e;
      }
    });

    console.log('[BLE] exchange: complete');
    return result as Uint8Array;
  }

  write = async (buffer: Uint8Array): Promise<void> => {
    await this.writeCharacteristic.writeValue(buffer as BufferSource);
  };

  async close(): Promise<void> {
    if (this.exchangeBusyPromise) {
      await this.exchangeBusyPromise;
    }
  }
}
