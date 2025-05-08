import type { ReqBody } from './message';
import type { TabStream } from './tab-stream';

export class SecureContentMessage<T = unknown> {
    constructor(public readonly body: ReqBody<T>) {}

    get type() { return this.body.type; }
    get payload() { return this.body.payload; }

    send(stream: TabStream, recipient: string) {
        stream.send(this.body, recipient);
    }
}
