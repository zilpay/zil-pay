import { Runtime } from "lib/runtime/extensionizer";


export interface ReqBody<T = unknown> {
    type: string;
    payload?: T;
    domain?: string;
    from?: string;
}

export class Message<T = unknown> {
    constructor(public readonly body: ReqBody<T>) {}

    static signal(type: string): Message<object> {
        return new Message({ type });
    }

    async send(): Promise<T> {
        for (let i = 0; i < 100; i++) {
            try {
                const res = await this.#trySend();
                if (res) return res;
            } catch {}
        }
        throw new Error("service_worker_stopped");
    }

    #trySend(): Promise<T> {
        return new Promise((resolve, reject) => {
            try {
                Runtime.sendMessage(this.body)
                  .then(resolve)
                  .catch((err: Error) => {
                    console.error(this, err);
                    window.location.reload();
                    reject(err);
                  });
            } catch (err) {
                console.error(this, err);
                window.location.reload();
                reject(err);
            }
        });
    }
}
