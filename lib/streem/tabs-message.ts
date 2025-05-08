import type { ReqBody } from './message';
import { Runtime } from "lib/runtime";


export class TabsMessage<T = any> {
    constructor(public readonly body: ReqBody<T>) {}

    static async getTabs(): Promise<chrome.tabs.Tab[]> {
        return Runtime.tabs.query({});
    }

    async signal(domain: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            Runtime.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
                const tab = tabs[0];
                if (!tab) {
                    reject(new Error("no active tabs"));
                    return;
                }

                const { hostname } = new URL(tab.url!);

                if (hostname !== domain) {
                    reject(new Error("invalid domain"));
                    return;
                }
                Runtime.tabs.sendMessage(Number(tab.id), this.body)
                    .then(() => resolve(""))
                    .catch(reject);
            });
        });
    }



    async send(...domains: string[]): Promise<void> {
        const tabs = await TabsMessage.getTabs();

        tabs.forEach(async (tab) => {
            if (tab?.url && domains.includes(new URL(tab.url).hostname)) {
                try {
                    await Runtime.tabs.sendMessage(Number(tab.id), this.body);
                } catch (err) {
                    console.error(`Failed to send message to tab ${tab.id}`, err);
                }
            }
        });
    }

    async sendAll(): Promise<void> {
        const tabs = (await TabsMessage.getTabs())
            .filter((tab) => tab?.url && !tab.url.startsWith("chrome://"));

        try {
            for (const tab of tabs) {
                await Runtime.tabs.sendMessage(Number(tab.id), this.body);
            }
        } catch (err) {
            console.error("TabsMessage", err);
        }
    }
}
