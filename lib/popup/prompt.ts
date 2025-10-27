import { Runtime } from "lib/runtime";
import { Common } from "config/common";
import { TypeOf } from "lib/types";

export class PromptService {
  readonly #height: number = Common.POPUP_HEIGHT;
  readonly #width: number = Common.POPUP_WIDTH;
  readonly #type = "popup";

  #enabled: boolean;
  #currentPopupId?: number;

  get enabled(): boolean {
    return this.#enabled;
  }

  constructor(enabled: boolean) {
    this.#enabled = enabled;
  }

  async open(route?: string): Promise<number | undefined> {
    if (!this.#enabled) return undefined;

    await this.#closeExistingPopups();

    const url = route 
      ? `${Common.PROMT_PAGE}#${route}`
      : Common.PROMT_PAGE;

    return new Promise((resolve, reject) => {
      Runtime.windows.create(
        {
          type: this.#type,
          url,
          width: this.#width,
          height: this.#height,
          focused: true,
        },
        (window) => {
          if (Runtime.runtime.lastError) {
            reject(Runtime.runtime.lastError);
            return;
          }
          
          if (window?.id) {
            this.#currentPopupId = window.id;
            resolve(window.id);
          } else {
            reject(new Error("Failed to create popup window"));
          }
        }
      );
    });
  }

  openTab(route?: string): void {
    const url = route 
      ? `${Common.PROMT_PAGE}#${route}`
      : Common.PROMT_PAGE;

    Runtime.tabs.create({ url });
  }

  async close(): Promise<void> {
    if (!this.#currentPopupId) return;

    return new Promise((resolve) => {
      Runtime.windows.remove(this.#currentPopupId!, () => {
        this.#currentPopupId = undefined;
        resolve();
      });
    });
  }

  async focus(): Promise<void> {
    if (!this.#currentPopupId) return;

    return new Promise((resolve, reject) => {
      if (!TypeOf.isUndefined(this.#currentPopupId)) {
        Runtime.windows.update(
          this.#currentPopupId!,
          { focused: true },
          () => {
            if (Runtime.runtime.lastError) {
              reject(Runtime.runtime.lastError);
            } else {
              resolve();
            }
          }
        );
      }
    });
  }

  async #closeExistingPopups(): Promise<void> {
    const popups = await this.#getPopups();

    const closePromises = popups.map(popup => 
      new Promise<void>((resolve) => {
        if (popup.id) {
          Runtime.windows.remove(popup.id, () => resolve());
        } else {
          resolve();
        }
      })
    );

    await Promise.all(closePromises);
    this.#currentPopupId = undefined;
  }

  #getPopups(): Promise<chrome.windows.Window[]> {
    return new Promise((resolve) => {
      Runtime.windows.getAll({}, (windows) => {
        const popups = windows.filter(w => w.type === this.#type);
        resolve(popups);
      });
    });
  }
}
