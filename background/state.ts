import { BackgroundState } from 'background/storage';
import { BrowserStorage } from 'lib/storage';

export class GlobalState {
  readonly #state: BackgroundState;

  static async fromStorage() {
    const records = await BrowserStorage.getAll();
    const state = new BackgroundState(records);

    return new GlobalState(state);
  }

  constructor(initialState: BackgroundState) {
      this.#state = initialState;
  }

  async save() {
  }
}
