import type { ReqBody } from './message';
import { Runtime } from "lib/runtime";

export class TabsMessage<T = any> {
    constructor(public readonly body: ReqBody<T>) {}

    static async getTabs(): Promise<chrome.tabs.Tab[]> {
        return Runtime.tabs.query({});
    }

    async signal(domain: string): Promise<string> {
        const tabs = await Runtime.tabs.query({ 
            active: true, 
            currentWindow: true 
        });
        
        const tab = tabs[0];
        
        if (!tab?.id || !tab.url) {
            throw new Error("no active tabs");
        }

        const { hostname } = new URL(tab.url);

        if (hostname !== domain) {
            throw new Error("invalid domain");
        }

        try {
            await Runtime.tabs.sendMessage(tab.id, this.body);
            return "";
        } catch (error) {
            throw new Error(`Failed to send message: ${error}`);
        }
    }

    async send(...domains: string[]): Promise<void> {
        if (domains.length === 0) {
            return;
        }

        const tabs = await TabsMessage.getTabs();
        const validTabs = tabs.filter(tab => 
            tab?.id && 
            tab.url && 
            this.#isValidUrl(tab.url)
        );

        for (const tab of validTabs) {
            try {
                const hostname = new URL(tab.url!).hostname;
                
                if (!domains.includes(hostname)) {
                    continue;
                }

                await Runtime.tabs.sendMessage(tab.id!, this.body);
            } catch (err) {
                if (this.#isConnectionError(err)) {
                    continue;
                }
                
                console.error(`Failed to send message to tab ${tab.id}:`, err);
            }
        }
    }

    async sendAll(): Promise<void> {
        const tabs = await TabsMessage.getTabs();
        const validTabs = tabs.filter(tab => 
            tab?.id && 
            tab.url && 
            this.#isValidUrl(tab.url)
        );

        for (const tab of validTabs) {
            try {
                await Runtime.tabs.sendMessage(tab.id!, this.body);
            } catch (err) {
                if (this.#isConnectionError(err)) {
                    continue;
                }
                
                console.error(`Failed to send message to tab ${tab.id}:`, err);
            }
        }
    }

    #isValidUrl(url: string): boolean {
        const invalidPrefixes = [
            "chrome://",
            "about:",
            "edge://",
            "chrome-extension://",
            "moz-extension://",
        ];

        return !invalidPrefixes.some(prefix => url.startsWith(prefix));
    }

    #isConnectionError(error: unknown): boolean {
        if (!(error instanceof Error)) {
            return false;
        }

        const message = error.message.toLowerCase();
        
        return (
            message.includes("receiving end does not exist") ||
            message.includes("could not establish connection") ||
            message.includes("message port closed") ||
            message.includes("tab was closed") ||
            message.includes("no tab with id")
        );
    }
}
