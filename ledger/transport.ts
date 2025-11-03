import { concatUint8Arrays, readUInt16BE } from 'lib/utils/bytes';
import type { DeviceModel } from '@ledgerhq/devices';
import {
  TransportRaceCondition,
  TransportError,
  StatusCodes,
  TransportStatusError,
} from './errors';

export type Subscription = {
  unsubscribe: () => void;
};

export type Device = unknown;

export type DescriptorEventType = 'add' | 'remove';

export interface DescriptorEvent<Descriptor> {
  type: DescriptorEventType;
  descriptor: Descriptor;
  deviceModel?: DeviceModel | null | undefined;
  device?: Device;
}

export type Observer<EventType, EventError = unknown> = Readonly<{
  next: (event: EventType) => unknown;
  error: (e: EventError) => unknown;
  complete: () => unknown;
}>;

class EventEmitter {
  private events: Map<string, Array<(...args: unknown[]) => unknown>> = new Map();

  on(eventName: string, cb: (...args: unknown[]) => unknown): void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName)!.push(cb);
  }

  removeListener(eventName: string, cb: (...args: unknown[]) => unknown): void {
    const listeners = this.events.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(cb);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: unknown[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(cb => cb(...args));
    }
  }
}

export default class Transport {
  exchangeTimeout = 30000;
  unresponsiveTimeout = 15000;
  deviceModel: DeviceModel | null | undefined = null;

  static readonly isSupported: () => Promise<boolean>;
  static readonly list: () => Promise<unknown[]>;
  static readonly listen: (observer: Observer<DescriptorEvent<unknown>>) => Subscription;
  static readonly open: (descriptor?: unknown, timeoutMs?: number) => Promise<Transport>;

  exchange(
    _apdu: Uint8Array,
    { abortTimeoutMs: _abortTimeoutMs }: { abortTimeoutMs?: number } = {},
  ): Promise<Uint8Array> {
    throw new Error('exchange not implemented');
  }

  exchangeBulk(apdus: Uint8Array[], observer: Observer<Uint8Array>): Subscription {
    let unsubscribed = false;
    const unsubscribe = () => {
      unsubscribed = true;
    };

    const main = async () => {
      if (unsubscribed) return;
      for (const apdu of apdus) {
        const r = await this.exchange(apdu);
        if (unsubscribed) return;
        const status = readUInt16BE(r, r.length - 2);
        if (status !== StatusCodes.OK) {
          throw new TransportStatusError(status);
        }
        observer.next(r);
      }
    };

    main().then(
      () => !unsubscribed && observer.complete(),
      e => !unsubscribed && observer.error(e),
    );

    return { unsubscribe };
  }

  setScrambleKey(_key: string) {}

  close(): Promise<void> {
    return Promise.resolve();
  }

  _events = new EventEmitter();

  on(eventName: string, cb: (...args: unknown[]) => unknown): void {
    this._events.on(eventName, cb);
  }

  off(eventName: string, cb: (...args: unknown[]) => unknown): void {
    this._events.removeListener(eventName, cb);
  }

  emit(event: string, ...args: unknown[]): void {
    this._events.emit(event, ...args);
  }

  setExchangeTimeout(exchangeTimeout: number): void {
    this.exchangeTimeout = exchangeTimeout;
  }

  setExchangeUnresponsiveTimeout(unresponsiveTimeout: number): void {
    this.unresponsiveTimeout = unresponsiveTimeout;
  }

  send = async (
    cla: number,
    ins: number,
    p1: number,
    p2: number,
    data: Uint8Array = new Uint8Array(0),
    statusList: number[] = [StatusCodes.OK],
    { abortTimeoutMs }: { abortTimeoutMs?: number } = {},
  ): Promise<Uint8Array> => {
    if (data.length >= 256) {
      throw new TransportError(
        'data.length exceed 256 bytes limit. Got: ' + data.length,
        'DataLengthTooBig',
      );
    }

    const response = await this.exchange(
      concatUint8Arrays(
        new Uint8Array([cla, ins, p1, p2]),
        new Uint8Array([data.length]),
        data
      ),
      { abortTimeoutMs },
    );
    const sw = readUInt16BE(response, response.length - 2);

    if (!statusList.some(s => s === sw)) {
      throw new TransportStatusError(sw);
    }

    return response;
  };

  static create(openTimeout = 3000, listenTimeout?: number): Promise<Transport> {
    return new Promise((resolve, reject) => {
      let found = false;
      const sub = this.listen({
        next: e => {
          found = true;
          if (sub) sub.unsubscribe();
          if (listenTimeoutId) clearTimeout(listenTimeoutId);
          this.open(e.descriptor, openTimeout).then(resolve, reject);
        },
        error: e => {
          if (listenTimeoutId) clearTimeout(listenTimeoutId);
          reject(e);
        },
        complete: () => {
          if (listenTimeoutId) clearTimeout(listenTimeoutId);

          if (!found) {
            reject(new TransportError(this.ErrorMessage_NoDeviceFound, 'NoDeviceFound'));
          }
        },
      });
      const listenTimeoutId = listenTimeout
        ? setTimeout(() => {
            sub.unsubscribe();
            reject(new TransportError(this.ErrorMessage_ListenTimeout, 'ListenTimeout'));
          }, listenTimeout)
        : null;
    });
  }

  exchangeBusyPromise: Promise<void> | null | undefined;

  async exchangeAtomicImpl<O>(f: () => Promise<O>): Promise<O> {
    if (this.exchangeBusyPromise) {
      throw new TransportRaceCondition(
        'An action was already pending on the Ledger device. Please deny or reconnect.',
      );
    }

    let resolveBusy: (() => void) | undefined;
    const busyPromise: Promise<void> = new Promise(r => {
      resolveBusy = r;
    });
    this.exchangeBusyPromise = busyPromise;

    let unresponsiveReached = false;
    const timeout = setTimeout(() => {
      unresponsiveReached = true;
      this.emit('unresponsive');
    }, this.unresponsiveTimeout);

    try {
      const res = await f();

      if (unresponsiveReached) {
        this.emit('responsive');
      }

      return res;
    } finally {
      clearTimeout(timeout);
      if (resolveBusy) resolveBusy();
      this.exchangeBusyPromise = null;
    }
  }

  decorateAppAPIMethods(self: Record<string, any>, methods: string[], scrambleKey: string) {
    for (const methodName of methods) {
      self[methodName] = this.decorateAppAPIMethod(
        methodName,
        self[methodName] as (...args: any[]) => Promise<any>,
        self,
        scrambleKey
      );
    }
  }

  _appAPIlock: string | null = null;

  decorateAppAPIMethod<R, A extends unknown[]>(
    methodName: string,
    f: (...args: A) => Promise<R>,
    ctx: unknown,
    scrambleKey: string,
  ): (...args: A) => Promise<R> {
    return async (...args) => {
      const { _appAPIlock } = this;

      if (_appAPIlock) {
        return Promise.reject(
          new TransportError('Ledger Device is busy (lock ' + _appAPIlock + ')', 'TransportLocked'),
        );
      }

      try {
        this._appAPIlock = methodName;
        this.setScrambleKey(scrambleKey);
        return await f.apply(ctx, args);
      } finally {
        this._appAPIlock = null;
      }
    };
  }

  static ErrorMessage_ListenTimeout = 'No Ledger device found (timeout)';
  static ErrorMessage_NoDeviceFound = 'No Ledger device found';
}
