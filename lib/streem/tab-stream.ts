import type { ReqBody } from './message';
import { Runtime } from "lib/runtime";
import { MTypeTabContent } from './keys';

export class TabStream {
    constructor(public readonly eventName: string) {}

    listen(cb: (payload: ReqBody) => void) {
        globalThis.document?.addEventListener(this.eventName, (event: Event) => {
            const detail = (event as CustomEvent).detail;
            if (detail) {
                try {
                    cb(JSON.parse(detail));
                } catch (e) {
                    console.error("Error parsing event detail", e, event);
                }
            }
        });
    }

    send<T>(data: ReqBody<T>, to: string) {
        data.from = this.eventName;
        if (Object.values(MTypeTabContent).includes(to)) {
            this.#dispatch(JSON.stringify(data), to);
        }
    }

    #dispatch(data: string, to: string) {
        globalThis.document?.dispatchEvent(this.#getEvent(data, to));
    }

    #getEvent(detail: string, to: string) {
        return new CustomEvent(to, { detail });
    }

    async sendSignalToTab(tabId: number, message: ReqBody): Promise<void> {
        try {
            await Runtime.tabs.sendMessage(tabId, message);
        } catch (error) {
            console.error(`Failed to send signal to tab ${tabId}:`, error);
            throw error; 
        }
    }

    async sendToAllTabs(message: ReqBody, excludedTabIds: number[] = []): Promise<void> {
        try {
            const tabs = await Runtime.tabs.query({});
            for (const tab of tabs) {
                if (tab?.id && !excludedTabIds.includes(tab.id)) {
                    await Runtime.tabs.sendMessage(tab.id, message);
                }
            }
        } catch (error) {
            console.error("Failed to send message to all tabs:", error);
            throw error; 
        }
    }
}
