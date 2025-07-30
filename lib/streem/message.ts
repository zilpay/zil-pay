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
        for (let i = 0; i < 10; i++) {
            try {
                const res = await this.#trySend();
                if (res) return res;
            } catch {}
        }
        throw new Error("service_worker_stopped");
    }

    #trySend(): Promise<T> {
        return new Promise((resolve) => {
            let data = JSON.parse(JSON.stringify(this.body));
            Runtime.runtime.sendMessage(data, resolve);
        });
    }
}
