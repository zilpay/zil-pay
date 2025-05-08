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

    send(data: ReqBody, to: string) {
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

    /**
     * Sends a signal message to the specified tab.
     * @param tabId - The ID of the tab.
     * @param message - The message to send.
     */
    async sendSignalToTab(tabId: number, message: ReqBody): Promise<void> {
        try {
            await Runtime.tabs.sendMessage(tabId, message);
        } catch (error) {
            console.error(`Failed to send signal to tab ${tabId}:`, error);
            throw error; // Re-throw the error to be handled by the caller
        }
    }

    /**
      * Sends message to all tabs except the excluded tabIds
      * @param message
      * @param excludedTabIds
      */
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
            throw error; // Re-throw the error
        }
    }
}
